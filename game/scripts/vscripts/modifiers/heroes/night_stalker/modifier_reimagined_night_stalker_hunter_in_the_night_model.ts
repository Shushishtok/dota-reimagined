import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_hunter_in_the_night_model extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	night_model: string = "models/heroes/nightstalker/nightstalker_night.vmdl";

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	RemoveOnDeath() {
		return false;
	}
	IsPermanent() {
		return true;
	}

	OnCreated() {
		if (!IsServer()) return;
		this.StartIntervalThink(0.5);
	}

	OnIntervalThink() {
		if (GameRules.IsDaytime()) {
			this.Destroy();
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MODEL_CHANGE, ModifierFunction.PRESERVE_PARTICLES_ON_MODEL_CHANGE];
	}

	GetModifierModelChange() {
		return this.night_model;
	}

	PreserveParticlesOnModelChanged(): 0 | 1 {
		return 1;
	}
}
