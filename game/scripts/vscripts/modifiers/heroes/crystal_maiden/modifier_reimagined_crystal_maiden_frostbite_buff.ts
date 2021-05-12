import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasScepterShard, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_frostbite_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_cast: string = "Hero_Crystal.Frostbite";
	particle_frostbite: string = "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf";
	particle_shard: string = "particles/units/heroes/hero_crystalmaiden/maiden_shard_frostbite.vpcf";
	particle_shard_fx?: ParticleID;
	modifier_debuff: string = "modifier_reimagined_crystal_maiden_frostbite_debuff";

	// Modifier specials
	tick_interval?: number;
	shard_damage_reduction_pct?: number;

	// Reimagined specials
	frost_emanation_search_radius?: number;
	frost_emanation_duration?: number;
	igloo_frosting_arcane_aura_multiplier?: number;

	// Reimagined talent specials
	cast_range_bonus?: number;
	frost_emanation_radius_bonus?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return true;
	}

	OnCreated(): void {
		// Modifier properties

		this.ability = this.GetAbility()!;

		// Modifier specials
		this.tick_interval = this.ability.GetSpecialValueFor("tick_interval");
		this.shard_damage_reduction_pct = this.ability.GetSpecialValueFor("shard_damage_reduction_pct");

		// Reimagined specials
		this.frost_emanation_search_radius = this.ability.GetSpecialValueFor("frost_emanation_search_radius");
		this.frost_emanation_duration = this.ability.GetSpecialValueFor("frost_emanation_duration");
		this.igloo_frosting_arcane_aura_multiplier = this.ability.GetSpecialValueFor("igloo_frosting_arcane_aura_multiplier");

		// Scepter shard: grants damage reduction when cast on self
		if (HasScepterShard(this.caster) && this.caster == this.parent) {
			// Add the damage reduction particle
			this.particle_shard_fx = ParticleManager.CreateParticle(this.particle_shard, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.particle_shard_fx, 0, this.parent.GetAbsOrigin());
			this.AddParticle(this.particle_shard_fx, false, false, -1, false, false);
		}

		if (IsServer()) {
			// Start thinking
			this.StartIntervalThink(this.tick_interval!);
		}
	}

	OnIntervalThink(): void {
		// Reimagined: Frost Emanation: When a Frostbitten target is touching another enemy, it will periodically afflict it with minor duration Frostbites as well.
		this.ReimaginedFrostEmanation();
	}

	ReimaginedFrostEmanation() {
		let frost_emanation_search_radius = this.frost_emanation_search_radius!;
		// Talent: Bunker of Ice: Igloo Frosting now also increases the cast range of the affected ally by x, and Frost Emanation's search radius increases by y for allies affected by Igloo Frosting.
		frost_emanation_search_radius += this.ReimaginedTalentBunkerOfIce(true);

		// Search for nearby enemies
		const enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.parent.GetAbsOrigin(),
			undefined,
			frost_emanation_search_radius,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO | UnitTargetType.BASIC,
			UnitTargetFlags.NONE,
			FindOrder.CLOSEST,
			false
		);

		for (const enemy of enemies) {
			// Only apply on the first (closest) enemy
			enemy.AddNewModifier(this.caster!, this.ability, this.modifier_debuff, { duration: this.frost_emanation_duration! });
			break;
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.TOOLTIP, ModifierFunction.CAST_RANGE_BONUS_STACKING, ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
	}

	GetModifierCastRangeBonusStacking(): number {
		return this.ReimaginedTalentBunkerOfIce(false);
	}

	OnTooltip(): number {
		return this.igloo_frosting_arcane_aura_multiplier!;
	}

	GetModifierIncomingDamage_Percentage(): number {
		// Scepter Shard: when cast on self, grants damage reduction
		if (HasScepterShard(this.caster) && this.parent == this.caster) {
			return this.shard_damage_reduction_pct!;
		}

		return 0;
	}

	GetEffectName(): string {
		return this.particle_frostbite;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.ROOTED]: true, [ModifierState.DISARMED]: true };
	}

	OnDestroy(): void {
		StopSoundOn(this.sound_cast, this.parent);
	}

	ReimaginedTalentBunkerOfIce(frost_emanation: boolean): number {
		if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_4)) {
			if (frost_emanation) {
				if (!this.frost_emanation_radius_bonus)
					this.frost_emanation_radius_bonus = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_4, "frost_emanation_radius_bonus");
				return this.frost_emanation_radius_bonus;
			} else {
				if (!this.cast_range_bonus) this.cast_range_bonus = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_4, "cast_range_bonus");
				return this.cast_range_bonus;
			}
		}

		return 0;
	}
}
