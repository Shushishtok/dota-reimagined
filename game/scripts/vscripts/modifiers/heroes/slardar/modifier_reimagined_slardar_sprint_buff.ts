import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { ConvertDegreesToRadians, ConvertRadiansToEffectiveDotRange, GetAttackDotProduct, HasBit, IsTeleporting } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_sprint_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_buff: string = "particles/units/heroes/hero_slardar/slardar_sprint.vpcf";

	// Modifier specials
	bonus_speed?: number;

	// Reimagined properties
	headstrong_effective_dot?: number;
	particle_headstrong: string = "particles/heroes/slardar/slardar_headstrong.vpcf";
	modifier_finish_strong: string = "modifier_reimagined_slardar_sprint_finish_strong";

	// Reimagined specials
	headstrong_damage_reduction?: number;
	headstrong_angle_front?: number;
	finish_strong_duration?: number;

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
		// Modifier specials
		this.bonus_speed = this.ability.GetSpecialValueFor("bonus_speed");

		// Reimagined specials
		this.headstrong_damage_reduction = this.ability.GetSpecialValueFor("headstrong_damage_reduction");
		this.headstrong_angle_front = this.ability.GetSpecialValueFor("headstrong_angle_front");
		this.finish_strong_duration = this.ability.GetSpecialValueFor("finish_strong_duration");

		// Reimagined: Headstrong: Grants x% damage reduction from the front while active.
		this.ReimaginedHeadstrongSet();
	}

	ReimaginedHeadstrongSet(): void {
		if (!IsServer()) return;

		// Calculate the front's effective dot range
		const radians = ConvertDegreesToRadians(this.headstrong_angle_front!);
		this.headstrong_effective_dot = ConvertRadiansToEffectiveDotRange(radians);
	}

	GetEffectName(): string {
		return this.particle_buff;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
			ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,

			// Reimagined: Headstrong: Grants x% damage reduction from the front while active.
			ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
		];
	}

	GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
		// Reimagined: Headstrong: Grants x% damage reduction from the front while active.
		return this.ReimaginedHeadstrong(event);
	}

	ReimaginedHeadstrong(event: ModifierAttackEvent) {
		// Does nothing if the damage is HP_LOSS or a reflection
		if (HasBit(event.damage_flags, DamageFlag.HPLOSS) || HasBit(event.damage_flags, DamageFlag.REFLECTION)) return 0;

		const dot_product = GetAttackDotProduct(event.attacker, event.target);

		if (this.headstrong_effective_dot && dot_product <= this.headstrong_effective_dot) {
			const pfx = ParticleManager.CreateParticle(this.particle_headstrong, ParticleAttachment.POINT_FOLLOW, this.parent);
			ParticleManager.SetParticleControlEnt(pfx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
			ParticleManager.ReleaseParticleIndex(pfx);

			return this.headstrong_damage_reduction! * -1;
		}

		return 0;
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		return this.bonus_speed!;
	}

	GetActivityTranslationModifiers(): string {
		return "haste";
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.NO_UNIT_COLLISION]: true };
	}

	OnDestroy(): void {
		// Reimagined: Finish Strong: When Guardian Sprint ends, Slardar moves x units forward over y seconds, dragging enemies in front of him, dealing 90/120/150/180 physical damage to all units in 150 radius of the end position and stunning them for 1.5 seconds.
		this.ReimaginedFinishStrong();
	}

	ReimaginedFinishStrong(): void {
		if (!IsServer()) return;

		// If parent is dead, do nothing.
		if (!this.parent.IsAlive()) return;

		// If parent is disabled or currently in motion, do nothing
		if (
			this.parent.IsStunned() ||
			this.parent.IsOutOfGame() ||
			this.parent.IsRooted() ||
			this.parent.IsHexed() ||
			this.parent.IsCurrentlyHorizontalMotionControlled() ||
			this.parent.IsCurrentlyVerticalMotionControlled()
		)
			return;

		// If parent is teleporting, do nothing
		if (IsTeleporting(this.parent)) return;

		// Give the parent the Finish Strong modifier
		this.parent.AddNewModifier(this.caster, this.ability, this.modifier_finish_strong, { duration: this.finish_strong_duration });
	}
}
