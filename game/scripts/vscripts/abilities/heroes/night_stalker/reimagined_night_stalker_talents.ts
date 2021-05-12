import { registerModifier } from "../../../lib/dota_ts_adapter";
import { registerTalent, BaseTalent, BaseTalentModifier } from "../../../lib/talents";
import { CalculateDistanceBetweenEntities, GetTalentSpecialValueFor } from "../../../lib/util";

export const enum NightStalkerTalents {
	NightStalkerTalents_1 = "reimagined_night_stalker_talent_1",
	NightStalkerTalents_2 = "reimagined_night_stalker_talent_2",
	NightStalkerTalents_3 = "reimagined_night_stalker_talent_3",
	NightStalkerTalents_4 = "reimagined_night_stalker_talent_4",
	NightStalkerTalents_5 = "reimagined_night_stalker_talent_5",
	NightStalkerTalents_6 = "reimagined_night_stalker_talent_6",
	NightStalkerTalents_7 = "reimagined_night_stalker_talent_7",
	NightStalkerTalents_8 = "reimagined_night_stalker_talent_8",
}

@registerTalent()
export class reimagined_night_stalker_talent_1 extends BaseTalent {}

@registerTalent()
export class reimagined_night_stalker_talent_2 extends BaseTalent {}

@registerTalent()
export class reimagined_night_stalker_talent_3 extends BaseTalent {}

@registerTalent()
export class reimagined_night_stalker_talent_4 extends BaseTalent {}

@registerTalent()
export class reimagined_night_stalker_talent_5 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_night_stalker_talent_6 extends BaseTalentModifier {
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	proximity_distance?: number;
	currently_night: boolean = false;
	in_vision_range_of_enemy: boolean = true;

	IsHidden(): boolean {
		// 0 means active (and should be visible), 1 is inactive and should be hidden
		if (this.GetStackCount() == 0) return false;
		else return true;
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

	OnCreated(): void {
		if (!IsServer()) return;
		this.proximity_distance = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_6, "proximity_distance");

		this.StartIntervalThink(0.25);
	}

	OnIntervalThink(): void {
		// Check if this is currently night or day
		if (GameRules.IsDaytime()) {
			this.currently_night = false;

			// If this is daytime, then the effects would not happen, let's just return
			this.SetStackCount(1);
			return;
		} else {
			this.currently_night = true;
		}

		// Check if the caster is in vision of anyone around him. We'll cap the search to about 2k cause come on no one will ever see that far
		const enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			undefined,
			2000,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO,
			UnitTargetFlags.INVULNERABLE + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.OUT_OF_WORLD,
			FindOrder.CLOSEST,
			false
		);

		for (const enemy of enemies) {
			// Check if enemy's vision range is high enough to be able to see the caster. This fully ignores obstacles!
			const enemy_vision = enemy.GetCurrentVisionRange();
			const distance = CalculateDistanceBetweenEntities(this.caster, enemy);

			// Enemy can see the caster; tag and exit.
			if (enemy_vision >= distance) {
				this.in_vision_range_of_enemy = true;
				this.SetStackCount(1);
				return;
			}
		}

		// If we're here, no enemy hero saw us. Look for nearby units instead
		const creeps = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			undefined,
			this.proximity_distance!,
			UnitTargetTeam.ENEMY,
			UnitTargetType.BASIC,
			UnitTargetFlags.INVULNERABLE + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.OUT_OF_WORLD,
			FindOrder.ANY,
			false
		);

		if (creeps.length > 0) {
			// Creep was found in range. Tag as visible as exit
			this.in_vision_range_of_enemy = true;
			this.SetStackCount(1);
			return;
		}

		// If we got through both checks, then we should be invisible!
		this.in_vision_range_of_enemy = false;

		// If this is both night AND we're invisible, set stack count to 0 (active)
		if (!this.in_vision_range_of_enemy && this.currently_night) {
			this.SetStackCount(0);
		}
	}

	CheckState(): Partial<Record<ModifierState, boolean>> | undefined {
		if (this.GetStackCount() == 0) {
			return { [ModifierState.INVISIBLE]: true };
		}

		return undefined;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.INVISIBILITY_LEVEL];
	}

	GetModifierInvisibilityLevel(): number {
		if (this.GetStackCount() == 0) {
			return 1;
		}

		return 0;
	}
}

@registerTalent(undefined, modifier_reimagined_night_stalker_talent_6)
export class reimagined_night_stalker_talent_6 extends BaseTalent {}

@registerTalent()
export class reimagined_night_stalker_talent_7 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_night_stalker_talent_8 extends BaseTalentModifier {
	parent: CDOTA_BaseNPC = this.GetParent();
	modifier_dead_of_night: string = "modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
	talent_stacks_threshold?: number;
	damage_reduction_pct?: number;
	status_resist_pct?: number;
	damage_amp_pct?: number;

	IsHidden() {
		if (this.ModifierActive()) return false;
		else return true;
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

	OnCreated(): void {
		this.talent_stacks_threshold = GetTalentSpecialValueFor(this.parent, NightStalkerTalents.NightStalkerTalents_8, "talent_stacks_threshold");
		this.damage_reduction_pct = GetTalentSpecialValueFor(this.parent, NightStalkerTalents.NightStalkerTalents_8, "damage_reduction_pct");
		this.status_resist_pct = GetTalentSpecialValueFor(this.parent, NightStalkerTalents.NightStalkerTalents_8, "status_resist_pct");
		this.damage_amp_pct = GetTalentSpecialValueFor(this.parent, NightStalkerTalents.NightStalkerTalents_8, "damage_amp_pct");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE, ModifierFunction.STATUS_RESISTANCE_STACKING, ModifierFunction.TOTALDAMAGEOUTGOING_PERCENTAGE, ModifierFunction.TOOLTIP];
	}

	GetModifierIncomingDamage_Percentage(): number {
		if (this.ModifierActive()) {
			return this.damage_reduction_pct! * -1;
		}

		return 0;
	}

	GetModifierStatusResistanceStacking(): number {
		if (this.ModifierActive()) {
			return this.status_resist_pct!;
		}

		return 0;
	}

	GetModifierTotalDamageOutgoing_Percentage(): number {
		if (this.ModifierActive()) {
			return this.damage_amp_pct!;
		}

		return 0;
	}

	OnTooltip(): number {
		return this.talent_stacks_threshold!;
	}

	ModifierActive(): boolean {
		if (this.parent.PassivesDisabled()) return false;

		if (this.parent.GetModifierStackCount(this.modifier_dead_of_night, this.parent) >= this.talent_stacks_threshold!) {
			return true;
		} else {
			return false;
		}
	}
}

@registerTalent(undefined, modifier_reimagined_night_stalker_talent_8)
export class reimagined_night_stalker_talent_8 extends BaseTalent {}
