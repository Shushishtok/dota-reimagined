import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_bristleback_quill_spray_needle extends BaseModifier {
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
	IsPermanent() {
		return true;
	}
	RemoveOnDeath() {
		return false;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ON_ORDER];
	}

	OnOrder(event: ModifierUnitEvent) {
		if (!IsServer()) return;

		// Only apply if the unit doing the order is the parent
		if (event.unit !== this.parent) return;

		// Only apply if the order on this ability
		if (event.ability !== this.ability) return;

		// Only apply if the order was to toggle Autocast
		if (event.order_type !== UnitOrder.CAST_TOGGLE_AUTO) return;

		// Wait a frame, then check the auto cast state of the ability
		Timers.CreateTimer(FrameTime(), () => {
			// Stacks at 1: auto cast is on, stacks at 0: auto cast is off
			if (this.ability.GetAutoCastState()) {
				this.SetStackCount(1);
			} else {
				this.SetStackCount(0);
			}
		});
	}
}
