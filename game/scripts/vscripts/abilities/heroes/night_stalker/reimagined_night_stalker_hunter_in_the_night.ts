import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_hunter_in_the_night_passive } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_passive"

@registerAbility()
export class reimagined_night_stalker_hunter_in_the_night extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();    

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_night_stalker_hunter_in_the_night_passive.name;
    }    
}