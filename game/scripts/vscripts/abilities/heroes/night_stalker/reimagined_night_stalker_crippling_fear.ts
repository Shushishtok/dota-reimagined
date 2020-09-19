import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_crippling_fear_aura } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_crippling_fear_aura";

@registerAbility()
export class reimagined_night_stalker_crippling_fear extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Nightstalker.Trickling_Fear";        
    cast_responses: string[] = ["night_stalker_nstalk_ability_cripfear_01","night_stalker_nstalk_ability_cripfear_02","night_stalker_nstalk_ability_cripfear_03"]    

    // Ability specials
    duration_day?: number;
    duration_night?: number;
    radius?: number;    

    OnSpellStart(): void
    {
        // Ability specials
        this.duration_day = this.GetSpecialValueFor("duration_day");
        this.duration_night = this.GetSpecialValueFor("duration_night");
        this.radius = this.GetSpecialValueFor("radius");        

        // Roll for cast responses
        if (RollPercentage(75) && !this.IsStolen())
        {
            EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length-1)], this.caster);
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Adjust duration based on day/night
        let duration;
        if (GameRules.IsDaytime())
        {
            duration = this.duration_day;
        }
        else
        {
            duration = this.duration_night;
        }

        // Apply aura modifier to self
        const modifier = this.caster.AddNewModifier(this.caster, this, modifier_reimagined_night_stalker_crippling_fear_aura.name, {duration: duration});
    }

}