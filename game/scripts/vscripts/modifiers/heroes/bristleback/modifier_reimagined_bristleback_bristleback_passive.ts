import { reimagined_bristleback_quill_spray } from "../../../abilities/heroes/bristleback/reimagined_bristleback_quill_spray";
import { BristlebackTalents } from "../../../abilities/heroes/bristleback/reimagined_bristleback_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { ConvertDegreesToRadians, ConvertRadiansToEffectiveDotRange, GetAttackDotProduct, GetTalentSpecialValueFor, HasBit, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_bristleback_passive extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_back: string = "Hero_Bristleback.Bristleback";
	particle_back: string = "particles/units/heroes/hero_bristleback/bristleback_back_dmg.vpcf";
	particle_back_fx?: ParticleID;
	particle_back_large: string = "particles/units/heroes/hero_bristleback/bristleback_back_lrg_dmg.vpcf";
	particle_back_large_fx?: ParticleID;
	effective_dot_back: number = 0;
	effective_dot_side: number = 0;
	ability_quill_spray: string = "reimagined_bristleback_quill_spray";
	damage_counter: number = 0;

	// Modifier specials
	side_damage_reduction: number = 0;
	back_damage_reduction: number = 0;
	side_angle: number = 0;
	back_angle: number = 0;
	quill_release_threshold: number = 0;

	// Reimagined properties
	turtleback_damage_reduction: number = 0;
	modifier_moving_fortress: string = "modifier_reimagined_bristleback_bristleback_moving_fortress";

	// Reimagined specials
	turtleback_back_dmg_reduction: number = 0;
	turtleback_side_dmg_reduction: number = 0;
	turtleback_reset_time: number = 0;
	moving_fortress_damage_reduction_bonus: number = 0;
	prickly_sensations_trigger_pct: number = 0;

	// Reimagined talent properties
	particle_talent_6_reflect: string = "particles/heroes/bristleback/bristleback_barbed_exterior_reflect.vpcf";
	particle_talent_6_reflect_fx?: ParticleID;

	// Reimagined talent specials
	talent_5_damage_taken_to_threshold_pct: number = 0;
	talent_6_damage_reflection_pct: number = 0;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	IsPermanent() {
		return true;
	}
	RemoveOnDeath() {
		return true;
	}

	OnCreated(): void {
		this.GetAbilitySpecialValues();
		this.CalculateEffectiveDots();
	}

	OnRefresh(): void {
		this.GetAbilitySpecialValues();
	}

	GetAbilitySpecialValues(): void {
		this.FetchAbilitySpecials();
	}

	FetchAbilitySpecials() {
		// Modifier specials
		this.side_damage_reduction = this.ability.GetSpecialValueFor("side_damage_reduction");
		this.back_damage_reduction = this.ability.GetSpecialValueFor("back_damage_reduction");
		this.side_angle = this.ability.GetSpecialValueFor("side_angle");
		this.back_angle = this.ability.GetSpecialValueFor("back_angle");
		this.quill_release_threshold = this.ability.GetSpecialValueFor("quill_release_threshold");

		// Reimagined specials
		this.turtleback_back_dmg_reduction = this.ability.GetSpecialValueFor("turtleback_back_dmg_reduction");
		this.turtleback_side_dmg_reduction = this.ability.GetSpecialValueFor("turtleback_side_dmg_reduction");
		this.turtleback_reset_time = this.ability.GetSpecialValueFor("turtleback_reset_time");
		this.moving_fortress_damage_reduction_bonus = this.ability.GetSpecialValueFor("moving_fortress_damage_reduction_bonus");
		this.prickly_sensations_trigger_pct = this.ability.GetSpecialValueFor("prickly_sensations_trigger_pct");
	}

	CalculateEffectiveDots() {
		if (!IsServer()) return;

		// Calculate the back's effective dot range
		const back_radians = ConvertDegreesToRadians(this.back_angle);
		this.effective_dot_back = ConvertRadiansToEffectiveDotRange(back_radians);

		const side_radians = ConvertDegreesToRadians(this.side_angle);
		this.effective_dot_side = ConvertRadiansToEffectiveDotRange(side_radians);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
			ModifierFunction.ON_TAKEDAMAGE,
			// Talent: Barbed Exterior: Melee attackers that hit Bristleback on the back take x% of their own damage before reductions. Flagged as a reflection damage.
			ModifierFunction.ON_ATTACK_LANDED,
		];
	}

	GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
		// Does nothing if the parent is disabled
		if (this.parent.PassivesDisabled()) return 0;

		// Does nothing if the damage is HP_LOSS or a reflection
		if (HasBit(event.damage_flags, DamageFlag.HPLOSS) || HasBit(event.damage_flags, DamageFlag.REFLECTION)) return 0;

		let damage_reduction = 0;

		const dot_product = GetAttackDotProduct(event.attacker, event.target);

		// Check if the damage was dealt from the back
		if (this.effective_dot_back && dot_product >= this.effective_dot_back) {
			// Play hit from back sound
			this.parent.EmitSound(this.sound_back);

			// Play back-hit particle
			this.particle_back_fx = ParticleManager.CreateParticle(this.particle_back, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.particle_back_fx, 0, this.parent.GetAbsOrigin());
			ParticleManager.SetParticleControlEnt(this.particle_back_fx, 1, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
			ParticleManager.ReleaseParticleIndex(this.particle_back_fx);

			// If damage was over 200, also play the secondary particle. This is actually an arbitrary value since I have no idea what is the "large" particle for
			if (event.damage >= 200) {
				this.particle_back_large_fx = ParticleManager.CreateParticle(this.particle_back_large, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
				ParticleManager.SetParticleControl(this.particle_back_large_fx, 0, this.parent.GetAbsOrigin());
				ParticleManager.SetParticleControlEnt(
					this.particle_back_large_fx,
					1,
					this.parent,
					ParticleAttachment.POINT_FOLLOW,
					AttachLocation.HITLOC,
					this.parent.GetAbsOrigin(),
					true
				);
				ParticleManager.ReleaseParticleIndex(this.particle_back_large_fx);
			}

			damage_reduction = this.back_damage_reduction;

			// Reimagined: Turtleback: When attacked from behind, increases damage reduction by 3% per damage instance. This bonus resets when being attacked from the front. The sides get 1% damage reduction per stack instead. Also resets after not taking damage for 5 seconds.
			damage_reduction += this.ReimaginedTurtleback(true);

			return damage_reduction * -1;
		}
		// Check if the damage was from the sides instead
		else if (this.effective_dot_side && dot_product >= this.effective_dot_side) {
			damage_reduction = this.side_damage_reduction;

			// Reimagined: Moving Fortress: Can be toggled on to apply the damage reduction from behind to the sides and grant an additional x% damage reduction. However, Bristleback is slowed by y% move speed and z attack speed while this effect is active.
			damage_reduction = this.ReimaginedMovingFortress(damage_reduction);

			// Reimagined: Turtleback: When attacked from behind, increases damage reduction by 3% per damage instance. This bonus resets when being attacked from the front. The sides get 1% damage reduction per stack instead. Also resets after not taking damage for 5 seconds.
			damage_reduction += this.ReimaginedTurtleback(false);

			return damage_reduction * -1;
		}

		// Reimagined: Turtleback: When attacked from behind, increases damage reduction by 3% per damage instance. This bonus resets when being attacked from the front. The sides get 1% damage reduction per stack instead. Also resets after not taking damage for 5 seconds.
		// If we got here, then the damage instance is from the front, which should cause the reset
		this.ReimaginedTurtlebackReset();

		return 0;
	}

	ReimaginedMovingFortress(damage_reduction: number): number {
		// Check if the parent has the Moving Fortress modifier
		if (this.parent.HasModifier(this.modifier_moving_fortress)) {
			// If so, assign the back damage reduction to the variable
			damage_reduction = this.back_damage_reduction;

			// Grant an additional bonus
			damage_reduction += this.moving_fortress_damage_reduction_bonus;
		}

		return damage_reduction;
	}

	ReimaginedTurtleback(back: boolean): number {
		// Use appropriate bonus
		if (back) this.turtleback_damage_reduction += this.turtleback_back_dmg_reduction;
		else this.turtleback_damage_reduction += this.turtleback_side_dmg_reduction;

		// Start/Restart the damage reset timer
		this.StartIntervalThink(this.turtleback_reset_time);

		// Return bonus damage resistance
		return this.turtleback_damage_reduction;
	}

	OnIntervalThink(): void {
		// Reimagined: Turtleback: When attacked from behind, increases damage reduction by 3% per damage instance. This bonus resets when being attacked from the front. The sides get 1% damage reduction per stack instead. Also resets after not taking damage for 5 seconds.
		this.ReimaginedTurtlebackReset();
	}

	ReimaginedTurtlebackReset(): void {
		// Reset damage
		this.turtleback_damage_reduction = 0;

		// Stop timer
		this.StartIntervalThink(-1);
	}

	OnTakeDamage(event: ModifierInstanceEvent): void {
		if (!IsServer()) return;

		// Only apply if the target is the parent
		if (event.unit != this.parent) return;

		// Does nothing if the parent is disabled
		if (this.parent.PassivesDisabled()) return;

		// Does nothing if the parent is an illusion
		if (this.parent.IsIllusion()) return;

		// Does nothing if the damage is HP_LOSS or a reflection
		if (HasBit(event.damage_flags, DamageFlag.HPLOSS) || HasBit(event.damage_flags, DamageFlag.REFLECTION)) return;

		// Does nothing if the damage is not valid
		if (event.damage <= 0) return;

		// Only apply if the damage was taken from the back
		const dot_product = GetAttackDotProduct(event.attacker, event.unit);
		if (dot_product >= this.effective_dot_back) {
			this.IncreaseQuillTriggerCounter(event.damage);
		} else {
			// Talent: Bristlefront: While Moving Fortress is active, x% of damage taken from the front and the sides also counts toward the passive Quill Spray damage trigger
			this.ReimaginedBristlefront(event);
		}
	}

	OnAttackLanded(event: ModifierAttackEvent): void {
		if (!IsServer()) return;

		// Talent: Barbed Exterior: Melee attackers that hit Bristleback on the back take x% of their own damage before reductions. Flagged as a reflection damage.
		this.ReimaginedTalentBarbedExterior(event);
	}

	IncreaseQuillTriggerCounter(increase_by: number) {
		// Does nothing if the caster doesn't have Quill Spray or it is not trained
		if (!this.parent.HasAbility(this.ability_quill_spray)) return;
		const ability_quill_spray_handle = this.parent.FindAbilityByName(this.ability_quill_spray) as reimagined_bristleback_quill_spray;
		if (!ability_quill_spray_handle || !ability_quill_spray_handle.IsTrained()) return;

		this.damage_counter += increase_by;

		// If the damage counter reached the threshold, fire a Quill Spray and reset
		if (this.damage_counter >= this.quill_release_threshold!) {
			this.damage_counter = 0;
			ability_quill_spray_handle.FireQuillSpray(this.caster);
		}
	}

	// Called from Quill Spray
	ReimaginedPricklySensations(actual_damage: number): void {
		// Increase the damage counter based on actual damage done with Quill Sprays
		const trigger_damage_increase = actual_damage * this.prickly_sensations_trigger_pct! * 0.01;
		this.IncreaseQuillTriggerCounter(trigger_damage_increase);
	}

	ReimaginedBristlefront(event: ModifierInstanceEvent): void {
		if (HasTalent(this.caster, BristlebackTalents.BristlebackTalent_5)) {
			// Initialize variables
			if (!this.talent_5_damage_taken_to_threshold_pct)
				this.talent_5_damage_taken_to_threshold_pct = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_5, "damage_taken_to_threshold_pct");

			// Only applies while Moving Fortress is active
			if (this.caster.HasModifier(this.modifier_moving_fortress)) {
				// Calculate damage
				const damage_increase = event.damage * this.talent_5_damage_taken_to_threshold_pct * 0.01;
				this.IncreaseQuillTriggerCounter(damage_increase);
			}
		}
	}

	ReimaginedTalentBarbedExterior(event: ModifierAttackEvent): void {
		if (HasTalent(this.parent, BristlebackTalents.BristlebackTalent_6)) {
			// Initialize variables
			if (!this.talent_6_damage_reflection_pct)
				this.talent_6_damage_reflection_pct = GetTalentSpecialValueFor(this.parent, BristlebackTalents.BristlebackTalent_6, "damage_reflection_pct");

			// Only apply when the target is the parent
			if (event.target != this.parent) return;

			// Only apply when passives aren't disabled
			if (this.parent.PassivesDisabled()) return;

			// Only apply if the attacker isn't a ward or a building
			if (event.attacker.IsBuilding() || event.attacker.IsOther()) return;

			// Ignores allies
			if (event.attacker.GetTeamNumber() == this.parent.GetTeamNumber()) return;

			// Ignore HP Loss and reflection damages
			if (HasBit(event.damage_flags, DamageFlag.HPLOSS) || HasBit(event.damage_flags, DamageFlag.REFLECTION)) return;

			// Check if the attack was on the Bristleback's back
			const effectiveDot = GetAttackDotProduct(event.attacker, event.target);
			if (effectiveDot >= this.effective_dot_back) {
				// Get damage to reflect
				const reflect_damage = event.original_damage * this.talent_6_damage_reflection_pct * 0.01;
				ApplyDamage({
					attacker: this.caster,
					damage: reflect_damage,
					damage_type: DamageTypes.PHYSICAL,
					victim: event.attacker,
					ability: this.ability,
					damage_flags: DamageFlag.REFLECTION,
				});

				// Play particle
				this.particle_talent_6_reflect_fx = ParticleManager.CreateParticle(this.particle_talent_6_reflect, ParticleAttachment.ABSORIGIN, this.parent);
				ParticleManager.SetParticleControlEnt(
					this.particle_talent_6_reflect_fx,
					0,
					this.parent,
					ParticleAttachment.POINT_FOLLOW,
					AttachLocation.HITLOC,
					this.parent.GetAbsOrigin(),
					true
				);
				ParticleManager.SetParticleControlEnt(
					this.particle_talent_6_reflect_fx,
					1,
					event.attacker,
					ParticleAttachment.POINT_FOLLOW,
					AttachLocation.HITLOC,
					event.attacker.GetAbsOrigin(),
					true
				);
				ParticleManager.ReleaseParticleIndex(this.particle_talent_6_reflect_fx);
			}
		}
	}
}
