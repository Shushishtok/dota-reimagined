import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_antimage_counterspell_passive } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_counterspell_passive";
import { modifier_reimagined_antimage_counterspell_active } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_counterspell_active";

@registerAbility()
export class reimagined_antimage_counterspell extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_active: string = "Hero_Antimage.Counterspell.Cast";
    particle_active: string = "particles/units/heroes/hero_antimage/antimage_blink_end_glow.vpcf";
    particle_active_fx?: ParticleID;

    // Ability specials
    duration?: number;

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_antimage_counterspell_passive.name;
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Apply Counterspell shield on caster
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_antimage_counterspell_active.name, {duration: this.duration});

        // Play sound
        this.caster.EmitSound(this.sound_active);

        // Create particle effect
		this.particle_active_fx = ParticleManager.CreateParticle(this.particle_active, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
		ParticleManager.ReleaseParticleIndex(this.particle_active_fx);		
    }
}