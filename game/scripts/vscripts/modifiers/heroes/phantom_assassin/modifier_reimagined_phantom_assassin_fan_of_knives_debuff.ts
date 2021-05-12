import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_fan_of_knives_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_debuff: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_shard_fan_of_knives_dot.vpcf";

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return true;
	}

	GetEffectName(): string {
		return this.particle_debuff;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.PASSIVES_DISABLED]: true };
	}
}
