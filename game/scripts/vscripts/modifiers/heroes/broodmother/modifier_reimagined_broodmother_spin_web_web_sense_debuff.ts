import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spin_web_web_sense_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PROVIDES_FOW_POSITION];
	}

	GetModifierProvidesFOWVision(): 0 | 1 {
		return 1;
	}
}
