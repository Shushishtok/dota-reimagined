import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_antimage_mana_convergence_debuff } from "./modifier_reimagined_antimage_mana_convergence_debuff";

@registerModifier()
export class modifier_reimagined_antimage_mana_break_mana_convergence_counter extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    mana_convergence_hit_threshold?: number;
    mana_convergence_debuff_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.mana_convergence_hit_threshold = this.ability?.GetSpecialValueFor("mana_convergence_hit_threshold");
        this.mana_convergence_debuff_duration = this.ability?.GetSpecialValueFor("mana_convergence_debuff_duration");
    }

    OnStackCountChanged(): void
    {
        // Check if stacks are currently on the threshold
        if (this.GetStackCount() >= this.mana_convergence_hit_threshold!)
        {
            // Apply Mana Convergence debuff on the enemy
            this.parent.AddNewModifier(this.caster!, this.ability!, modifier_reimagined_antimage_mana_convergence_debuff.name, {duration: this.mana_convergence_debuff_duration});

            // Destroy self
            this.Destroy();
        }
    }
}