import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_sven_great_cleave_epic_cleave extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Reimagined specials
    epic_cleave_attacks?: number;

    
    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated()
    {
        
        this.ability = this.GetAbility()!;

        // Reimagined specials
        this.epic_cleave_attacks = this.ability.GetSpecialValueFor("epic_cleave_attacks");        
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.epic_cleave_attacks!;
    }
}