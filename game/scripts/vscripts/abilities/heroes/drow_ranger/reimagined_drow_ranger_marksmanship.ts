import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_passive"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_projectile_handler"

@registerAbility()
export class reimagined_drow_ranger_marksmanship extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound: string = "";
    particle: string = "";
    particle_fx?: ParticleID;

    // Ability specials

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_drow_ranger_marksmanship_passive.name;
    }

    OnSpellStart(): void
    {
        
    }
}