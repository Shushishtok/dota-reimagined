import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_antimage_counterspell_passive extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    magic_resistance?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.magic_resistance = this.ability?.GetSpecialValueFor("magic_resistance");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MAGICAL_RESISTANCE_BONUS];
    }

    GetModifierMagicalResistanceBonus(): number
    {
        // If the parent is an illusion or broken, give no bonus
        if (this.parent.IsIllusion()) return 0;
        if (this.parent.PassivesDisabled()) return 0;

        return this.magic_resistance!;
    }
}