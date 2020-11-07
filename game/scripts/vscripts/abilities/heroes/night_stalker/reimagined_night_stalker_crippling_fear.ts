import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_crippling_fear_aura } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_crippling_fear_aura";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_crippling_fear_fear_debuff"
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_crippling_fear_silence_debuff"

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

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_crippling_fear_aura.vpcf" , context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_crippling_fear.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/night_stalker/reimagined_nightstalker_crippling_fear_feared.vpcf", context);                
    }

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

        // Reimagination: Dead of Night: Increases Crippling Fear's duration (among other things) during natural nights, based on distance from nighttime peak
        duration = duration + this.ReimaginationDeadOfNightCripplingFear();        

        // Apply aura modifier to self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_night_stalker_crippling_fear_aura.name, {duration: duration});
    }

    ReimaginationDeadOfNightCripplingFear(): number
    {
        let bonus = 0;        
        // Check if the caster has any Dead of Night modifier
        if (this.caster.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name))
        {
            const modifier = this.caster.FindModifierByName(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name)
            if (modifier)
            {
                // Calculate bonuses from the modifier
                const supposed_bonus = (modifier as modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night).CalculateDurationBonuses();
                if (supposed_bonus && supposed_bonus > 0)
                {
                    bonus = supposed_bonus;
                }
            }
        }

        return bonus;
    }
}