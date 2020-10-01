import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    snowstorm_damage_reduction?: number;
    snowstorm_status_reduction?: number;

    IsHidden() 
    {
        // Shown for allies, not shown for enemies
        if (this.caster!.GetTeamNumber() == this.parent.GetTeamNumber())
        {
            return false;
        }

        return true;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.snowstorm_damage_reduction = this.ability.GetSpecialValueFor("snowstorm_damage_reduction");
        this.snowstorm_status_reduction = this.ability.GetSpecialValueFor("snowstorm_status_reduction");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        // Allies standing on the field are granted damage reduction and status resistance.
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
                ModifierFunction.STATUS_RESISTANCE_STACKING]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        // Activated for allies, does nothing for enemies
        if (this.parent.GetTeamNumber() == this.caster!.GetTeamNumber())
        {
            return this.snowstorm_damage_reduction! * (-1);
        }

        return 0;
    }

    GetModifierStatusResistanceStacking(): number
    {
        // Activated for allies, does nothing for enemies
        if (this.parent.GetTeamNumber() == this.caster?.GetTeamNumber())
        {
            return this.snowstorm_status_reduction!;
        }

        return 0;
    }
}