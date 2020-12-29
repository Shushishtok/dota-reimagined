import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { IsInRiver } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_sprint_river extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_river: string = "particles/units/heroes/hero_slardar/slardar_sprint_river.vpcf";
    particle_river_fx?: ParticleID;
    currently_in_river: boolean = false;

    // Modifier specials
    river_speed?: number;
    puddle_regen?: number;
    puddle_armor?: number;
    puddle_status_resistance?: number;

    // Reimagined specials
    watery_comfort_interval?: number;
    watery_comfort_cd_redcution?: number;
    watery_comfort_river_bonus_linger?: number;

    IsHidden()
    {
        return !this.currently_in_river;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.river_speed = this.ability.GetSpecialValueFor("river_speed");

        // Scepter effects
        this.puddle_regen = this.ability.GetSpecialValueFor("puddle_regen");
        this.puddle_armor = this.ability.GetSpecialValueFor("puddle_armor");
        this.puddle_status_resistance = this.ability.GetSpecialValueFor("puddle_status_resistance");

        // Reimagined specials
        this.watery_comfort_interval = this.ability.GetSpecialValueFor("watery_comfort_interval");
        this.watery_comfort_cd_redcution = this.ability.GetSpecialValueFor("watery_comfort_cd_redcution");
        this.watery_comfort_river_bonus_linger = this.ability.GetSpecialValueFor("watery_comfort_river_bonus_linger");

        this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void
    {
        const currently_in_river = this.currently_in_river;
        this.currently_in_river = IsInRiver(this.parent);

        // Check if the state changed in this think
        if (currently_in_river != this.currently_in_river)
        {
            if (this.currently_in_river) this.OnEnteredRiver();
            else this.OnLeftRiver();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.HEALTH_REGEN_CONSTANT,
                ModifierFunction.PHYSICAL_ARMOR_BONUS,
                ModifierFunction.STATUS_RESISTANCE_STACKING]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        if (this.currently_in_river) return this.river_speed!;

        return 0;
    }

    GetModifierConstantHealthRegen(): number
    {
        if (this.caster.HasScepter() && this.currently_in_river) return this.puddle_regen!;

        return 0;
    }

    GetModifierPhysicalArmorBonus(): number
    {
        if (this.caster.HasScepter() && this.currently_in_river) return this.puddle_armor!;

        return 0;
    }

    GetModifierStatusResistanceStacking(): number
    {
        if (this.caster.HasScepter() && this.currently_in_river) return this.puddle_status_resistance!;

        return 0;
    }

    OnEnteredRiver(): void
    {
        // Activate river particle
        this.particle_river_fx = ParticleManager.CreateParticle(this.particle_river, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_river_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_river_fx, 1, Vector(1,0,0))
    }

    OnLeftRiver(): void
    {
        // Remove river particle
        if (this.particle_river_fx)
        {
            ParticleManager.DestroyParticle(this.particle_river_fx, false);
            ParticleManager.ReleaseParticleIndex(this.particle_river_fx);
            this.particle_river_fx = undefined;
        }
    }
}
