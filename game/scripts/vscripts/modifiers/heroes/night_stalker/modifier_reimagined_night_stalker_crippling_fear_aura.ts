import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_crippling_fear_silence_debuff } from "./modifier_reimagined_night_stalker_crippling_fear_silence_debuff";
import { modifier_reimagined_night_stalker_crippling_fear_fear_debuff } from "./modifier_reimagined_night_stalker_crippling_fear_fear_debuff";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";

@registerModifier()
export class modifier_reimagined_night_stalker_crippling_fear_aura extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_end: string = "Hero_Nightstalker.Trickling_Fear_end";
    particle_aura: string = "particles/units/heroes/hero_night_stalker/nightstalker_crippling_fear_aura.vpcf";
    particle_aura_fx?: ParticleID;
    debuff_modifier_name?: string;

    // Modifier specials
    radius?: number;

    // Reimagined specials
    roll_back_light_radius_inc_sec?: number;
    roll_back_light_interval?: number;
    roll_back_light_radius_per_interval?: number;

    // Talent specials
    hero_duration_extend?: number;
    unit_duration_extend?: number;

    IsHidden() {
        return false;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }

    OnCreated(): void {
        // Modifier properties

        this.ability = this.GetAbility()!;

        // Modifier specials
        this.radius = this.ability.GetSpecialValueFor("radius");

        // Reimagined specials
        this.roll_back_light_radius_inc_sec = this.ability.GetSpecialValueFor("roll_back_light_radius_inc_sec");
        this.roll_back_light_interval = this.ability.GetSpecialValueFor("roll_back_light_interval");

        // Set debuff modifier name
        this.debuff_modifier_name = modifier_reimagined_night_stalker_crippling_fear_silence_debuff.name;

        // Reimagined: Night Terror: may be set to autocast to fear enemies inside the AOE instead of silencing them
        this.ReimaginedNightTerror();

        this.particle_aura_fx = ParticleManager.CreateParticle(
            this.particle_aura,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.parent
        );
        ParticleManager.SetParticleControl(this.particle_aura_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControlEnt(
            this.particle_aura_fx,
            1,
            this.parent,
            ParticleAttachment.POINT_FOLLOW,
            AttachLocation.HITLOC,
            this.parent.GetAbsOrigin(),
            true
        );
        ParticleManager.SetParticleControl(this.particle_aura_fx, 2, Vector(this.radius, 0, this.radius));
        this.AddParticle(this.particle_aura_fx, false, false, -1, false, false);

        // Reimagined: Roll Back The Light: Area of effect increases over time at a rate of 50 per second.
        this.ReimaginedRollBackTheLight();
    }

    OnRefresh(): void {
        this.OnCreated();
    }

    OnDestroy(): void {
        // Play end sound
        EmitSoundOn(this.sound_end, this.parent);
    }

    ReimaginedNightTerror(): void {
        if (IsServer()) {
            // If auto cast is set to true, then the modifier should be changed to the fear modifier
            if (this.ability.GetAutoCastState()) {
                this.debuff_modifier_name = modifier_reimagined_night_stalker_crippling_fear_fear_debuff.name;
            }
        }
    }

    ReimaginedRollBackTheLight(): void {
        // Calculate radius increment rate
        this.roll_back_light_radius_per_interval =
            this.roll_back_light_radius_inc_sec! * this.roll_back_light_interval!;

        // Start thinking
        this.StartIntervalThink(this.roll_back_light_interval!);
    }

    OnIntervalThink(): void {
        // Increment radius continually every interval
        this.radius = this.radius! + this.roll_back_light_radius_per_interval!;

        // Set the control point of the particle to match the new radius
        ParticleManager.SetParticleControl(this.particle_aura_fx!, 2, Vector(this.radius!, this.radius!, this.radius!));
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_DEATH];
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (!IsServer()) return;

        // Feed The Night: Each enemy hero that dies while inside Crippling Fear extends its duration by x seconds. Units extends it by y instead.
        this.ReimaginedTalentFeedTheNight(event);
    }

    ReimaginedTalentFeedTheNight(event: ModifierInstanceEvent): void {
        if (HasTalent(this.parent, NightStalkerTalents.NightStalkerTalents_3)) {
            // Only apply if the killer is the parent
            if (event.attacker != this.parent) return;

            // Ignore illusions
            if (event.unit!.IsIllusion()) return;

            // Only apply if the unit had the aura debuff
            if (!event.unit!.HasModifier(this.debuff_modifier_name!)) return;

            // Only apply if the target is not an ally
            if (event.unit!.GetTeamNumber() == this.parent.GetTeamNumber()) return;

            if (!this.hero_duration_extend)
                this.hero_duration_extend = GetTalentSpecialValueFor(
                    this.parent,
                    NightStalkerTalents.NightStalkerTalents_3,
                    "hero_duration_extend"
                );
            if (!this.unit_duration_extend)
                this.unit_duration_extend = GetTalentSpecialValueFor(
                    this.parent,
                    NightStalkerTalents.NightStalkerTalents_3,
                    "unit_duration_extend"
                );

            // Extend based on hero/units. Creep heroes are considered units for this purpose.
            if (event.unit!.IsRealHero()) {
                this.SetDuration(this.GetRemainingTime() + this.hero_duration_extend, true);
            } else {
                this.SetDuration(this.GetRemainingTime() + this.unit_duration_extend, true);
            }
        }
    }

    // Aura definitions
    IsAura() {
        return true;
    }
    GetAuraDuration() {
        return 0.5;
    }
    GetAuraRadius() {
        return this.radius!;
    }
    GetAuraSearchFlags() {
        return UnitTargetFlags.NONE;
    }
    GetAuraSearchTeam() {
        return UnitTargetTeam.ENEMY;
    }
    GetAuraSearchType() {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }
    GetModifierAura() {
        return this.debuff_modifier_name!;
    }
}
