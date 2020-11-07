import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_hunter_in_the_night_passive } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_passive"
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night"
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights"

@registerAbility()
export class reimagined_night_stalker_hunter_in_the_night extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();    

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_change.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_night_buff.vpcf", context);
        PrecacheModel("models/heroes/nightstalker/nightstalker.vmdl", context);
        PrecacheModel("models/heroes/nightstalker/nightstalker_night.vmdl", context);
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_night_stalker_hunter_in_the_night_passive.name;
    }    
}