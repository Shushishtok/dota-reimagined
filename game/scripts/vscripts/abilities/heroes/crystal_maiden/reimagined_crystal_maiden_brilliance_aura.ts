import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_arcane_aura_aura } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_arcane_aura_aura";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery"
import { modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane"

@registerAbility()
export class reimagined_crystal_maiden_brilliance_aura extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Crystal.CrystalNova.Yulsaria";
    particle_cast: string = "particles/heroes/crystal_maiden/arcane_aura_focused_arcane_cast.vpcf";
    particle_cast_fx?: ParticleID;

    // Reimagined specials
    focused_arcane_duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/crystal_maiden/arcane_aura_focused_arcane_cast.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/crystal_maiden/arcane_aura_focused_arcane_effect.vpcf", context);
    }

    GetIntrinsicModifierName()
    {
        return modifier_reimagined_crystal_maiden_arcane_aura_aura.name;
    }

    OnAbilityPhaseStart(): boolean
    {
        this.caster.AddActivityModifier("glacier")
        return true
    }

    OnAbilityPhaseInterrupted(): void
    {
        this.caster.ClearActivityModifiers();
    }

    OnSpellStart(): void
    {        
        this.caster.ClearActivityModifiers();

        // Reimagined specials
        this.focused_arcane_duration = this.GetSpecialValueFor("focused_arcane_duration");

        // Reimagined: Focused Arcane: Can be no-target cast to reduce the aura range from global to 1200 but also increase magical resistance and spell amp of nearby allies.
        this.ReimaginedFocusedArcane();
    }

    ReimaginedFocusedArcane()
    {
        // Play cast sound
        this.EmitSound(this.sound_cast);

        // Play cast particle effect
        this.particle_cast_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControl(this.particle_cast_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_cast_fx, 1, Vector(1,1,1));
        ParticleManager.ReleaseParticleIndex(this.particle_cast_fx);

        // Apply Focused Arcane modifier on self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane.name, {duration: this.focused_arcane_duration});
    }
}