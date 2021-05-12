import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_antimage_mana_break_disable extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
}
