import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_sven_gods_strength } from "../../../modifiers/heroes/sven/modifier_reimagined_sven_gods_strength"
import "../../../modifiers/heroes/sven/modifier_reimagined_sven_gods_strength_buff_fish_counter"

@registerAbility()
export class reimagined_sven_gods_strength extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Sven.GodsStrength";
    particle_cast: string = "particles/units/heroes/hero_sven/sven_spell_gods_strength.vpcf";
    particle_cast_fx?: ParticleID;

    // Ability specials
    duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_sven/sven_spell_gods_strength.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_sven/sven_spell_gods_strength_ambient.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_sven/sven_gods_strength_hero_effect.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_gods_strength.vpcf", context);
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Play sound        
        EmitSoundOn(this.sound_cast, this.caster);

        // Play particle effect
        this.particle_cast_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControlEnt(this.particle_cast_fx, 1, this.caster, ParticleAttachment.ABSORIGIN_FOLLOW, undefined, this.caster.GetAbsOrigin(), true)
        ParticleManager.ReleaseParticleIndex(this.particle_cast_fx);

        // Add modifier to self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_sven_gods_strength.name, {duration: this.duration});
    }
}