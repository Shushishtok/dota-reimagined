import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_damage_penalty extends BaseModifier {
	damage_reduction: number = 0;

	OnCreated(keys: { damage_reduction: number }) {
		if (!IsServer()) return;

		if (keys && keys.damage_reduction) {
			this.damage_reduction = keys.damage_reduction;
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.DAMAGEOUTGOING_PERCENTAGE];
	}

	GetModifierDamageOutgoing_Percentage(): number {
		return this.damage_reduction * -1;
	}
}
