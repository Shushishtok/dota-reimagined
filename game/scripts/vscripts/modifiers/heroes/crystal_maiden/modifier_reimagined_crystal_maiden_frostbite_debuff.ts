import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_frostbite_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_cast: string = "Hero_Crystal.Frostbite";
    particle_frostbite: string = "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf";
    damage_per_tick: number = 0;
    first_tick: boolean = true;

    // Modifier specials
    damage_per_second?: number;
    creep_damage_per_second?: number;
    tick_interval?: number;
    duration?: number;

    // Reimagined specials
    frost_emanation_search_radius?: number;
    frost_emanation_duration?: number;
    eternal_cold_fixed_damage?: number;

    // Reimagined talent specials
    hp_mp_regen_reduction?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties

        this.ability = this.GetAbility()!;

        // Modifier specials
        this.damage_per_second = this.ability.GetSpecialValueFor("damage_per_second");
        this.creep_damage_per_second = this.ability.GetSpecialValueFor("creep_damage_per_second");
        this.tick_interval = this.ability.GetSpecialValueFor("tick_interval");
        this.duration = this.ability.GetSpecialValueFor("duration")

        // Reimagined specials
        this.frost_emanation_search_radius = this.ability.GetSpecialValueFor("frost_emanation_search_radius");
        this.frost_emanation_duration = this.ability.GetSpecialValueFor("frost_emanation_duration");
        this.eternal_cold_fixed_damage = this.ability.GetSpecialValueFor("eternal_cold_fixed_damage");

        // Deal damage according to type of unit
        if (this.parent.IsHero() || this.parent.IsConsideredHero())
        {
            this.damage_per_tick = this.damage_per_second;
        }
        else
        {
            this.damage_per_tick = this.creep_damage_per_second;
        }

        if (IsServer())
        {
            // Start thinking
            this.StartIntervalThink(this.tick_interval!);

            // Immediately trigger the first think
            this.OnIntervalThink();
        }
    }

    OnIntervalThink(): void
    {
        // Deal damage to the parent
        ApplyDamage(
        {
            attacker: this.caster!,
            damage: this.damage_per_tick!,
            damage_type: this.ability.GetAbilityDamageType(),
            victim: this.parent,
            ability: this.ability,
            damage_flags: DamageFlag.NONE
        });

        // Reimagined: Frost Emanation: When a Frostbitten target is touching another enemy, it will periodically afflict it with minor duration Frostbites as well.
        this.ReimaginedFrostEmanation()
    }

    ReimaginedFrostEmanation()
    {
        // Ignore first tick for looping purposes
        if (this.first_tick)
        {
            this.first_tick = false;
            return;
        }

        // Search for nearby allies (of the enemy)
        const enemies = FindUnitsInRadius(this.caster!.GetTeamNumber(),
                                          this.parent.GetAbsOrigin(),
                                          undefined,
                                          this.frost_emanation_search_radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO | UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.CLOSEST,
                                          false
                                          )

        for (const enemy of enemies)
        {
            if (enemy != this.parent)
            {
                // Only apply on the first (closest) enemy
                enemy.AddNewModifier(this.caster!, this.ability, this.GetName(), {duration: this.frost_emanation_duration!});
                break;
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP,
                ModifierFunction.TOOLTIP2,
                ModifierFunction.DISABLE_TURNING,
                ModifierFunction.HP_REGEN_AMPLIFY_PERCENTAGE,
                ModifierFunction.MP_REGEN_AMPLIFY_PERCENTAGE]
    }

    OnTooltip(): number
    {
        return this.damage_per_tick!;

    }

    OnTooltip2(): number
    {
        return this.tick_interval!;
    }

    GetModifierDisableTurning(): 0 | 1
    {
        // Talent: Subzero Grasp: Frostbitten enemies can no longer turn while under this effect, and their health and mana regeneration rates are reduced by x%.
        return this.ReimaginedTalentSubzeroGrasp(true) as 0 | 1;
    }

    GetModifierHPRegenAmplify_Percentage(): number
    {
        // Talent: Subzero Grasp: Frostbitten enemies can no longer turn while under this effect, and their health and mana regeneration rates are reduced by x%.
        return this.ReimaginedTalentSubzeroGrasp(false);
    }

    GetModifierMPRegenAmplify_Percentage(): number
    {
        // Talent: Subzero Grasp: Frostbitten enemies can no longer turn while under this effect, and their health and mana regeneration rates are reduced by x%.
        return this.ReimaginedTalentSubzeroGrasp(false);
    }

    GetEffectName(): string
    {
        return this.particle_frostbite;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.ROOTED]: true,
                [ModifierState.INVISIBLE]: false,
                [ModifierState.DISARMED]: true}
    }

    GetPriority(): ModifierPriority
    {
        return ModifierPriority.NORMAL;
    }

    OnDestroy(): void
    {
        StopSoundOn(this.sound_cast, this.parent)
    }

    ReimaginedTalentSubzeroGrasp(disable_turning: boolean): number
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_3))
        {
            if (disable_turning)
            {
                return 1;
            }
            else
            {
                if (!this.hp_mp_regen_reduction) this.hp_mp_regen_reduction = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_3, "hp_mp_regen_reduction");
                return this.hp_mp_regen_reduction * (-1);
            }
        }

        else return 0;
    }
}
