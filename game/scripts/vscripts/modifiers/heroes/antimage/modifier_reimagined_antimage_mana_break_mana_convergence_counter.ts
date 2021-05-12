import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_antimage_mana_convergence_debuff } from "./modifier_reimagined_antimage_mana_convergence_debuff";

@registerModifier()
export class modifier_reimagined_antimage_mana_break_mana_convergence_counter extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	mana_convergence_hit_threshold: number = 0;
	mana_convergence_debuff_duration: number = 0;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		this.FetchAbilitySpecials();
	}

	FetchAbilitySpecials() {
		// Modifier specials
		this.mana_convergence_hit_threshold = this.ability.GetSpecialValueFor("mana_convergence_hit_threshold");
		this.mana_convergence_debuff_duration = this.ability.GetSpecialValueFor("mana_convergence_debuff_duration");
	}

	OnStackCountChanged(): void {
		if (!IsServer()) return;

		// Check if stacks are currently on the threshold
		if (this.GetStackCount() >= this.mana_convergence_hit_threshold) {
			// Apply Mana Convergence debuff on the enemy
			this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_antimage_mana_convergence_debuff", { duration: this.mana_convergence_debuff_duration });

			// Destroy self
			this.Destroy();
		}
	}
}
