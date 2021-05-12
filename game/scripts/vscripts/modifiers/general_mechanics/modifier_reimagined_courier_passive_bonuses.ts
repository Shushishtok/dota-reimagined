import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_courier_passive_bonuses extends BaseModifier {
	// Modifier properties
	parent: CDOTA_BaseNPC = this.GetParent();

	// Courier rules
	courier_starting_level: number = 5;
	courier_health_per_level: number = 10;
	courier_base_movespeed: number = 800;
	current_level: number = 1;
	model?: string;

	// Modifier specials
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

	OnCreated() {
		const model = this.parent.GetModelName();
		this.model = model.replace(".vmdl", "_flying.vmdl");
	}

	OnRefresh() {
		if (!IsServer()) return;

		Timers.CreateTimer(FrameTime(), () => {
			if (this.current_level != this.parent.GetLevel()) {
				const levels = this.parent.GetLevel() - this.current_level;
				this.current_level = this.parent.GetLevel();

				this.parent.SetBaseMaxHealth(this.parent.GetBaseMaxHealth() + this.courier_health_per_level * levels);
				this.parent.SetHealth(this.parent.GetBaseMaxHealth() + this.courier_health_per_level * levels);
				this.parent.CalculateGenericBonuses();
			}
		});
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.IGNORE_MOVESPEED_LIMIT, ModifierFunction.MOVESPEED_ABSOLUTE_MIN, ModifierFunction.MODEL_CHANGE, ModifierFunction.PRESERVE_PARTICLES_ON_MODEL_CHANGE];
	}

	GetModifierIgnoreMovespeedLimit(): 0 | 1 {
		return 1;
	}

	GetModifierMoveSpeed_AbsoluteMin(): number {
		return this.courier_base_movespeed;
	}

	GetModifierModelChange(): string | undefined {
		return this.model;
	}

	PreserveParticlesOnModelChanged(): 0 | 1 {
		return 1;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.FLYING]: true };
	}
}
