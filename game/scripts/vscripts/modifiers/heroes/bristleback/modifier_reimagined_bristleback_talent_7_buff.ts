import { BristlebackTalents } from "../../../abilities/heroes/bristleback/reimagined_bristleback_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_talent_7_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
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
		this.attack_speed_bonus = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_7, "attack_speed_bonus");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT];
	}

	GetModifierAttackSpeedBonus_Constant(): number {
		return this.attack_speed_bonus!;
	}
}
