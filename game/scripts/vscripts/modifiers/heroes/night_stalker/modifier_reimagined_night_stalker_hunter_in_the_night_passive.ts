import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "./modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
import { modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights } from "./modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights";
import { modifier_reimagined_night_stalker_hunter_in_the_night_model } from "./modifier_reimagined_night_stalker_hunter_in_the_night_model";

@registerModifier()
export class modifier_reimagined_night_stalker_hunter_in_the_night_passive extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	night_transform_response: string[] = [
		"night_stalker_nstalk_ability_dark_01",
		"night_stalker_nstalk_ability_dark_02",
		"night_stalker_nstalk_ability_dark_04",
		"night_stalker_nstalk_ability_dark_05",
		"night_stalker_nstalk_ability_dark_06",
	];
	night_rare_transform_response: string = "night_stalker_nstalk_ability_dark_03";
	night_rarest_transform_response: string = "night_stalker_nstalk_ability_dark_07";
	day_transform_response: string[] = ["night_stalker_nstalk_dayrise_01", "night_stalker_nstalk_dayrise_02", "night_stalker_nstalk_dayrise_03"];
	day_rare_transform_response: string = "night_stalker_nstalk_dayrise_05";
	day_rarest_transform_response: string = "night_stalker_nstalk_dayrise_04";
	particle_transition: string = "particles/units/heroes/hero_night_stalker/nightstalker_change.vpcf";
	particle_transition_fx?: ParticleID;
	particle_buff: string = "particles/units/heroes/hero_night_stalker/nightstalker_night_buff.vpcf";
	particle_buff_fx?: ParticleID;
	day_model: string = "models/heroes/nightstalker/nightstalker.vmdl";
	night_model: string = "models/heroes/nightstalker/nightstalker_night.vmdl";
	wings?: CBaseEntity;
	legs?: CBaseEntity;
	tail?: CBaseEntity;
	currently_day: boolean = true;
	natural_night: boolean = false;
	base_night_duration: number = 300;

	// Modifier specials
	bonus_movement_speed_pct_night?: number;
	bonus_attack_speed_night?: number;

	// Reimagined specials
	everlasting_night_duration?: number;

	// Reimagined talent specials
	bonuses_pct?: number;
	day_vision_bonus?: number;

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

	OnCreated(): void {
		// Modifier specials
		this.bonus_movement_speed_pct_night = this.ability.GetSpecialValueFor("bonus_movement_speed_pct_night");
		this.bonus_attack_speed_night = this.ability.GetSpecialValueFor("bonus_attack_speed_night");

		// Reimagined specials
		this.everlasting_night_duration = this.ability.GetSpecialValueFor("everlasting_night_duration");

		// Start thinking
		if (IsServer()) this.StartIntervalThink(0.5);
	}

	OnRefresh(): void {
		// Update specials
		this.bonus_movement_speed_pct_night = this.ability.GetSpecialValueFor("bonus_movement_speed_pct_night");
		this.bonus_attack_speed_night = this.ability.GetSpecialValueFor("bonus_attack_speed_night");
	}

	OnIntervalThink(): void {
		// Check if this is currently a day or night
		const is_day = GameRules.IsDaytime();

		// Check if natural night time has been triggered
		if (!this.natural_night) {
			if (GameRules.GetTimeOfDay() >= 0.75 || GameRules.GetTimeOfDay() <= 0.249) {
				this.natural_night = true;

				// Reimagination: Dead of Night: Grants a bonus to all of Night Stalkers stats and abilities for every 5 second interval that the current night has lasted. The bonus reaches its zenith in the middle of the night and then begins to decay.
				this.ReimaginationDeadOfNight();
			}
		} else {
			if (GameRules.GetTimeOfDay() >= 0.249 && GameRules.GetTimeOfDay() <= 0.75) {
				this.natural_night = false;

				// Reimagination: Everlasting Nights: Each natural night lasts 15 seconds longer than the one before
				this.ReimaginationEverlastingNights();
			}
		}

		// Check if the day cycle changed from day to night
		if (this.currently_day && !is_day) {
			// Change to night
			this.currently_day = false;

			// Change stack count to 1 to signal this is now night time for clientside
			this.SetStackCount(1);

			// Night transform responses
			// Roll for rarest transform response
			if (RollPercentage(5)) {
				EmitSoundOn(this.night_rarest_transform_response, this.parent);
			}

			// Roll for rare transform response
			else if (RollPercentage(15)) {
				EmitSoundOn(this.night_rare_transform_response, this.parent);
			}

			// Roll for normal transform response
			else if (RollPercentage(75)) {
				EmitSoundOn(this.night_transform_response[RandomInt(0, this.night_transform_response.length - 1)], this.parent);
			}

			// Change model to night
			this.parent.AddNewModifier(this.caster, this.ability, modifier_reimagined_night_stalker_hunter_in_the_night_model.name, {});

			// Attach wearables
			this.wings = SpawnEntityFromTableSynchronous("prop_dynamic", { model: "models/heroes/nightstalker/nightstalker_wings_night.vmdl" });
			this.legs = SpawnEntityFromTableSynchronous("prop_dynamic", { model: "models/heroes/nightstalker/nightstalker_legarmor_night.vmdl" });
			this.tail = SpawnEntityFromTableSynchronous("prop_dynamic", { model: "models/heroes/nightstalker/nightstalker_tail_night.vmdl" });

			// Lock wearables to bone
			this.wings.FollowEntity(this.parent, true);
			this.legs.FollowEntity(this.parent, true);
			this.tail.FollowEntity(this.parent, true);

			this.ApplyTransitionBuffParticle();

			// Apply buff particle
			this.particle_buff_fx = ParticleManager.CreateParticle(this.particle_buff, ParticleAttachment.CUSTOMORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.particle_buff_fx, 0, this.parent.GetAbsOrigin());
			ParticleManager.SetParticleControl(this.particle_buff_fx, 1, Vector(1, 0, 0));

			return;
		}

		// Check if the day cycle changed from night to day
		if (!this.currently_day && is_day) {
			// Change to day
			this.currently_day = true;

			// Change stack count to 0 to signal this is now day time for clientside
			this.SetStackCount(0);

			// Day transformation responses
			// Roll for rarest transform response
			if (RollPercentage(5)) {
				EmitSoundOn(this.day_rarest_transform_response, this.parent);
			}
			// Roll for rare transform response
			else if (RollPercentage(15)) {
				EmitSoundOn(this.day_rare_transform_response, this.parent);
			}
			// Play normal transform response
			else {
				EmitSoundOn(this.day_transform_response[RandomInt(0, this.day_transform_response.length - 1)], this.parent);
			}

			// Apply transition buff
			this.ApplyTransitionBuffParticle();

			// Destroy buff particle
			if (this.particle_buff_fx) {
				ParticleManager.DestroyParticle(this.particle_buff_fx, false);
				ParticleManager.ReleaseParticleIndex(this.particle_buff_fx);
			}

			return;
		}
	}

	ApplyTransitionBuffParticle(): void {
		// Apply transition buff
		this.particle_transition_fx = ParticleManager.CreateParticle(this.particle_transition, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
		ParticleManager.SetParticleControl(this.particle_transition_fx, 0, this.parent.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_transition_fx, 1, this.parent.GetAbsOrigin());
		ParticleManager.ReleaseParticleIndex(this.particle_transition_fx);
	}

	ReimaginationDeadOfNight(): void {
		if (!this.parent.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name)) {
			// Add the Dead of Night modifier to Night Stalker
			this.parent.AddNewModifier(this.caster!, this.ability, modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name, {});
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
			ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
			ModifierFunction.IGNORE_MOVESPEED_LIMIT, // Reimagination: As Quick As a Shadow
			ModifierFunction.BONUS_DAY_VISION, // Talent: Daywalker
		];
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Only active at night
		if (this.GetStackCount() == 1) {
			return this.bonus_movement_speed_pct_night!;
		}

		// Talent: Daywalker: During daytime, Night Stalker gains x% of the normal movement and attack speed bonuses, and gains bonus y day vision range.
		let movespeed_bonus = 0;
		movespeed_bonus = this.ReimaginedTalentDaywalker(true);

		return movespeed_bonus;
	}

	GetModifierAttackSpeedBonus_Constant(): number {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Only active at night
		if (this.GetStackCount() == 1) {
			return this.bonus_attack_speed_night!;
		}

		// Talent: Daywalker: During daytime, Night Stalker gains x% of the normal movement and attack speed bonuses, and gains bonus y day vision range.
		let attack_speed_bonus = 0;
		attack_speed_bonus = this.ReimaginedTalentDaywalker(true);

		return attack_speed_bonus;
	}

	GetModifierIgnoreMovespeedLimit(): 0 | 1 {
		// Does nothing when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Only active at night
		if (this.GetStackCount() == 1) {
			return 1;
		}

		return 0;
	}

	GetBonusDayVision(): number {
		return this.ReimaginedTalentDaywalkerVision();
	}

	ReimaginationEverlastingNights(): void {
		// Check if the parent has the Everlasting Nights modifier
		let modifier_everlasting;
		if (this.parent.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights.name)) {
			modifier_everlasting = this.parent.FindModifierByName(modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights.name);
		} else {
			modifier_everlasting = this.parent.AddNewModifier(this.parent, this.ability, modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights.name, {});
		}

		// Trigger temporary night and increment stack for the next occassion
		if (modifier_everlasting) {
			// Get current stacks and calculate length. When we're in perma night mode, run for double the night duration minus one.
			let extra_night_duration = modifier_everlasting.GetStackCount() * this.everlasting_night_duration!;
			if (extra_night_duration >= this.base_night_duration * 2) {
				extra_night_duration = this.base_night_duration * 2 - 1;
			}

			// Begin a temporary night to extend the night
			if (extra_night_duration > 0) {
				GameRules.BeginTemporaryNight(extra_night_duration);
			}

			// Increment stacks until we're in perma night, in which case stop going up.
			const stacks_to_perma_night = this.base_night_duration / this.everlasting_night_duration!;
			if (modifier_everlasting.GetStackCount() < stacks_to_perma_night) {
				modifier_everlasting.IncrementStackCount();
			}
		}
	}

	ReimaginedTalentDaywalker(attack_speed: boolean): number {
		let bonus = 0;
		if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_5)) {
			if (!this.bonuses_pct) this.bonuses_pct = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_5, "bonuses_pct");

			// Only active at day time
			if (this.GetStackCount() == 0) {
				if (attack_speed) {
					return (bonus = this.bonus_attack_speed_night! * this.bonuses_pct! * 0.01);
				} else {
					return (bonus = this.bonus_movement_speed_pct_night! * this.bonuses_pct * 0.01);
				}
			}
		}

		return bonus;
	}

	ReimaginedTalentDaywalkerVision(): number {
		if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_5)) {
			if (!this.day_vision_bonus) this.day_vision_bonus = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_5, "day_vision_bonus");
			if (this.GetStackCount() == 0) {
				return this.day_vision_bonus;
			}
		}

		return 0;
	}
}
