import { reimagined_bristleback_quill_spray } from "../../../abilities/heroes/bristleback/reimagined_bristleback_quill_spray";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_bristleback_quill_spray_needle_spreader extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: reimagined_bristleback_quill_spray = this.GetAbility()! as reimagined_bristleback_quill_spray;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	needle_spreader_interval: number = 0;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		this.FetchAbilitySpecials();

		// Start thinking
		if (!IsServer()) return;
		this.StartIntervalThink(this.needle_spreader_interval);
	}

	FetchAbilitySpecials() {
		// Modifier specials
		this.needle_spreader_interval = this.ability.GetSpecialValueFor("needle_spreader_interval");
	}

	OnIntervalThink(): void {
		// Fire a new Quill Spray
		this.ability.FireQuillSpray(this.caster);
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.DISARMED]: true, [ModifierState.ROOTED]: true };
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.TOOLTIP];
	}

	OnTooltip(): number {
		return this.needle_spreader_interval;
	}
}
