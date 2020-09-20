import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_dark_ascension_active } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_dark_ascension_active"
import { modifier_reimagined_night_stalker_dark_ascension_wings_out } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_dark_ascension_wings_out"

@registerAbility()
export class reimagined_night_stalker_dark_ascension extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Nightstalker.Darkness";
    particle_darkness: string = "particles/units/heroes/hero_night_stalker/nightstalker_ulti.vpcf";
    particle_darkness_fx?: ParticleID;

    // Ability specials
    duration?: number;

    // Reimagined: Wings Out: Dark Ascension bonuses are also granted while above a threshold of The Dead Of Night stacks
    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_night_stalker_dark_ascension_wings_out.name;
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Add darkness particle
	    this.particle_darkness_fx = ParticleManager.CreateParticle(this.particle_darkness, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
	    ParticleManager.SetParticleControl(this.particle_darkness_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_darkness_fx, 1, this.caster.GetAbsOrigin());        
        ParticleManager.ReleaseParticleIndex(this.particle_darkness_fx);
        
        // Add active modifier
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_night_stalker_dark_ascension_active.name, {duration: this.duration});

        // Start a Night Stalker Night
        GameRules.BeginNightstalkerNight(this.duration);
    }
}