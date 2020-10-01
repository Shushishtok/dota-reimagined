import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    arcane_glacier_damage_res_per_tick?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.arcane_glacier_damage_res_per_tick = this.ability.GetSpecialValueFor("arcane_glacier_damage_res_per_tick");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        return this.arcane_glacier_damage_res_per_tick! * this.GetStackCount() * (-1);
    }
}