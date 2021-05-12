import { BaseModifier, registerModifier } from "../../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spiderling_poison_sting_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_ticking_poison = "Hero_Broodmother.SpawnSpiderlingsImpact";
	particle_ticking_poison: string = "particles/heroes/broodmother/broodmother_spiderling_ticking_poison.vpcf";
	particle_ticking_poison_fx?: ParticleID;

	// Modifier specials
	movement_speed?: number;
	damage_per_second?: number;

	// Reimagined specials
	ticking_poison_stacks?: number;
	ticking_poison_damage?: number;

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
		this.movement_speed = this.ability.GetSpecialValueFor("movement_speed");
		this.damage_per_second = this.ability.GetSpecialValueFor("damage_per_second");

		// Reimagined specials
		this.ticking_poison_stacks = this.ability.GetSpecialValueFor("ticking_poison_stacks");
		this.ticking_poison_damage = this.ability.GetSpecialValueFor("ticking_poison_damage");

		if (IsServer()) this.StartIntervalThink(1);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE, ModifierFunction.TOOLTIP, ModifierFunction.TOOLTIP2];
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		return this.movement_speed! * -1;
	}

	OnTooltip(): number {
		return this.damage_per_second!;
	}

	OnTooltip2(): number {
		return this.ticking_poison_stacks!;
	}

	OnIntervalThink(): void {
		// Deal damage to the target
		ApplyDamage({
			attacker: this.caster,
			damage: this.damage_per_second!,
			damage_type: DamageTypes.MAGICAL,
			victim: this.parent,
			ability: this.ability,
			damage_flags: DamageFlag.NONE,
		});
	}

	OnStackCountChanged(): void {
		// Reimagined: Ticking Poison: Poison Sting accumulates stacks each time a Spiderling attacks the target. Upon reaching x stacks, the stacks are consumed, and the target takes y magical damage.
		this.ReimaginedTickingPoison();
	}

	ReimaginedTickingPoison(): void {
		// Check if stacks are now on the threshold
		if (this.GetStackCount() >= this.ticking_poison_stacks!) {
			// Reset stacks
			this.SetStackCount(0);

			// Play burst sound
			EmitSoundOn(this.sound_ticking_poison, this.parent);

			// Create particle
			this.particle_ticking_poison_fx = ParticleManager.CreateParticle(this.particle_ticking_poison, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.particle_ticking_poison_fx, 0, this.parent.GetAbsOrigin());
			ParticleManager.ReleaseParticleIndex(this.particle_ticking_poison_fx);

			// Deal damage to the target
			ApplyDamage({
				attacker: this.caster,
				damage: this.ticking_poison_damage!,
				damage_type: DamageTypes.MAGICAL,
				victim: this.parent,
				ability: this.ability,
				damage_flags: DamageFlag.NONE,
			});
		}
	}
}
