import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_sven_great_cleave_passive } from "../../../modifiers/heroes/sven/modifier_reimagined_sven_great_cleave_passive"

@registerAbility()
export class reimagined_sven_great_cleave extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound: string = "";
    particle: string = "";
    particle_fx?: ParticleID;

    // Ability specials

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_sven_great_cleave_passive.name;
    }

    OnSpellStart(): void
    {
        
    }
}