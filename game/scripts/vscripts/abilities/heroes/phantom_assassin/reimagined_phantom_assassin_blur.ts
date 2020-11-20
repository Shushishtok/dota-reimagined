import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_phantom_assassin_blur_passive } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_passive"
import { modifier_reimagined_phantom_assassin_blur_active } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_active"
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_quick_and_quiet"
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_turned_blade_cd"

@registerAbility()
export class reimagined_phantom_assassin_blur extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    particle_blur_active: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_active_start.vpcf";
    particle_blur_active_fx?: ParticleID;

    // Ability specials
    duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_active_start.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/phantom_assassin/blur_turned_your_blade.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_active_blur.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_phantom_assassin_active_blur.vpcf", context);
    }

    GetCastPoint(): number
    {
        // Scepter: instant cast time
        if (this.caster.HasScepter())
        {
            return 0;
        }

        return super.GetCastPoint();
    }

    GetCooldown(): number
    {
        // Scepter: cooldown decrease
        if (this.caster.HasScepter())
        {
            return this.GetSpecialValueFor("scepter_cooldown");
        }

        return super.GetCooldown(this.GetLevel());
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_phantom_assassin_blur_passive.name;
    }

    OnSpellStart(): void
    {
        // Ability properties
        const original_caster_position = this.caster.GetAbsOrigin();


        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Apply Blur on self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_blur_active.name, { duration: this.duration });

        // Scepter: Basic dispel self from debuffs
        if (this.caster.HasScepter())
        {
            this.caster.Purge(false, true, false, false, false);
        }

        // Create particle system
        this.particle_blur_active_fx = ParticleManager.CreateParticle(this.particle_blur_active, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_blur_active_fx, 0, original_caster_position);
        ParticleManager.ReleaseParticleIndex(this.particle_blur_active_fx);
    }

}
