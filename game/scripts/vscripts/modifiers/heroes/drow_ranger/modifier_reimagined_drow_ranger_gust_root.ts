import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_gust_root extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle: string = "particles/heroes/drow_ranger/frozen_bind_ice.vpcf";

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return true;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.ROOTED]: true };
	}

	GetEffectName(): string {
		return this.particle;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}
}
