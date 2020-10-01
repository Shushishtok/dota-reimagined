import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    lock: boolean = false;
    parents_armor: number = 0;

    // Modifier specials
    epic_cleave_armor_ignore_pct?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.epic_cleave_armor_ignore_pct = this.ability.GetSpecialValueFor("epic_cleave_armor_ignore_pct");        
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PHYSICAL_ARMOR_BONUS]
    }

    GetModifierPhysicalArmorBonus(): number
    {
        if (!IsServer()) return 0;

        // Check for locked behavior for infinite responses
        if (this.lock) return 0;
        
        // Apply lock
        this.lock = true;

        // Get current armor value, without this bonus (as it's locked)
        this.parents_armor = this.parent.GetPhysicalArmorValue(false);
        
        // Release lock
        this.lock = false;

        // Calculate armor reduction if it's positive
        let armor_reduction: number;
        if (this.parents_armor > 0)
        {            
            return armor_reduction = this.parents_armor * this.epic_cleave_armor_ignore_pct! * 0.01 * (-1); 
        }

        // Got no armor to ignore: do not return anything
        return 0;
    }
}