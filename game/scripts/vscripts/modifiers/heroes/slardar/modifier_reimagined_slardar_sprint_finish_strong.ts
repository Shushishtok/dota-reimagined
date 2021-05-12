import { SlardarTalents } from "../../../abilities/heroes/slardar/reimagined_slardar_talents";
import { BaseModifierMotionHorizontal, registerModifier } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenEntities, FindUnitsAroundUnit, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_sprint_finish_strong extends BaseModifierMotionHorizontal {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_jump: string = "tutorial_bridge_fall";
	sound_landing: string = "n_mud_golem.Boulder.Cast";
	particle_jump: string = "particles/heroes/slardar/slardar_finish_strong_jump.vpcf";
	particle_jump_fx?: ParticleID;
	particle_trail: string = "particles/heroes/slardar/slardar_finish_strong_trail.vpcf";
	particle_landing: string = "particles/heroes/slardar/slardar_finish_strong_landing.vpcf";
	particle_landing_fx?: ParticleID;
	distance_traveled: number = 0;
	enemies_moved_set: Set<CDOTA_BaseNPC> = new Set();

	// Modifier specials
	finish_strong_distance?: number;
	finish_strong_radius?: number;
	finish_strong_damage?: number;
	finish_strong_stun_duration?: number;

	// Reimagined talent properties
	modifier_talent_1_slow: string = "modifier_reimagined_slardar_talent_1_slow_debuff";

	// Reimagined talent specials
	talent_1_bonus_damage?: number;
	talent_1_radius?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		// Modifier specials
		this.finish_strong_distance = this.ability.GetSpecialValueFor("finish_strong_distance");
		this.finish_strong_radius = this.ability.GetSpecialValueFor("finish_strong_radius");
		this.finish_strong_damage = this.ability.GetSpecialValueFor("finish_strong_damage");
		this.finish_strong_stun_duration = this.ability.GetSpecialValueFor("finish_strong_stun_duration");

		if (!IsServer()) return;

		// Check if the parent is currently affected by motion controllers - do nothing if so
		if (this.parent.IsCurrentlyVerticalMotionControlled() || this.parent.IsCurrentlyHorizontalMotionControlled()) this.Destroy();

		// Apply motion controller
		if (!this.ApplyHorizontalMotionController()) return;

		// Start gesture
		this.parent.StartGestureWithPlaybackRate(GameActivity.DOTA_CAST_ABILITY_2, 1.05);

		// Play sound
		this.parent.EmitSound(this.sound_jump);

		// Create particle effect
		this.particle_jump_fx = ParticleManager.CreateParticle(this.particle_jump, ParticleAttachment.ABSORIGIN, this.parent);
		ParticleManager.SetParticleControl(this.particle_jump_fx, 0, this.parent.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_jump_fx, 3, this.parent.GetAbsOrigin());
		ParticleManager.ReleaseParticleIndex(this.particle_jump_fx);
	}

	GetEffectName(): string {
		return this.particle_trail;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}

	UpdateHorizontalMotion(parent: CDOTA_BaseNPC, interval: number) {
		if (!IsServer()) return;

		const distance_per_frame = (this.finish_strong_distance! / this.GetDuration()) * interval;

		if (this.distance_traveled < this.finish_strong_distance!) {
			// Move yourself forward
			const direction = this.parent.GetForwardVector();
			const caster_new_pos = (this.parent.GetAbsOrigin() + direction * distance_per_frame) as Vector;
			this.parent.SetAbsOrigin(caster_new_pos);

			// Find all enemies in AoE to drag with you
			const enemies = FindUnitsAroundUnit(this.parent, this.parent, this.parent.GetHullRadius() * 2, UnitTargetTeam.ENEMY, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.NONE);

			for (const enemy of enemies) {
				// Move enemy forward
				const enemy_new_position = (enemy.GetAbsOrigin() + direction * distance_per_frame) as Vector;
				enemy.SetAbsOrigin(enemy_new_position);

				// Add enemy to the set if not there already for later to make sure it has a proper position
				if (!this.enemies_moved_set.has(enemy)) {
					this.enemies_moved_set.add(enemy);
				}
			}
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS, ModifierFunction.DISABLE_TURNING];
	}

	GetModifierDisableTurning(): 0 | 1 {
		return 1;
	}

	OnDestroy(): void {
		if (!IsServer()) return;

		// Find position
		FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), true);

		// Resolve positions
		ResolveNPCPositions(this.parent.GetAbsOrigin(), this.parent.GetHullRadius());

		// Play landing sound
		this.parent.EmitSound(this.sound_landing);

		// Run over the set, and find a clear position for enemies that were affected over the duration
		for (const enemy of this.enemies_moved_set.values()) {
			if (IsValidEntity(enemy) && enemy.IsAlive()) {
				FindClearSpaceForUnit(enemy, enemy.GetAbsOrigin(), true);

				// Resolve positions
				ResolveNPCPositions(enemy.GetAbsOrigin(), enemy.GetHullRadius());
			}
		}

		// Deal damage and stun all enemies in radius
		const enemies = FindUnitsAroundUnit(this.parent, this.parent, this.finish_strong_radius!, UnitTargetTeam.ENEMY, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.NONE);

		for (const enemy of enemies) {
			// Talent: Tail Whack: Finish Strong deals additional x physical damage on all enemies in z radius of the landing position. Enemies that weren't stunned by it are slowed by y% for the duration.
			let damage = this.finish_strong_damage!;
			damage += this.ReimaginedTalentTailWhackBonusDamage();

			// Deal damage to the enemy
			ApplyDamage({
				attacker: this.parent,
				damage: damage,
				damage_type: DamageTypes.PHYSICAL,
				victim: enemy,
				ability: this.ability,
				damage_flags: DamageFlag.NONE,
			});

			// Stun target
			enemy.AddNewModifier(this.parent, this.ability, BuiltInModifier.STUN, { duration: this.finish_strong_stun_duration! });
		}

		// Talent: Tail Whack: Finish Strong deals additional x physical damage on all enemies in z radius of the landing position. Enemies that weren't stunned by it are slowed by y% for the duration.
		this.ReimaginedTalentTailWhack();

		// Get actual radius
		let finish_strong_radius = this.finish_strong_radius!;
		finish_strong_radius = this.ReimaginedTalentTailWhackRadius(finish_strong_radius);

		// Play splash particles in the landing position
		this.particle_landing_fx = ParticleManager.CreateParticle(this.particle_landing, ParticleAttachment.ABSORIGIN, this.parent);
		ParticleManager.SetParticleControl(this.particle_landing_fx, 0, this.parent.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_landing_fx, 1, Vector(finish_strong_radius, 0, 0));
		ParticleManager.ReleaseParticleIndex(this.particle_landing_fx);

		// Fade gesture
		this.parent.FadeGesture(GameActivity.DOTA_CAST_ABILITY_2);
	}

	ReimaginedTalentTailWhack() {
		if (HasTalent(this.caster, SlardarTalents.SlardarTalent_1)) {
			// Initialize variables
			if (!this.talent_1_radius) this.talent_1_radius = GetTalentSpecialValueFor(this.caster, SlardarTalents.SlardarTalent_1, "radius");

			// Find all enemies in this radius
			// Deal damage and stun all enemies in radius
			let enemies = FindUnitsAroundUnit(this.parent, this.parent, this.talent_1_radius!, UnitTargetTeam.ENEMY, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.NONE);

			// Filter enemies that are closer than the initial radius
			enemies = enemies.filter((enemy) => CalculateDistanceBetweenEntities(this.parent, enemy) > this.finish_strong_radius!);

			for (const enemy of enemies) {
				let damage = this.finish_strong_damage!;
				damage += this.ReimaginedTalentTailWhackBonusDamage();

				// Deal damage to the enemy
				ApplyDamage({
					attacker: this.caster,
					damage: damage,
					damage_type: DamageTypes.PHYSICAL,
					victim: enemy,
					ability: this.ability,
					damage_flags: DamageFlag.NONE,
				});

				// Slow them for the stun duration
				enemy.AddNewModifier(this.parent, this.ability, this.modifier_talent_1_slow, { duration: this.finish_strong_stun_duration! });
			}
		}
	}

	ReimaginedTalentTailWhackRadius(radius: number): number {
		if (HasTalent(this.parent, SlardarTalents.SlardarTalent_1)) {
			// Initialize variables
			if (!this.talent_1_radius) this.talent_1_radius = GetTalentSpecialValueFor(this.caster, SlardarTalents.SlardarTalent_1, "radius");

			return this.talent_1_radius;
		}

		return radius;
	}

	ReimaginedTalentTailWhackBonusDamage(): number {
		if (HasTalent(this.caster, SlardarTalents.SlardarTalent_1)) {
			// Initialize variables
			if (!this.talent_1_bonus_damage) this.talent_1_bonus_damage = GetTalentSpecialValueFor(this.caster, SlardarTalents.SlardarTalent_1, "bonus_damage");

			// Return bonus damage
			return this.talent_1_bonus_damage;
		}

		return 0;
	}
}
