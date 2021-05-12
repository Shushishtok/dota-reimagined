import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { GetIllusions } from "../../../lib/util";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_warpath";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_warpath_passive";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_warpath_simmer_down";

@registerAbility()
export class reimagined_bristleback_warpath extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	modifier_warpath_passive: string = "modifier_reimagined_bristleback_warpath_passive";
	modifier_warpath_stacks: string = "modifier_reimagined_bristleback_warpath";

	// Ability specials
	simmer_down_duration?: number;

	// Reimagined properties
	modifier_simmer: string = "modifier_reimagined_bristleback_warpath_simmer_down";

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/bristleback/bristleback_warpath_simmer_down.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_warpath.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_warpath_dust.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/bristleback/bristleback_warpath_anger_burst_trigger.vpcf", context);
	}

	GetIntrinsicModifierName(): string {
		return this.modifier_warpath_passive;
	}

	OnUpgrade(): void {
		this.simmer_down_duration = this.GetSpecialValueFor("simmer_down_duration");
	}

	OnSpellStart(): void {
		// Reimagined: Simmer Down: Can be activated to consume all current Warpath stacks. Each stack consumed grants Bristleback damage resistance from the from all directions. While this buff is active, Warpath stacks cannot be generated.
		this.ReimaginedSimmerDown();
	}

	ReimaginedSimmerDown(): void {
		let stacks = 0;
		if (this.caster.HasModifier(this.modifier_warpath_stacks)) {
			const modifier = this.caster.FindModifierByName(this.modifier_warpath_stacks);
			if (modifier) {
				// Get the current stacks of Warpath for the caster
				stacks = modifier.GetStackCount();

				// Destroy the Warpath modifier
				modifier.Destroy();
			}
		}

		// Add the Simmer Down modifier
		const modifier = this.caster.AddNewModifier(this.caster, this, this.modifier_simmer, { duration: this.simmer_down_duration });
		if (modifier) {
			// Set stacks for Simmer Down. If there are no stacks, set it at 1 instead
			modifier.SetStackCount(math.max(stacks, 1));
		}

		// Find illusions, if any, and destroy their modifiers as well, and give them the Simmer Down modifier
		const illusions = GetIllusions(this.caster);
		if (illusions) {
			for (const illusion of illusions) {
				if (illusion.HasModifier(this.modifier_warpath_stacks)) {
					const modifier = illusion.FindModifierByName(this.modifier_warpath_stacks);
					if (modifier) {
						modifier.Destroy();
					}
				}

				const modifier = illusion.AddNewModifier(this.caster, this, this.modifier_simmer, { duration: this.simmer_down_duration });
				if (modifier) {
					modifier.SetStackCount(math.max(stacks, 1));
				}
			}
		}
	}
}
