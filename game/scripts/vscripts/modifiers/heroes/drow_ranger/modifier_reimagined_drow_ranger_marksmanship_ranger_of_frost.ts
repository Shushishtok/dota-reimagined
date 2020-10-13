import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

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
                    for (let index = 0; index < new_stacks; index++)
                    {
                        this.DecrementStackCount();
                    }
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
                ModifierFunction.TOOLTIP]
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
}