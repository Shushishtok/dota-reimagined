import { BaseModifier, registerModifier, } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_negate_armor extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();    
    armor?: number;

    IsHidden() {return true}
    IsDebuff() {return true}
    IsPurgable() {return false}
    
    OnCreated()
    {
        this.armor = this.parent.GetPhysicalArmorValue(false);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PHYSICAL_ARMOR_BONUS]
    }

    GetModifierPhysicalArmorBonus(): number
    {
        if (this.armor && this.armor > 0)
        {
            return this.armor! * (-1);        
        }
        
        return 0;
    }
}