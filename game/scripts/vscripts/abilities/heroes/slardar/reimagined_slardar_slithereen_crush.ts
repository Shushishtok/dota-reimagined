import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit, FindUnitsInRadiusOuterRing, GenerateRandomPositionAroundPositionAngled, HasTalent, IsInRiver, SpawnDummyUnit } from "../../../lib/util";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_puddle_thinker";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_slithereen_crush_slow";
import { SlardarTalents } from "./reimagined_slardar_talents";

@registerAbility()
export class reimagined_slardar_slithereen_crush extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_cast: string = "Hero_Slardar.Slithereen_Crush";
	particle_start: string = "particles/units/heroes/hero_slardar/slardar_crush_start.vpcf";
	particle_start_fx?: ParticleID;
	particle_cast: string = "particles/units/heroes/hero_slardar/slardar_crush.vpcf";
	particle_cast_fx?: ParticleID;
	particle_hit: string = "particles/units/heroes/hero_slardar/slardar_crush_entity.vpcf";
	particle_hit_fx?: ParticleID;
	modifier_slow: string = "modifier_reimagined_slardar_slithereen_crush_slow";
	modifier_puddle_thinker: string = "modifier_reimagined_slardar_puddle_thinker";

	// Ability specials
	crush_radius?: number;
	crush_extra_slow_duration?: number;
	stun_duration?: number;
	puddle_duration?: number;

	// Reimagined properties
	projectile_splash_attack: string = "particles/heroes/slardar/slardar_splash_attack_projectile.vpcf";
	particle_brine_breeze: string = "particles/heroes/slardar/slardar_brine_breeze.vpcf";
	particle_brine_breeze_fx?: ParticleID;

	// Reimagined ability specials
	splash_attack_radius?: number;
	splash_attack_puddle_count?: number;
	splash_attack_puddle_search_radius?: number;
	splash_attack_puddle_radius?: number;
	splash_attack_puddle_duration?: number;
	splash_attack_projectile_speed?: number;
	splash_attack_projectile_vision?: number;
	brine_breeze_range?: number;

	// Reimagined talent properties
	particle_naga_instincts: string = "particles/heroes/slardar/slardar_naga_instincts.vpcf";
	particle_naga_instincts_fx?: ParticleID;

	// TODO: precache particles on this ability
	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_crush_start.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_crush.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_crush_entity.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_naga_instincts.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_water_puddle.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_splash_attack_puddle.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_slardar_crush.vpcf", context);
	}

	OnUpgrade(): void {
		// Update ability specials
		this.crush_radius = this.GetSpecialValueFor("crush_radius");
		this.crush_extra_slow_duration = this.GetSpecialValueFor("crush_extra_slow_duration");
		this.stun_duration = this.GetSpecialValueFor("stun_duration");
		this.puddle_duration = this.GetSpecialValueFor("puddle_duration");

		// Reimagined ability specials
		this.splash_attack_radius = this.GetSpecialValueFor("splash_attack_radius");
		this.splash_attack_puddle_count = this.GetSpecialValueFor("splash_attack_puddle_count");
		this.splash_attack_puddle_search_radius = this.GetSpecialValueFor("splash_attack_puddle_search_radius");
		this.splash_attack_puddle_radius = this.GetSpecialValueFor("splash_attack_puddle_radius");
		this.splash_attack_puddle_duration = this.GetSpecialValueFor("splash_attack_puddle_duration");
		this.splash_attack_projectile_speed = this.GetSpecialValueFor("splash_attack_projectile_speed");
		this.splash_attack_projectile_vision = this.GetSpecialValueFor("splash_attack_projectile_vision");
		this.brine_breeze_range = this.GetSpecialValueFor("brine_breeze_range");
	}

	GetCastRange(): number {
		return this.ReimaginedSplashAttackCastRange();
	}

	GetBehavior(): number | Uint64 {
		// Reimagined Talent: Naga Instincts: Allows Slithereen Crush to be cast while stunned. If Slardar is stunned when casting Slithereen Crush, he is also Strong Dispelled.
		if (HasTalent(this.caster, SlardarTalents.SlardarTalent_4) && this.caster.IsStunned()) {
			return AbilityBehavior.NO_TARGET + AbilityBehavior.IMMEDIATE + AbilityBehavior.IGNORE_PSEUDO_QUEUE;
		} else {
			return super.GetBehavior();
		}
	}

	ReimaginedSplashAttackCastRange(): number {
		// Return bonus cast range if is in river thanks to Splash Attack, or the original cast range
		return IsInRiver(this.caster) ? this.GetSpecialValueFor("splash_attack_radius") : this.GetSpecialValueFor("crush_radius");
	}

	OnAbilityPhaseStart(): boolean {
		this.particle_start_fx = ParticleManager.CreateParticle(this.particle_start, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
		ParticleManager.SetParticleControl(this.particle_start_fx, 0, this.caster.GetAbsOrigin());
		return true;
	}

	OnAbilityPhaseInterrupted(): void {
		// Clear when interrupted or not fully cast
		if (this.particle_start_fx) {
			ParticleManager.DestroyParticle(this.particle_start_fx, true);
			ParticleManager.ReleaseParticleIndex(this.particle_start_fx);
			this.particle_start_fx = undefined;
		}
	}

	OnSpellStart(): void {
		// Release the start particle if it exists
		if (this.particle_start_fx) {
			ParticleManager.ReleaseParticleIndex(this.particle_start_fx);
			this.particle_start_fx = undefined;
		}

		// Reimagind Talent: Naga Instincts: Allows Slithereen Crush to be cast while stunned. If Slardar is stunned when casting Slithereen Crush, he is also Strong Dispelled.
		this.ReimaginedTalentNagaInstincts();

		// Execute a Slithereen Crush!
		this.SlithereenCrush(true, this.caster, false);
	}

	SlithereenCrush(splash_attack: boolean, casting_unit: CDOTA_BaseNPC, force_river_values: boolean) {
		// Play sound
		this.EmitSound(this.sound_cast);

		// Reimagined: Splash Attack: When cast while considered in the river, the radius of Slithereen Crush increases. Additionally, throws x projectiles of water to random locations in 1200 range around the caster, each forming a y radius puddle for z seconds.
		let crush_radius = this.crush_radius!;
		crush_radius = this.ReimaginedSplashAttack(splash_attack, false);

		// Play particle effect
		this.particle_cast_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.WORLDORIGIN, undefined);
		ParticleManager.SetParticleControl(this.particle_cast_fx, 0, casting_unit.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_cast_fx, 1, Vector(crush_radius, 0, 0));
		ParticleManager.ReleaseParticleIndex(this.particle_cast_fx);

		// Find all nearby enemies around the caster
		const enemies = FindUnitsAroundUnit(this.caster, casting_unit, crush_radius, UnitTargetTeam.ENEMY, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.NONE);

		// Loop enemies found
		for (const enemy of enemies) {
			// Play hit particle
			this.particle_hit_fx = ParticleManager.CreateParticle(this.particle_hit, ParticleAttachment.CUSTOMORIGIN, enemy);
			ParticleManager.SetParticleControlEnt(this.particle_hit_fx, 0, enemy, ParticleAttachment.POINT, AttachLocation.HITLOC, enemy.GetAbsOrigin(), true);
			ParticleManager.ReleaseParticleIndex(this.particle_hit_fx);

			// Stun
			enemy.AddNewModifier(this.caster, this, BuiltInModifier.STUN, { duration: this.stun_duration });

			// Add slow modifier (slow duration + stun duration)
			enemy.AddNewModifier(this.caster, this, this.modifier_slow, { duration: this.stun_duration! + this.crush_extra_slow_duration! });

			// Deal damage
			ApplyDamage({
				attacker: this.caster,
				damage: this.GetAbilityDamage(),
				damage_type: this.GetAbilityDamageType(),
				victim: enemy,
				ability: this,
			});

			// TODO: Shard effect: applies Corrosive Haze's debuff on targets hit if they don't have it. Ignores otherwise (add when Corrosive Haze is done)
		}

		// Reimagined: Brine Breeze: Applies the slow debuff to enemies that are outside the regular AoE, but in x range of the outer ring
		this.ReimaginedBrineBreeze(casting_unit);

		// Check if cast can proc puddles (talent)
		if (splash_attack) {
			// Scepter effect: creates a puddle at the cast location
			if (this.caster.HasScepter()) {
				CreateModifierThinker(this.caster, this, this.modifier_puddle_thinker, { duration: this.puddle_duration }, casting_unit.GetAbsOrigin(), this.caster.GetTeamNumber(), false);
			}
		}
	}

	ReimaginedSplashAttack(splash_attack: boolean, force_river_values: boolean): number {
		if (IsInRiver(this.caster)) {
			if (splash_attack) {
				// Find random positions in the AoE
				for (let index = 0; index < this.splash_attack_puddle_count!; index++) {
					const position = GenerateRandomPositionAroundPositionAngled(
						this.caster.GetAbsOrigin(),
						this.caster.GetForwardVector(),
						300,
						this.splash_attack_puddle_search_radius!,
						index * 90,
						index + 1 * 90
					);

					// Create dummy in position
					const dummy = SpawnDummyUnit(position, this.caster);

					// Fire tracking projectiles at the dummy
					ProjectileManager.CreateTrackingProjectile({
						Ability: this,
						EffectName: this.projectile_splash_attack,
						Source: this.caster,
						Target: dummy,
						bDodgeable: false,
						bDrawsOnMinimap: false,
						bIgnoreObstructions: true,
						bIsAttack: false,
						bProvidesVision: true,
						iMoveSpeed: this.splash_attack_projectile_speed,
						iVisionTeamNumber: this.caster.GetTeamNumber(),
						iVisionRadius: this.splash_attack_projectile_vision,
						bVisibleToEnemies: true,
					});
				}
			}

			return this.splash_attack_radius!;
		} else if (force_river_values) {
			return this.splash_attack_radius!;
		} else {
			return this.crush_radius!;
		}
	}

	OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
		if (!IsServer()) return;
		if (!target) return;

		// Create vision around the puddle
		AddFOWViewer(this.caster.GetTeamNumber(), location, this.splash_attack_projectile_vision!, this.splash_attack_puddle_duration!, true);

		// Reimagined: Splash Attack: When cast while considered in the river, the radius of Slithereen Crush increases. Additionally, throws x projectiles of water to random locations in 1200 range around the caster, each forming a y radius puddle for z seconds.
		this.ReimaginedSplashAttackProjectileHit(target);
	}

	ReimaginedSplashAttackProjectileHit(target: CDOTA_BaseNPC) {
		// Grant the dummy the aura modifier
		target.AddNewModifier(this.caster, this, this.modifier_puddle_thinker, { duration: this.splash_attack_puddle_duration, splash_attack_radius: this.splash_attack_puddle_radius });

		// Reimagined Talent: Hydro Pump: When Splash Attack projectiles land at their target position, a Slithereen Crush is cast on their location, utilizing river values. Those projectiles cannot create additional puddles.
		this.ReimaginedTalentHydroPump(target);
	}

	ReimaginedTalentHydroPump(dummy: CDOTA_BaseNPC) {
		if (HasTalent(this.caster, SlardarTalents.SlardarTalent_3)) {
			// Proc Slithereen Crush at the target locations with no splashing allowed.
			this.SlithereenCrush(false, dummy, true);
		}
	}

	ReimaginedBrineBreeze(casting_unit: CDOTA_BaseNPC) {
		let crush_radius = this.crush_radius;
		crush_radius = this.ReimaginedSplashAttack(false, false);

		// Play Brine Breeze particle
		this.particle_brine_breeze_fx = ParticleManager.CreateParticle(this.particle_brine_breeze, ParticleAttachment.WORLDORIGIN, undefined);
		ParticleManager.SetParticleControl(this.particle_brine_breeze_fx, 0, casting_unit.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_brine_breeze_fx, 1, Vector(crush_radius! + this.brine_breeze_range!, 0, 0));
		ParticleManager.ReleaseParticleIndex(this.particle_brine_breeze_fx);

		// Find units in the outer ring of the AoE.
		const enemies_outer_ring = FindUnitsInRadiusOuterRing(
			this.caster,
			casting_unit.GetAbsOrigin(),
			crush_radius! + this.brine_breeze_range!,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.NONE,
			crush_radius!
		);

		// Loop enemies
		for (const enemy of enemies_outer_ring) {
			// Apply the slow debuff
			enemy.AddNewModifier(this.caster, this, this.modifier_slow, { duration: this.crush_extra_slow_duration });
		}
	}

	ReimaginedTalentNagaInstincts() {
		if (HasTalent(this.caster, SlardarTalents.SlardarTalent_4)) {
			// Check if the caster is stunned
			if (this.caster.IsStunned()) {
				// Strong dispel!
				this.caster.Purge(false, true, false, true, true);

				// Create Naga Instincts particle
				this.particle_naga_instincts_fx = ParticleManager.CreateParticle(this.particle_naga_instincts, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
				ParticleManager.SetParticleControl(this.particle_naga_instincts_fx, 0, this.caster.GetAbsOrigin());
				ParticleManager.ReleaseParticleIndex(this.particle_naga_instincts_fx);
			}
		}
	}
}
