import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_skywrath_mage_talent_8_buff extends BaseModifier {
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
		return true;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true };
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.VISUAL_Z_DELTA];
	}

	GetVisualZDelta(): number {
		return 140;
	}
}
