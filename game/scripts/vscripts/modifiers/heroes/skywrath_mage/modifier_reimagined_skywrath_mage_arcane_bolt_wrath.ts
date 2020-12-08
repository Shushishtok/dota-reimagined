import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_skywrath_mage_arcane_bolt_wrath extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    wrath_arcane_bolt_casts?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.wrath_arcane_bolt_casts = this.ability.GetSpecialValueFor("wrath_arcane_bolt_casts");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.wrath_arcane_bolt_casts!;
    }
}
