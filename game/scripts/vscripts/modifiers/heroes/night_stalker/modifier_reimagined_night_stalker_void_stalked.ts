import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_void_stalked extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		// Modifier properties

		this.ability = this.GetAbility()!;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PROVIDES_FOW_POSITION];
	}

	GetModifierProvidesFOWVision(): 0 | 1 {
		return 1;
	}
}
