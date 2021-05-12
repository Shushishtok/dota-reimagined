import { BaseModifier, registerModifier } from "../../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_venom_stinger_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_explosion: string = "hero_viper.PoisonAttack.Target.ti7";
	particle_explosion: string = "particles/heroes/broodmother/broodmother_spiderling_ticking_poison.vpcf";
	particle_explosion_fx?: ParticleID;
	status_effect: string = "particles/status_fx/status_effect_poison_viper.vpcf";

	// Modifier specials
	explosion_interval?: number;
	movement_speed_slow?: number;
	explosion_damage?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return true;
	}

	OnCreated(): void {
		// Modifier specials
		this.explosion_interval = this.ability.GetSpecialValueFor("explosion_interval");
		this.movement_speed_slow = this.ability.GetSpecialValueFor("movement_speed_slow");
		this.explosion_damage = this.ability.GetSpecialValueFor("explosion_damage");

		if (!IsServer()) return;
		this.StartIntervalThink(this.explosion_interval);
	}

	OnIntervalThink(): void {
		// Play sound
		this.parent.EmitSoundParams(this.sound_explosion, 0, 0.45, 0);

		// Create particle effect
		this.particle_explosion_fx = ParticleManager.CreateParticle(this.particle_explosion, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
		ParticleManager.SetParticleControl(this.particle_explosion_fx, 0, this.parent.GetAbsOrigin());
		ParticleManager.ReleaseParticleIndex(this.particle_explosion_fx);

		// Deal damage to the target
		ApplyDamage({
			attacker: this.caster,
			damage: this.explosion_damage!,
			damage_type: DamageTypes.MAGICAL,
			victim: this.parent,
			ability: this.ability,
			damage_flags: DamageFlag.NONE,
		});

		// Show overhead message
		SendOverheadEventMessage(undefined, OverheadAlert.BONUS_POISON_DAMAGE, this.parent, this.explosion_damage!, undefined);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE, ModifierFunction.TOOLTIP];
	}

	OnTooltip(): number {
		return this.explosion_interval!;
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		return this.movement_speed_slow! * -1;
	}

	GetStatusEffectName(): string {
		return this.status_effect;
	}
}
