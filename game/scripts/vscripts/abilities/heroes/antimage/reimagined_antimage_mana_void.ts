import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { AntiMageTalents } from "./reimagined_antimage_talents";

@registerAbility()
export class reimagined_antimage_mana_void extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_start: string = "Hero_Antimage.ManaVoidCast";
	sound_cast: string = "Hero_Antimage.ManaVoid";
	particle_void: string = "particles/units/heroes/hero_antimage/antimage_manavoid.vpcf";
	particle_void_fx?: ParticleID;

	// Ability specials
	mana_void_damage_per_mana?: number;
	mana_void_ministun?: number;
	mana_void_aoe_radius?: number;

	// Reimagined specials
	void_feedback_mana_threshold_pct?: number;
	void_feedback_damage_multiplier?: number;
	purity_of_will_stun_per_instance?: number;
	purity_of_will_missing_mana_for_instance?: number;
	purity_of_will_max_stun_increased?: number;

	// Reimagined talent specials
	mana_threshold?: number;
	multiplier?: number;
	max_mana_pct?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_antimage/antimage_manavoid.vpcf", context);
	}

	OnAbilityPhaseStart(): boolean {
		EmitSoundOn(this.sound_start, this.caster);
		return true;
	}

	OnAbilityPhaseInterrupted(): void {
		StopSoundOn(this.sound_start, this.caster);
	}

	GetAOERadius(): number {
		return this.GetSpecialValueFor("mana_void_aoe_radius");
	}

	OnSpellStart(): void {
		// Ability properties
		const target = this.GetCursorTarget()!;

		// Ability specials
		this.mana_void_damage_per_mana = this.GetSpecialValueFor("mana_void_damage_per_mana");
		this.mana_void_ministun = this.GetSpecialValueFor("mana_void_ministun");
		this.mana_void_aoe_radius = this.GetSpecialValueFor("mana_void_aoe_radius");

		// Reimagined specials
		this.void_feedback_mana_threshold_pct = this.GetSpecialValueFor("void_feedback_mana_threshold_pct");
		this.void_feedback_damage_multiplier = this.GetSpecialValueFor("void_feedback_damage_multiplier");
		this.purity_of_will_stun_per_instance = this.GetSpecialValueFor("purity_of_will_stun_per_instance");
		this.purity_of_will_missing_mana_for_instance = this.GetSpecialValueFor("purity_of_will_missing_mana_for_instance");
		this.purity_of_will_max_stun_increased = this.GetSpecialValueFor("purity_of_will_max_stun_increased");

		// If target can absorb the ability, trigger the absorb and exit
		if (this.caster.GetTeamNumber() != target!.GetTeamNumber()) {
			if (target!.TriggerSpellAbsorb(this)) {
				return;
			}
		}

		// Play cast sound
		EmitSoundOn(this.sound_cast, target!);

		// Play particle effect
		this.particle_void_fx = ParticleManager.CreateParticle(this.particle_void, ParticleAttachment.POINT, target!);
		ParticleManager.SetParticleControlEnt(this.particle_void_fx, 0, target!, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", target!.GetAbsOrigin(), true);
		ParticleManager.SetParticleControl(this.particle_void_fx, 1, Vector(this.mana_void_aoe_radius!, 0, 0));
		ParticleManager.ReleaseParticleIndex(this.particle_void_fx);

		// Reimagined: Purity of Will: Can be set to auto cast. Doing so causes the spell to only apply on the main target, but also increase the stun it receives based on lack of mana.
		if (this.GetAutoCastState()) {
			// Triggering Purity of Will stops the rest of the code
			this.ReimaginedPurityOfWill(target!, this.mana_void_ministun);
			return;
		}

		// Apply stun on target
		this.ApplyStunAndDebuff(target!, this.mana_void_ministun);

		// Find all enemies in the AoE
		const enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			target!.GetAbsOrigin(),
			undefined,
			this.mana_void_aoe_radius!,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.NONE,
			FindOrder.ANY,
			false
		);

		let mana_calculation_target = target!;

		// Reimagined: Calculated Combustion: Calculates the damage based on the enemy unit missing the most mana in the radius.
		mana_calculation_target = this.ReimaginedCalculatedCombustion(enemies);

		// Calculate damage
		let damage = this.CalculateDamage(mana_calculation_target);

		// Talent: Violent Circuits: Mana Void adds x% of the main target's max mana to the damage calculation.
		damage += this.ReimaginedTalentViolentCircuits(target);

		// Deal damage to all targets in the AoE
		for (const enemy of enemies) {
			this.DealDamageToEnemy(enemy, damage);
		}
	}

	ReimaginedCalculatedCombustion(enemies: CDOTA_BaseNPC[]): CDOTA_BaseNPC {
		let enemy_missing_the_most_mana: CDOTA_BaseNPC | undefined = undefined;
		let most_missing_mana: number = 0;
		for (const enemy of enemies) {
			const missing_mana = enemy.GetMaxMana() - enemy.GetMana();
			if (enemy_missing_the_most_mana == undefined) {
				most_missing_mana = missing_mana;
				enemy_missing_the_most_mana = enemy;
			} else {
				if (missing_mana > most_missing_mana) {
					most_missing_mana = missing_mana;
					enemy_missing_the_most_mana = enemy;
				}
			}
		}

		return enemy_missing_the_most_mana!;
	}

	ReimaginedVoidFeedback(target: CDOTA_BaseNPC, damage: number): number {
		let actual_damage = damage;

		// Check for mana percentage threshold
		if (target.GetManaPercent() <= this.void_feedback_mana_threshold_pct!) {
			// Multiply damage
			actual_damage = actual_damage * this.void_feedback_damage_multiplier!;

			// Talent: Void of Emptyness: Void Feedback now deals x times the damage when the target has less than x% of its max mana. Overrides Void Feedback's damage.
			actual_damage = math.max(this.ReimaginedTalentVoidOfEmptiness(target, damage), actual_damage);
		}

		return actual_damage;
	}

	DealDamageToEnemy(enemy: CDOTA_BaseNPC, damage: number): void {
		// Deal damage to the enemy
		ApplyDamage({
			attacker: this.caster,
			damage: damage,
			damage_type: this.GetAbilityDamageType(),
			victim: enemy,
			ability: this,
			damage_flags: DamageFlag.NONE,
		});
	}

	CalculateDamage(target: CDOTA_BaseNPC): number {
		// Calculate damage based on missing mana
		let damage: number = (target.GetMaxMana() - target.GetMana()) * this.mana_void_damage_per_mana!;

		// Reimagined: Void Feedback: If the main target has less than the threshold of its max mana, the damage per mana point increases by a multiplier.
		damage = this.ReimaginedVoidFeedback(target!, damage);

		return damage;
	}

	ApplyStunAndDebuff(target: CDOTA_BaseNPC, stun_duration: number) {
		// Apply a stun on the main target
		target.AddNewModifier(this.caster, this, BuiltInModifier.STUN, { duration: stun_duration });
	}

	ReimaginedPurityOfWill(target: CDOTA_BaseNPC, stun_duration: number) {
		// Calculate stun duration increase for missing mana, up to a limit.
		let additional_stun = ((target.GetMaxMana() - target.GetMana()) / this.purity_of_will_missing_mana_for_instance!) * this.purity_of_will_stun_per_instance!;
		if (additional_stun > this.purity_of_will_max_stun_increased!) {
			additional_stun = this.purity_of_will_max_stun_increased!;
		}

		// Increase stun duration
		stun_duration = stun_duration + additional_stun;

		this.ApplyStunAndDebuff(target, stun_duration);

		const damage = this.CalculateDamage(target);
		this.DealDamageToEnemy(target, damage);
	}

	ReimaginedTalentVoidOfEmptiness(target: CDOTA_BaseNPC, damage: number): number {
		if (HasTalent(this.caster, AntiMageTalents.AntiMageTalents_7)) {
			if (!this.mana_threshold) this.mana_threshold = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_7, "mana_threshold");
			if (!this.multiplier) this.multiplier = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_7, "multiplier");

			if (target.GetManaPercent() <= this.mana_threshold) {
				damage = damage * this.multiplier;
			}
		}

		return damage;
	}

	ReimaginedTalentViolentCircuits(target: CDOTA_BaseNPC): number {
		let bonus_damage = 0;

		if (HasTalent(this.caster, AntiMageTalents.AntiMageTalents_8)) {
			if (target.GetMaxMana() > 0) {
				if (!this.max_mana_pct) this.max_mana_pct = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_8, "max_mana_pct");
				bonus_damage = target.GetMaxMana() * this.max_mana_pct * 0.01;
			}
		}

		return bonus_damage;
	}
}
