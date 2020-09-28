import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    stack_set: number[] = [];

    // Modifier specials
    blueheart_mastery_duration?: number;
    blueheart_mastery_mana_regen?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.blueheart_mastery_duration = this.ability!.GetSpecialValueFor("blueheart_mastery_duration");               
        this.blueheart_mastery_mana_regen = this.ability!.GetSpecialValueFor("blueheart_mastery_mana_regen");
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
        Timers.CreateTimer(this.blueheart_mastery_duration!, () => 
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

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.blueheart_mastery_mana_regen! * this.GetStackCount();
    }
}