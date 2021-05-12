import { reimagined_bristleback_viscous_nasal_goo } from "../../../abilities/heroes/bristleback/reimagined_bristleback_viscous_nasal_goo";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_nasal_goo_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: reimagined_bristleback_viscous_nasal_goo = this.GetAbility() as reimagined_bristleback_viscous_nasal_goo;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_effect: string = "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_goo_debuff.vpcf";
	particle_status_effect: string = "particles/status_fx/status_effect_goo.vpcf";
	particle_debuff_counter: string = "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_stack.vpcf";
	particle_debuff_counter_fx?: ParticleID;

	// Modifier specials
	base_armor: number = 0;
	armor_per_stack: number = 0;
	base_move_slow: number = 0;
	move_slow_per_stack: number = 0;

	// Reimagined specials
	running_nose_sneeze_interval: number = 0;
	running_nose_stacks_threshold: number = 0;
	running_nose_radius: number = 0;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return true;
	}
	ShouldUseOverheadOffset() {
		return true;
	}

	OnCreated(): void {
		// Add particle
		this.particle_debuff_counter_fx = ParticleManager.CreateParticle(this.particle_debuff_counter, ParticleAttachment.OVERHEAD_FOLLOW, this.parent);
		ParticleManager.SetParticleControl(this.particle_debuff_counter_fx, 1, Vector(0, this.GetStackCount(), 0));
		this.AddParticle(this.particle_debuff_counter_fx, false, false, -1, false, false);
	}

	FetchAbilitySpecials() {
		// Modifier specials
		this.base_armor = this.ability.GetSpecialValueFor("base_armor");
		this.armor_per_stack = this.ability.GetSpecialValueFor("armor_per_stack");
		this.base_move_slow = this.ability.GetSpecialValueFor("base_move_slow");
		this.move_slow_per_stack = this.ability.GetSpecialValueFor("move_slow_per_stack");

		// Reimagined specials
		this.running_nose_sneeze_interval = this.ability.GetSpecialValueFor("running_nose_sneeze_interval");
		this.running_nose_stacks_threshold = this.ability.GetSpecialValueFor("running_nose_stacks_threshold");
		this.running_nose_radius = this.ability.GetSpecialValueFor("running_nose_radius");
	}

	OnStackCountChanged() {
		// Update particle if initialized
		if (this.particle_debuff_counter_fx) {
			ParticleManager.SetParticleControl(this.particle_debuff_counter_fx, 1, Vector(0, this.GetStackCount(), 0));
		}

		// Reimagined: Running Nose: Units afflicted with at least x stacks of Nasal Goo periodically sneeze, sending Nasal Goo projectiles towards allies in range.
		this.ReimaginedRunningNoseIntervalStart();
	}

	ReimaginedRunningNoseIntervalStart(): void {
		if (!IsServer()) return;

		// Check if the stack count is at the threshold
		if (this.GetStackCount() >= this.running_nose_stacks_threshold) {
			this.StartIntervalThink(this.running_nose_sneeze_interval);
		}
	}

	OnIntervalThink(): void {
		if (!IsServer()) return;

		// Find the parent's allies in radius
		let enemies = FindUnitsAroundUnit(
			this.caster,
			this.parent,
			this.running_nose_radius,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.NO_INVIS
		);

		// Remove self from the table
		enemies = enemies.filter((enemy) => enemy !== this.parent);

		// If at least one enemy exists, emit sound
		if (enemies.length > 1) {
			EmitSoundOn(this.ability.sound_cast, this.parent);
		}

		// Fire a Nasal Goo particle towards them
		for (const enemy of enemies) {
			this.ability.FireNasalGoo(this.parent, enemy, false);
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PHYSICAL_ARMOR_BONUS, ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
	}

	GetModifierPhysicalArmorBonus(): number {
		return (this.base_armor + this.armor_per_stack * this.GetStackCount()) * -1;
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		return (this.base_move_slow + this.move_slow_per_stack * this.GetStackCount()) * -1;
	}

	GetEffectName(): string {
		return this.particle_effect;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}

	GetStatusEffectName(): string {
		return this.particle_status_effect;
	}
}
