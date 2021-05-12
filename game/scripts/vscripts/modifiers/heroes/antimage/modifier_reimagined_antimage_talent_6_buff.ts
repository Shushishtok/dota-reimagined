import { AntiMageTalents } from "../../../abilities/heroes/antimage/reimagined_antimage_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_antimage_talent_6_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	magic_resist_stack?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return true;
	}

	OnCreated(): void {
		// Modifier specials
		this.magic_resist_stack = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_6, "magic_resist_stack");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MAGICAL_RESISTANCE_BONUS];
	}

	GetModifierMagicalResistanceBonus(): number {
		return this.magic_resist_stack! * this.GetStackCount();
	}
}
