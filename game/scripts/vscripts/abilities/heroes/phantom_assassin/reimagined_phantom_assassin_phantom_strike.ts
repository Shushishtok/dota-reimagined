import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_phantom_strike_buff } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_phantom_strike_buff";
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_phantom_strike_escape_plan";
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_active";
import { PhantomAssassinTalents } from "./reimagined_phantom_assassin_talents";

@registerAbility()
export class reimagined_phantom_assassin_phantom_strike extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_start: string = "Hero_PhantomAssassin.Strike.Start";
	sound_end: string = "Hero_PhantomAssassin.Strike.End";
	particle_start: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_phantom_strike_start.vpcf";
	particle_start_fx?: ParticleID;
	particle_end: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_phantom_strike_end.vpcf";

	// Ability specials
	duration?: number;

	// Reimagined specials
	escape_plan_blur_duration?: number;

	// Reimagined talent specials
	talent_4_extend_duration?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_phantom_strike_start.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_phantom_strike_end.vpcf", context);
	}

	GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {
		return this.GetSpecialValueFor("cast_range");
	}

	CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult {
		if (target == this.caster) return UnitFilterResult.FAIL_CUSTOM;

		return UnitFilter(target, UnitTargetTeam.BOTH, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.MAGIC_IMMUNE_ENEMIES, this.caster.GetTeamNumber());
	}

	GetCustomCastErrorTarget(target: CDOTA_BaseNPC): string {
		return "dota_hud_error_cant_cast_on_self";
	}

	OnSpellStart(): void {
		// Ability properties
		const target = this.GetCursorTarget()!;
		const hull_radius = this.caster.GetHullRadius();
		const caster_pos = this.caster.GetAbsOrigin();

		// Ability specials
		this.duration = this.GetSpecialValueFor("duration");

		// Reimagined specials
		this.escape_plan_blur_duration = this.GetSpecialValueFor("escape_plan_blur_duration");

		// Check for Linken's Sphere
		if (target.GetTeamNumber() != this.caster.GetTeamNumber()) {
			if (target.TriggerSpellAbsorb(this)) {
				return;
			}
		}

		// Play start sound
		EmitSoundOnLocationWithCaster(caster_pos, this.sound_start, this.caster);

		// Create and release start particle
		this.particle_start_fx = ParticleManager.CreateParticle(this.particle_start, ParticleAttachment.WORLDORIGIN, undefined);
		ParticleManager.SetParticleControl(this.particle_start_fx, 0, caster_pos);
		ParticleManager.SetParticleControl(this.particle_start_fx, 1, Vector(1, 1, 1));
		ParticleManager.ReleaseParticleIndex(this.particle_start_fx);

		// Reimagined: Nothin Personalle: applies instant attacks on all enemies between PA and her target. Width is based on her hull width + current attack range. Ignores the main target.
		this.ReimaginedNothingPersonalle(target);

		// Move in front of target and resolve units being stuck
		const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target.GetAbsOrigin());
		const distance = util.CalculateDistanceBetweenEntities(this.caster, target);
		const moving_position = (this.caster.GetAbsOrigin() + direction * (distance - hull_radius)) as Vector;
		FindClearSpaceForUnit(this.caster, moving_position, true);
		ResolveNPCPositions(moving_position, hull_radius);

		// Play end sound
		EmitSoundOn(this.sound_end, target);

		// Create and release end particle
		ParticleManager.ReleaseParticleIndex(ParticleManager.CreateParticle(this.particle_end, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster));

		// If target is an enemy, gain the bonus attack speed buff and give order to attack
		if (target.GetTeamNumber() != this.caster.GetTeamNumber()) {
			const modifier = this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_phantom_strike_buff.name, {
				duration: this.duration,
			}) as modifier_reimagined_phantom_assassin_phantom_strike_buff;
			this.caster.MoveToTargetToAttack(target);

			// Reimagined: Relentless Assassin: The attack speed buff refreshes itself when Phantom Assassin attacks the main target.
			this.ReimaginedRelentlessAssassin(modifier, target);
		} else {
			// Reimagined: Escape Plan: When blinking to an ally, Phantom Assassin gains the Blur invisibility for x seconds, and gets a y% move speed bonus as well for the duration.
			this.ReimaginedEscapePlan();
		}
	}

	ReimaginedNothingPersonalle(target: CDOTA_BaseNPC) {
		// Calculate width
		const width = this.caster.GetHullRadius() + this.caster.Script_GetAttackRange();

		// Find all enemies in line
		const enemies = FindUnitsInLine(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			target.GetAbsOrigin(),
			undefined,
			width,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NOT_ATTACK_IMMUNE + UnitTargetFlags.NO_INVIS
		);

		// Perform attack on them.
		for (const enemy of enemies) {
			// Ignores the main target
			if (enemy == target) continue;

			// Instant attack!
			this.caster.PerformAttack(enemy, true, true, true, false, false, false, false);

			// Secret Blade: All enemies hit by Nothing Personalle are affected with Stifling Dagger's slow debuff and are ministunned. If they are already afflicted with Stifling Dagger's debuff, then the duration is refreshed and extended by x seconds.
			this.ReimaginedTalentSecretBlade(enemy);
		}
	}

	ReimaginedRelentlessAssassin(modifier: modifier_reimagined_phantom_assassin_phantom_strike_buff, target: CDOTA_BaseNPC): void {
		modifier.main_target = target;
	}

	ReimaginedEscapePlan(): void {
		// Apply Blur and Escape Plan modifiers on the caster. Blur is only applied if it is learned!
		if (this.caster.HasAbility("reimagined_phantom_assassin_blur")) {
			const ability = this.caster.FindAbilityByName("reimagined_phantom_assassin_blur");
			if (ability && ability.IsTrained() && !this.caster.HasModifier("modifier_reimagined_phantom_assassin_blur_active")) {
				this.caster.AddNewModifier(this.caster, ability, "modifier_reimagined_phantom_assassin_blur_active", { duration: this.escape_plan_blur_duration });
			}
		}

		this.caster.AddNewModifier(this.caster, this, "modifier_reimagined_phantom_assassin_phantom_strike_escape_plan", { duration: this.escape_plan_blur_duration! });
	}

	ReimaginedTalentSecretBlade(target: CDOTA_BaseNPC) {
		if (util.HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_4)) {
			// Ministun the target
			target.AddNewModifier(this.caster, this, BuiltInModifier.STUN, { duration: 0.1 });

			// Check if target has the slow debuff
			if (target.HasModifier("modifier_reimagined_phantom_assassin_stifling_dagger_slow")) {
				// Refresh and extend debuff duration
				const modifier = target.FindModifierByName("modifier_reimagined_phantom_assassin_stifling_dagger_slow");
				if (modifier) {
					// Initialize variables
					if (!this.talent_4_extend_duration)
						this.talent_4_extend_duration = util.GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_4, "talent_4_extend_duration");

					modifier.SetDuration(modifier.GetDuration() + this.talent_4_extend_duration, true);
					modifier.ForceRefresh();
				}
			}
			// If not, apply the slow
			else {
				// Get Stifling Dagger ability handle
				if (this.caster.HasAbility("reimagined_phantom_assassin_stifling_dagger")) {
					const ability_handle = this.caster.FindAbilityByName("reimagined_phantom_assassin_stifling_dagger");
					if (ability_handle && ability_handle.IsTrained()) {
						// Get duration and apply the slow modifier
						const duration = ability_handle.GetSpecialValueFor("duration");
						target.AddNewModifier(this.caster, ability_handle, "modifier_reimagined_phantom_assassin_stifling_dagger_slow", { duration: duration });
					}
				}
			}
		}
	}
}
