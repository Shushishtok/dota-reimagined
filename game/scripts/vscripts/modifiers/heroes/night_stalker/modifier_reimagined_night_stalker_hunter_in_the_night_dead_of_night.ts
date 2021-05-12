import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights } from "./modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights";

@registerModifier()
export class modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	base_night_duration: number = 300;
	everlasting_night_stacks: number = 0;
	actual_night_duration?: number;
	peak_of_the_night_time?: number;
	bonus_instances: number = 0;
	elapsed_time: number = 0;

	// Reimagined specials
	dead_of_night_interval?: number;
	dead_of_night_stats_per_stack?: number;
	dead_of_night_bonuses_per_stack?: number;
	dead_of_night_durations_per_stack?: number;
	everlasting_night_duration?: number;

	IsHidden() {
		return false;
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

	OnCreated(): void {
		// Modifier properties

		this.ability = this.GetAbility()!;

		// Reimagined specials
		this.dead_of_night_interval = this.ability.GetSpecialValueFor("dead_of_night_interval");
		this.dead_of_night_stats_per_stack = this.ability.GetSpecialValueFor("dead_of_night_stats_per_stack");
		this.dead_of_night_bonuses_per_stack = this.ability.GetSpecialValueFor("dead_of_night_bonuses_per_stack");
		this.dead_of_night_durations_per_stack = this.ability.GetSpecialValueFor("dead_of_night_durations_per_stack");
		this.everlasting_night_duration = this.ability.GetSpecialValueFor("everlasting_night_duration");

		// Get amount of Everlasting Nights stacks and calculate extra
		this.everlasting_night_stacks = this.parent.GetModifierStackCount(modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights.name, this.parent);

		// Calculate actual night duration by using Everlasting Nights stacks
		this.actual_night_duration = this.base_night_duration + this.everlasting_night_stacks * this.everlasting_night_duration;

		// Set duration of the buff to match the duration of the night
		this.SetDuration(this.actual_night_duration!, true);

		// Calculate "peak" of the night
		this.peak_of_the_night_time = this.actual_night_duration / 2;

		// Start thinking
		this.StartIntervalThink(this.dead_of_night_interval);
	}

	OnIntervalThink() {
		// Every think interval, increase bonus instance by 1, which will be referenced to determine how much to strengthen the stats
		this.bonus_instances++;

		// Increase elapsed time
		this.elapsed_time = this.elapsed_time + this.dead_of_night_interval!;

		if (this.elapsed_time <= this.peak_of_the_night_time!) {
			// Calculate stack count according to percentage of elapsed time
			this.SetStackCount((this.elapsed_time! / this.peak_of_the_night_time!) * 100);
		} else {
			// Calculate stack count in degrading order (stacks are decaying)
			this.SetStackCount((1 - (this.elapsed_time - this.peak_of_the_night_time!) / this.peak_of_the_night_time!) * 100);
		}

		// Calculate stats
		if (IsServer()) {
			(this.parent as CDOTA_BaseNPC_Hero).CalculateStatBonus(true);

			// If elapsed time surprassed the entire duration, remove this modifier
			if (this.elapsed_time >= this.actual_night_duration!) {
				this.Destroy();
			}
		}
	}

	CalculateStatBonuses(): number {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Does nothing if this is currently a day (e.g. Phoenix' Supernova)
		if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0) {
			return 0;
		}

		let actual_bonus;
		if (this.elapsed_time <= this.peak_of_the_night_time!) {
			actual_bonus = (this.elapsed_time / this.dead_of_night_interval!) * this.dead_of_night_stats_per_stack!;
		} else {
			actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time + this.peak_of_the_night_time!) / this.dead_of_night_interval!) * this.dead_of_night_stats_per_stack!;
		}

		return actual_bonus;
	}

	CalculateParamBonuses(): number {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Does nothing if this is currently a day (e.g. Phoenix' Supernova)
		if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0) {
			return 0;
		}

		let actual_bonus;
		if (this.elapsed_time <= this.peak_of_the_night_time!) {
			actual_bonus = (this.elapsed_time / this.dead_of_night_interval!) * this.dead_of_night_bonuses_per_stack!;
		} else {
			actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time + this.peak_of_the_night_time!) / this.dead_of_night_interval!) * this.dead_of_night_bonuses_per_stack!;
		}

		return actual_bonus;
	}

	CalculateDurationBonuses(): number {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Does nothing if this is currently a day (e.g. Phoenix' Supernova)
		if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0) {
			return 0;
		}

		// If one of the parameters are not defined yet, return 0
		if (!this.elapsed_time || !this.peak_of_the_night_time || !this.dead_of_night_interval || !this.dead_of_night_durations_per_stack) {
			return 0;
		}

		let actual_bonus: number = 0;
		if (this.elapsed_time <= this.peak_of_the_night_time!) {
			actual_bonus = (this.elapsed_time / this.dead_of_night_interval!) * this.dead_of_night_durations_per_stack!;
		} else {
			actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time + this.peak_of_the_night_time!) / this.dead_of_night_interval!) * this.dead_of_night_durations_per_stack!;
		}

		return actual_bonus;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.STATS_STRENGTH_BONUS,
			ModifierFunction.STATS_AGILITY_BONUS,
			ModifierFunction.STATS_INTELLECT_BONUS,
			ModifierFunction.MOVESPEED_BONUS_CONSTANT,
			ModifierFunction.PREATTACK_BONUS_DAMAGE,
			ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
			ModifierFunction.TOOLTIP,
		];
	}

	OnTooltip(): number {
		return this.CalculateDurationBonuses();
	}

	GetModifierBonusStats_Strength(): number {
		return this.CalculateStatBonuses();
	}

	GetModifierBonusStats_Agility(): number {
		return this.CalculateStatBonuses();
	}

	GetModifierBonusStats_Intellect(): number {
		return this.CalculateStatBonuses();
	}

	GetModifierMoveSpeedBonus_Constant(): number {
		return this.CalculateParamBonuses();
	}

	GetModifierPreAttack_BonusDamage(): number {
		return this.CalculateParamBonuses();
	}

	GetModifierAttackSpeedBonus_Constant() {
		return this.CalculateParamBonuses();
	}
}
