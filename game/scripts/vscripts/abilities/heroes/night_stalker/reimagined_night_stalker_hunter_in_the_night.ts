import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { HasScepterShard, IsRoshan } from "../../../lib/util";
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights";
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_passive";

@registerAbility()
export class reimagined_night_stalker_hunter_in_the_night extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	modifier_passive: string = "modifier_reimagined_night_stalker_hunter_in_the_night_passive";
	particle_shard: string = "particles/units/heroes/hero_night_stalker/nightstalker_shard_hunter.vpcf";
	particle_shard_fx?: ParticleID;

	// Ability specials
	shard_max_hp_restore_pct?: number;
	shard_max_mana_restore_pct?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_change.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_night_buff.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_shard_hunter.vpcf", context);
		PrecacheModel("models/heroes/nightstalker/nightstalker.vmdl", context);
		PrecacheModel("models/heroes/nightstalker/nightstalker_night.vmdl", context);
	}

	GetIntrinsicModifierName(): string {
		return this.modifier_passive;
	}

	GetCooldown(level: number): number {
		let cooldown = super.GetCooldown(level);

		// Scepter effect: can be cast at night to consume a lesser creature and heal
		if (HasScepterShard(this.caster)) {
			cooldown = this.GetSpecialValueFor("shard_cooldown");
		}

		return cooldown;
	}

	GetBehavior(): DOTA_ABILITY_BEHAVIOR | Uint64 {
		let behavior = AbilityBehavior.PASSIVE;

		// Scepter effect: can be cast at night to consume a lesser creature.
		if (HasScepterShard(this.caster) && this.caster.GetModifierStackCount(this.modifier_passive, this.caster) == 1) {
			behavior = AbilityBehavior.UNIT_TARGET;
		}

		return behavior;
	}

	CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult | undefined {
		if (!IsServer()) return;

		// Can only be cast on non-Roshan units
		if (IsRoshan(target)) return UnitFilterResult.FAIL_CUSTOM;

		if (target.IsHero()) return UnitFilterResult.FAIL_HERO;

		// Cannot be cast on player controlled units
		if (target.IsOwnedByAnyPlayer()) return UnitFilterResult.FAIL_CUSTOM;

		return UnitFilter(target, UnitTargetTeam.BOTH, UnitTargetType.BASIC, UnitTargetFlags.NOT_CREEP_HERO, this.caster.GetTeamNumber());
	}

	GetCustomCastErrorTarget(target: CDOTA_BaseNPC): string | undefined {
		if (!IsServer()) return;

		// Can only be cast on non-Roshan units
		if (IsRoshan(target)) return CustomCastErrorStrings.CANNOT_CAST_ON_ROSHAN;

		// Cannot be cast on player controlled units
		if (target.IsOwnedByAnyPlayer()) return CustomCastErrorStrings.CANNOT_CAST_ON_PLAYER_CONTROLLED;
	}

	OnUpgrade(): void {
		this.shard_max_hp_restore_pct = this.GetSpecialValueFor("shard_max_hp_restore_pct");
		this.shard_max_mana_restore_pct = this.GetSpecialValueFor("shard_max_mana_restore_pct");
	}

	OnSpellStart(): void {
		// Get target
		const target = this.GetCursorTarget();

		// Shouldn't ever happen, but just in case
		if (!target) return;

		// Create yum yum particle
		this.particle_shard_fx = ParticleManager.CreateParticle(this.particle_shard, ParticleAttachment.ABSORIGIN_FOLLOW, target);
		ParticleManager.SetParticleControl(this.particle_shard_fx, 0, target.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_shard_fx, 1, this.caster.GetAbsOrigin());
		ParticleManager.ReleaseParticleIndex(this.particle_shard_fx);

		// Kill the target
		target.Kill(this, this.caster);

		// Restore health and mana based on your max health/mana percetages
		const max_health = this.caster.GetMaxHealth();
		const max_mana = this.caster.GetMaxMana();

		const heal_amount = max_health * this.shard_max_hp_restore_pct! * 0.01;
		const mana_restore_amount = max_mana * this.shard_max_mana_restore_pct! * 0.01;

		this.caster.Heal(heal_amount, this);
		this.caster.GiveMana(mana_restore_amount);
	}
}
