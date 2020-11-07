import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_drow_ranger_frost_arrows_handler } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_handler"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_slow"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_brittle"

@registerAbility()
export class reimagined_drow_ranger_frost_arrows extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();        

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/frost_arrows_cryo_arrowhead.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_frost.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_marksmanship_start.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_marksmanship.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_base_attack.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_frost_arrow.vpcf", context);
    }

    GetCastRange(): number
    {
        // Scales with the attack range of the parent
        return this.caster.Script_GetAttackRange();
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_drow_ranger_frost_arrows_handler.name;
    }  

    OnSpellStart(): void
    {
        // This literally does n o t h i ng
        // The entire code is located in the handler modifier, and casting this ability is detected there as well 
    }
}