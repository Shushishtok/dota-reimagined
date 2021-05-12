import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_freezing_field_aura";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_freezing_field_slow";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier";
import { CrystalMaidenTalents } from "./reimagined_crystal_maiden_talents";

@registerAbility()
export class reimagined_crystal_maiden_freezing_field extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_channel: string = "hero_Crystal.freezingField.wind";
	modifier_freezing_field_aura: string = "modifier_reimagined_crystal_maiden_freezing_field_aura";

	// Ability specials
	max_duration?: number;
	damage?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_snow.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_explosion.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/crystal_maiden/freezing_field_talent_projectile.vpcf", context);
	}

	GetBehavior(): Uint64 | AbilityBehavior {
		let behaviors = AbilityBehavior.NO_TARGET + AbilityBehavior.CHANNELLED + AbilityBehavior.DONT_RESUME_ATTACK;
		if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7)) behaviors += AbilityBehavior.AUTOCAST;
		if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_8)) behaviors -= AbilityBehavior.CHANNELLED;
		return behaviors;
	}

	GetChannelTime(): number {
		let channel_time = super.GetChannelTime();
		if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_8)) channel_time = 0;
		return channel_time;
	}

	OnSpellStart(): void {
		// Ability specials
		this.max_duration = this.GetSpecialValueFor("max_duration");
		this.damage = this.GetSpecialValueFor("damage");

		// Play cast sound
		EmitSoundOn(this.sound_channel, this.caster);

		// Apply Freezing Field aura on self
		this.caster.AddNewModifier(this.caster, this, this.modifier_freezing_field_aura, { duration: this.max_duration });
	}

	OnChannelFinish(interrupted: boolean) {
		// Stop sound
		StopSoundOn(this.sound_channel, this.caster);

		if (this.caster.HasModifier(this.modifier_freezing_field_aura)) {
			this.caster.RemoveModifierByName(this.modifier_freezing_field_aura);
		}
	}

	// For talent 7 handling only. Not needed for the base ability
	// Talent: Icy Drill Barrage: Freezing Field now can be set to auto cast. While auto cast is on, all explosions hit x units around Crystal Maiden, moving clockwise, then send a shard in that direction as a linear projectile. Shards deals explosion damage to a single unit.
	OnProjectileHit(target: CDOTA_BaseNPC, location: Vector) {
		if (!target) return;

		// Deal damage to the target
		ApplyDamage({
			attacker: this.caster,
			damage: this.damage!,
			damage_type: this.GetAbilityDamageType(),
			victim: target,
			ability: this,
			damage_flags: DamageFlag.NONE,
		});

		return true;
	}
}
