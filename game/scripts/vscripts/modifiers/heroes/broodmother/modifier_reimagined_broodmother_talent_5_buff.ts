import { BroodmotherTalents } from "../../../abilities/heroes/broodmother/reimagined_broodmother_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_talent_5_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Reimagined talent specials
	attack_speed_bonus?: number;

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
		this.attack_speed_bonus = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_5, "attack_speed_bonus");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT];
	}

	GetModifierAttackSpeedBonus_Constant(): number {
		return this.attack_speed_bonus!;
	}
}
