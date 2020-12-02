import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_frost_arrows_brittle extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    lock: boolean = false;

    // Modifier specials
    brittle_cold_armor_loss_pct?: number;
    brittle_cold_aspd_loss?: number;
    brittle_cold_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.brittle_cold_armor_loss_pct = this.ability.GetSpecialValueFor("brittle_cold_armor_loss_pct");
        this.brittle_cold_aspd_loss = this.ability.GetSpecialValueFor("brittle_cold_aspd_loss");
        this.brittle_cold_duration = this.ability.GetSpecialValueFor("brittle_cold_duration");
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
        Timers.CreateTimer(this.brittle_cold_duration!, () =>
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

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.PHYSICAL_ARMOR_BONUS]
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.brittle_cold_aspd_loss! * this.GetStackCount() * (-1);
    }

    GetModifierPhysicalArmorBonus(): number
    {
        // Check for locked behavior for infinite responses
        if (this.lock) return 0;

        // Apply lock
        this.lock = true;

        // Get current strength value, without this bonus (as it's locked)
        const armor = this.parent.GetPhysicalArmorValue(false);

        // Release lock
        this.lock = false;

        // Calculate strength bonus
        const armor_reduction = armor * this.brittle_cold_armor_loss_pct! * 0.01 * this.GetStackCount() * (-1);

        // Return strength bonus
        return armor_reduction;
    }
}
