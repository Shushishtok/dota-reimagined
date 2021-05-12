import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_stifling_dagger_slow } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_stifling_dagger_slow";
import { modifier_reimagined_phantom_assassin_stifling_dagger_caster } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_stifling_dagger_caster";
import { PhantomAssassinTalents } from "./reimagined_phantom_assassin_talents";

@registerAbility()
export class reimagined_phantom_assassin_stifling_dagger extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_cast: string = "Hero_PhantomAssassin.Dagger.Cast";
	particle_dagger: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger.vpcf";
	sound_kill_responses: string[] = [
		"phantom_assassin_phass_ability_stiflingdagger_01",
		"phantom_assassin_phass_ability_stiflingdagger_02",
		"phantom_assassin_phass_ability_stiflingdagger_03",
		"phantom_assassin_phass_ability_stiflingdagger_04",
	];
	kill_responses_chance: number = 20;

	// Reimagined properties
	dagger_map: Map<ProjectileID, boolean> = new Map();

	// Ability specials
	dagger_speed?: number;
	duration?: number;

	// Reimagined specials
	fan_of_knives_add_daggers?: number;
	fan_of_knives_delay?: number;
	fan_of_knives_fixed_damage?: number;

	// Reimagined talent properties
	projectile_hidden_dagger: string = "particles/heroes/phantom_assassin/from_the_shadow_projectile.vpcf";
	talent_projectile_set: Set<ProjectileID> = new Set();

	// Reimagined talent specials
	total_performed_attacks?: number;
	talent_2_dagger_bonus_damage?: number;
	talent_2_fake_dagger_bonus_damage?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger_debuff.vpcf", context);
	}

	OnSpellStart(): void {
		// Ability properties:
		const target = this.GetCursorTarget()!;

		// Ability specials
		this.dagger_speed = this.GetSpecialValueFor("dagger_speed");
		this.duration = this.GetSpecialValueFor("duration");

		// Reimagined specials
		this.fan_of_knives_add_daggers = this.GetSpecialValueFor("fan_of_knives_add_daggers");
		this.fan_of_knives_delay = this.GetSpecialValueFor("fan_of_knives_delay");
		this.fan_of_knives_fixed_damage = this.GetSpecialValueFor("fan_of_knives_fixed_damage");

		// Play cast sound
		EmitSoundOn(this.sound_cast, this.caster);

		// Launch a dagger towards the target
		this.ThrowStiflingDagger(target, true);

		// Launches up to x additional daggers to nearby enemies except for the main target. If there any number of daggers remaining, one dagger is thrown at the main target. The rest are not used. Additional daggers deal y fixed physical damage, and do not proc on-hit effects. Still applies the slow debuff.
		this.ReimaginedFanOfKnives(target);
	}

	ThrowStiflingDagger(target: CDOTA_BaseNPC, real_dagger: boolean) {
		let visible_to_enemies = true;
		let effect_name = this.particle_dagger;

		// Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
		let talent_projectile = false;
		if (this.ReimaginedTalentFromTheShadowsProjectile()) {
			visible_to_enemies = false;
			effect_name = this.projectile_hidden_dagger;
			talent_projectile = true;
		}

		const projectileID = ProjectileManager.CreateTrackingProjectile({
			Ability: this,
			EffectName: effect_name,
			ExtraData: {},
			Source: this.caster,
			Target: target,
			bDodgeable: true,
			bDrawsOnMinimap: false,
			bIsAttack: false,
			bProvidesVision: true,
			bReplaceExisting: false,
			bVisibleToEnemies: visible_to_enemies,
			iMoveSpeed: this.dagger_speed,
			iSourceAttachment: ProjectileAttachment.ATTACK_1,
			iVisionRadius: 450,
			iVisionTeamNumber: this.caster.GetTeamNumber(),
			vSourceLoc: this.caster.GetAbsOrigin(),
			bIgnoreObstructions: true,
			bSuppressTargetCheck: false,
		});

		// Put particle ID in the map for the on-hit data
		this.dagger_map.set(projectileID, real_dagger);

		// Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
		this.ReimaginedTalentFromTheShadowsRegisterInSet(projectileID, talent_projectile);
	}

	OnProjectileHitHandle(target: CDOTA_BaseNPC, location: Vector, projectileHandle: ProjectileID): void {
		// If there was no target, do nothing else
		if (!target) return;

		// Check for Linken's sphere
		if (target.GetTeamNumber() != this.caster.GetTeamNumber()) {
			if (target.TriggerSpellAbsorb(this)) {
				return;
			}
		}

		// Apply FOW vision on target position
		AddFOWViewer(this.caster.GetTeamNumber(), target.GetAbsOrigin(), 450, 3.34, false);

		// Check if this was a real dagger
		if (this.dagger_map.get(projectileHandle)) {
			// Set the damage altering modifier on the caster
			const caster_modifier = this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_stifling_dagger_caster.name, { duration: FrameTime() });

			// Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
			this.ReimaginedTalentFromTheShadowsApplyDamage(true, projectileHandle);

			// Calculate "set" position
			const caster_position = this.caster.GetAbsOrigin();
			const caster_forward = this.caster.GetForwardVector();
			const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target.GetAbsOrigin());
			const distance = util.CalculateDistanceBetweenEntities(this.caster, target);
			const attack_position = (caster_position + direction * (distance - 100)) as Vector;

			// Set position in front of the enemy to trigger cleaves correctly
			this.caster.SetAbsOrigin(attack_position);
			this.caster.SetForwardVector(direction);

			// Perform attack on enemy
			this.caster.PerformAttack(target, true, true, true, false, false, false, true);

			// Talent: Duo Daggers: Each dagger hit causes Phantom Assassin to perform x instant attacks on the target. Does not proc on Fan of Knives daggers.
			this.ReimaginedTalentDuoDaggers(target);

			// Return caster to its original position and forward vector
			this.caster.SetAbsOrigin(caster_position);
			this.caster.SetForwardVector(caster_forward);

			// Remove damage altering modifier from caster to prevent any other damage changes this frame
			caster_modifier.Destroy();
		} else {
			// Fake dagger: Fan of Knives
			this.ReimaginedFanOfKnivesDamage(target, projectileHandle);
		}

		// Remove projectile from map to not allow map to get too big
		this.dagger_map.delete(projectileHandle);

		// Apply slow modifier on enemy if it's not spell immune
		if (!target.IsMagicImmune()) {
			target.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_stifling_dagger_slow.name, { duration: this.duration });
		}

		// Check if target has died: if so, roll for a kill response
		if (!target.IsAlive()) {
			if (RollPercentage(this.kill_responses_chance)) {
				EmitSoundOn(this.sound_kill_responses[RandomInt(1, this.sound_kill_responses.length - 1)], this.caster);
			}
		}

		// Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
		this.ReimaginedTalentFromTheShadowsRemoveFromSet(projectileHandle);
	}

	ReimaginedFanOfKnives(main_target: CDOTA_BaseNPC): void {
		// Find all enemies in cast range
		const enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			undefined,
			this.GetCastRange(this.caster.GetAbsOrigin(), undefined) + 50,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
			FindOrder.ANY,
			false
		);

		// Throw the set amount of daggers at nearby enemies
		let daggers_thrown = 0;

		for (const enemy of enemies) {
			// Ignore main target
			if (enemy == main_target) continue;

			// Check if there are any daggers "left"
			if (daggers_thrown < this.fan_of_knives_add_daggers!) {
				// Increment thrown daggers
				daggers_thrown++;

				// Throw fake dagger at enemy
				Timers.CreateTimer(this.fan_of_knives_delay! * daggers_thrown, () => {
					this.ThrowStiflingDagger(enemy, false);
				});
			} else break;
		}

		// If after all enemies were found there are still daggers left, throw one additional at the main target
		if (daggers_thrown < this.fan_of_knives_add_daggers!) {
			// Throw fake dagger at enemy
			Timers.CreateTimer(this.fan_of_knives_delay! * (daggers_thrown + 1), () => {
				this.ThrowStiflingDagger(main_target, false);
			});
		}
	}

	ReimaginedFanOfKnivesDamage(target: CDOTA_BaseNPC, projectileID: ProjectileID): void {
		let fan_of_knives_fixed_damage = this.fan_of_knives_fixed_damage!;

		// Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
		fan_of_knives_fixed_damage += this.ReimaginedTalentFromTheShadowsApplyDamage(false, projectileID);

		// Deal damage to the target
		ApplyDamage({
			attacker: this.caster,
			damage: fan_of_knives_fixed_damage!,
			damage_type: DamageTypes.PHYSICAL,
			victim: target,
			ability: this,
			damage_flags: DamageFlag.NONE,
		});
	}

	ReimaginedTalentDuoDaggers(target: CDOTA_BaseNPC): void {
		if (util.HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_1)) {
			if (!this.total_performed_attacks) this.total_performed_attacks = util.GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_1, "total_performed_attacks");
			for (let index = 1; index < this.total_performed_attacks; index++) {
				this.caster.PerformAttack(target, true, true, true, false, false, false, true);
			}
		}
	}

	ReimaginedTalentFromTheShadowsProjectile(): boolean {
		if (util.HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_2)) {
			if (this.caster.HasModifier("modifier_reimagined_phantom_assassin_blur_active")) {
				return true;
			}
		}

		return false;
	}

	ReimaginedTalentFromTheShadowsRegisterInSet(projectileID: ProjectileID, talent_projectile: boolean) {
		if (talent_projectile) {
			this.talent_projectile_set.add(projectileID);
		}
	}

	ReimaginedTalentFromTheShadowsRemoveFromSet(projectileID: ProjectileID) {
		if (this.talent_projectile_set.has(projectileID)) {
			this.talent_projectile_set.delete(projectileID);
		}
	}

	ReimaginedTalentFromTheShadowsApplyDamage(real_projectile: boolean, projectileID: ProjectileID): number {
		if (this.talent_projectile_set.has(projectileID)) {
			if (real_projectile) {
				const modifier_caster = this.caster.FindModifierByName("modifier_reimagined_phantom_assassin_stifling_dagger_caster") as modifier_reimagined_phantom_assassin_stifling_dagger_caster;
				if (modifier_caster) {
					modifier_caster.talent_2_triggered = true;
				}
			} else {
				if (!this.talent_2_fake_dagger_bonus_damage)
					this.talent_2_fake_dagger_bonus_damage = util.GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_2, "talent_2_dagger_bonus_damage");
				return this.talent_2_fake_dagger_bonus_damage;
			}
		}

		return 0;
	}
}
