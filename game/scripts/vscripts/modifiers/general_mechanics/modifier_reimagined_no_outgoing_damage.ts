import { BaseModifier, registerModifier, } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_no_outgoing_damage extends BaseModifier
{
    // Modifier properties    
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    GetAttributes() {return ModifierAttribute.MULTIPLE}

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOTALDAMAGEOUTGOING_PERCENTAGE]
    }

    GetModifierTotalDamageOutgoing_Percentage(): number
    {
        return -100;
    }
}