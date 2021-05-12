import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import "./modifier_reimagined_slardar_puddle";

@registerModifier()
export class modifier_reimagined_slardar_puddle_thinker extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_puddle: string = "particles/units/heroes/hero_slardar/slardar_water_puddle.vpcf";
	particle_puddle_fx?: ParticleID;
	modifier_puddle_buff: string = "modifier_reimagined_slardar_puddle";

	// Reimagined modifier properties
	particle_puddle_splash_attack: string = "particles/heroes/slardar/slardar_splash_attack_puddle.vpcf";

	// Modifier specials
	puddle_radius?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(keys: { splash_attack_radius: number }): void {
		if (!IsServer()) return;

		// Modifier specials
		this.puddle_radius = this.ability.GetSpecialValueFor("puddle_radius");

		// Reimagined: Splash Attack: When cast while considered in the river, the radius of Slithereen Crush increases. Additionally, throws x projectiles of water to random locations in 1200 range around the caster, each forming a y radius puddle for z seconds.
		// Check if this is a reimagined splash attack puddle
		if (this.ReimaginedSplashAttackRadius(keys.splash_attack_radius)) return;

		this.CreatePuddleParticle(this.particle_puddle);
	}

	CreatePuddleParticle(particle_name: string) {
		// Create puddle particle
		this.particle_puddle_fx = ParticleManager.CreateParticle(particle_name, ParticleAttachment.WORLDORIGIN, this.parent);
		ParticleManager.SetParticleControl(this.particle_puddle_fx, 0, GetGroundPosition(this.parent.GetAbsOrigin(), this.parent));
		ParticleManager.SetParticleControl(this.particle_puddle_fx, 1, Vector(this.puddle_radius, 1, 1));
		ParticleManager.SetParticleControl(this.particle_puddle_fx, 16, Vector(0, 0, 0));
		this.AddParticle(this.particle_puddle_fx, false, false, -1, false, false);
	}

	ReimaginedSplashAttackRadius(splash_attack_radius: number): boolean {
		if (splash_attack_radius && splash_attack_radius > 0) {
			// Change radius
			this.puddle_radius = splash_attack_radius;

			// Call particle
			this.CreatePuddleParticle(this.particle_puddle_splash_attack);
			return true;
		}

		return false;
	}

	OnDestroy() {
		if (!IsServer()) return;
		UTIL_Remove(this.parent);
	}

	IsAura() {
		return true;
	}
	GetAuraDuration() {
		return 0.5;
	}
	GetAuraEntityReject(entity: CDOTA_BaseNPC): boolean {
		// Only the caster should get the modifier
		return this.caster != entity;
	}
	GetAuraRadius() {
		return this.puddle_radius!;
	}
	GetAuraSearchFlags() {
		return UnitTargetFlags.INVULNERABLE + UnitTargetFlags.OUT_OF_WORLD + UnitTargetFlags.NOT_ILLUSIONS;
	}
	GetAuraSearchTeam() {
		return UnitTargetTeam.FRIENDLY;
	}
	GetAuraSearchType() {
		return UnitTargetType.HERO;
	}
	GetModifierAura() {
		return this.modifier_puddle_buff;
	}
}
