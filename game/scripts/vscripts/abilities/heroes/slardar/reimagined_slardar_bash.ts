import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_bash_passive";

@registerAbility()
export class reimagined_slardar_bash extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	modifier_passive: string = "modifier_reimagined_slardar_bash_passive";

	GetIntrinsicModifierName(): string {
		return this.modifier_passive;
	}
}
