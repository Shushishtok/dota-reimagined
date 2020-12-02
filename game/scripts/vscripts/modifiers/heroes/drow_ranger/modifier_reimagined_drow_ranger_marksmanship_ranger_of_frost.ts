import { DrowRangerTalents } from "../../../abilities/heroes/drow_ranger/reimagined_drow_ranger_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    ranger_frost_attack_speed?: number;
    ranger_frost_projectile_speed?: number;
    ranger_frost_disable_distance_decrease?: number;
    ranger_frost_duration?: number;

    // Reimagined Talent specials
    talent_8_attack_range_per_stack?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated()
    {
        this.ranger_frost_attack_speed = this.ability.GetSpecialValueFor("ranger_frost_attack_speed");
        this.ranger_frost_projectile_speed = this.ability.GetSpecialValueFor("ranger_frost_projectile_speed");
        this.ranger_frost_disable_distance_decrease = this.ability.GetSpecialValueFor("ranger_frost_disable_distance_decrease");
        this.ranger_frost_duration = this.ability.GetSpecialValueFor("ranger_frost_duration");
    }

    OnStackCountChanged(previous_stacks: number): void
    {
        if (!IsServer()) return;

        // We only care about incrementals
        if (previous_stacks > this.GetStackCount()) return;

        // Get the amount of new stacks that we just got
        const new_stacks = this.GetStackCount() - previous_stacks;

        // Refresh the duration of the modifier
        this.ForceRefresh();

        // Add a new timer for those stack(s)
        Timers.CreateTimer(this.ranger_frost_duration!, () =>
        {
            // Verify the caster, the parent, and the modifier still exist as valid entities
            if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
            {
                // Decrement stacks, or destroy modifier is there are no more stacks
                if (this.GetStackCount() == new_stacks)
                {
                    this.Destroy();
                }
                else
                {
                    this.SetStackCount(this.GetStackCount() - new_stacks);
                }
            }
        });
    }

    OnRefresh()
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.PROJECTILE_SPEED_BONUS,
                ModifierFunction.TOOLTIP,
                // Talent: Markswoman's Tempo: Ranger of Frost now also increases attack range by x per stack.
                ModifierFunction.ATTACK_RANGE_BONUS,
                ]
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.ranger_frost_attack_speed! * this.GetStackCount();
    }

    GetModifierProjectileSpeedBonus(): number
    {
        return this.ranger_frost_projectile_speed! * this.GetStackCount();
    }

    OnTooltip(): number
    {
        return this.ranger_frost_disable_distance_decrease! * this.GetStackCount();
    }

    GetModifierAttackRangeBonus(): number
    {
        // Talent: Markswoman's Tempo: Ranger of Frost now also increases attack range by x per stack.
        return this.ReimaginedTalentMarkswomansTempo();
    }

    ReimaginedTalentMarkswomansTempo(): number
    {
        if (HasTalent(this.caster, DrowRangerTalents.DrowRangerTalent_8))
        {
            if (!this.talent_8_attack_range_per_stack) this.talent_8_attack_range_per_stack = GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_8, "talent_8_attack_range_per_stack");
            return this.talent_8_attack_range_per_stack * this.GetStackCount();
        }

        return 0;
    }
}
