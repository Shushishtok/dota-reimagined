import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_talent_1_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	spell_amp_reduction?: number;

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
		// Modifier specials
		this.spell_amp_reduction = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_1, "spell_amp_reduction");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.TOOLTIP];
	}

	OnTooltip(): number {
		return this.spell_amp_reduction!;
	}
}
