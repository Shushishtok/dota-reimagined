import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_avenger_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_avenger: string = "particles/heroes/broodmother/broodmother_spawn_spiderling_avenger.vpcf";

	// Modifier specials
	avenger_duration?: number;
	avenger_damage_pct?: number;

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
		this.avenger_duration = this.ability.GetSpecialValueFor("avenger_duration");
		this.avenger_damage_pct = this.ability.GetSpecialValueFor("avenger_damage_pct");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE];
	}

	GetModifierBaseDamageOutgoing_Percentage(): number {
		return this.avenger_damage_pct! * this.GetStackCount();
	}

	OnStackCountChanged(prev_stacks: number) {
		if (!IsServer()) return;

		// Only apply if there are new stacks added
		if (this.GetStackCount() < prev_stacks) return;

		// Get amount of new stacks added
		const new_stacks = this.GetStackCount() - prev_stacks;

		// Add a new timer for those stack(s)
		Timers.CreateTimer(this.avenger_duration!, () => {
			// Verify the caster, the parent, and the modifier still exist as valid entities
			if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any)) {
				// Decrement stacks, or destroy modifier is there are no more stacks
				if (this.GetStackCount() == new_stacks) {
					this.Destroy();
				} else {
					this.SetStackCount(this.GetStackCount() - new_stacks);
				}
			}
		});
	}

	GetEffectName(): string {
		return this.particle_avenger;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}
}
