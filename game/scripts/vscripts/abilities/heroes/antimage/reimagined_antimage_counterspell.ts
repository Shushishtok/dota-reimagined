import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_antimage_counterspell_passive } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_counterspell_passive";
import { modifier_reimagined_antimage_counterspell_active } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_counterspell_active";
import { reimagined_antimage_mana_overload } from "./reimagined_antimage_mana_overload";
import { HasScepterShard } from "../../../lib/util";

@registerAbility()
export class reimagined_antimage_counterspell extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_active: string = "Hero_Antimage.Counterspell.Cast";
	particle_active: string = "particles/units/heroes/hero_antimage/antimage_blink_end_glow.vpcf";
	particle_active_fx?: ParticleID;
	ability_blink_fragment: string = "reimagined_antimage_mana_overload";

	// Ability specials
	duration?: number;

	GetIntrinsicModifierName(): string {
		return modifier_reimagined_antimage_counterspell_passive.name;
	}

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_antimage/antimage_blink_end_glow.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_antimage/antimage_counter.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_antimage/antimage_spellshield.vpcf", context);
	}

	GetManaCost(level: number): number {
		if (HasScepterShard(this.caster)) {
			return 0;
		}

		return super.GetManaCost(level);
	}

	OnSpellStart(): void {
		// Ability specials
		this.duration = this.GetSpecialValueFor("duration");

		// Apply Counterspell shield on caster
		this.caster.AddNewModifier(this.caster, this, modifier_reimagined_antimage_counterspell_active.name, { duration: this.duration });

		// Also find the Mana Overload ability, if any, and give its illusion(s) the Counterspell buff
		if (this.caster.HasAbility(this.ability_blink_fragment)) {
			const ability_blink_fragment = this.caster.FindAbilityByName(this.ability_blink_fragment) as reimagined_antimage_mana_overload;
			if (ability_blink_fragment) {
				if (ability_blink_fragment.blink_fragment_illusions) {
					for (const illusion of ability_blink_fragment.blink_fragment_illusions) {
						if (IsValidEntity(illusion) && !illusion.IsNull() && illusion.IsAlive()) {
							illusion.AddNewModifier(this.caster, this, modifier_reimagined_antimage_counterspell_active.name, { duration: this.duration });
						}
					}
				}
			}
		}

		// Play sound
		this.caster.EmitSound(this.sound_active);

		// Create particle effect
		this.particle_active_fx = ParticleManager.CreateParticle(this.particle_active, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
		ParticleManager.ReleaseParticleIndex(this.particle_active_fx);
	}
}
