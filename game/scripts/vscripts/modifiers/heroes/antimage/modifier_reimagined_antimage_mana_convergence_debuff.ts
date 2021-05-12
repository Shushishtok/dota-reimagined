import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_antimage_mana_convergence_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_debuff: string = "particles/heroes/anti_mage/antimage_mana_convergence_debuff.vpcf";

	// Modifier specials
	mana_convergence_manaloss_reduction_pct?: number;

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
		// Modifier properties

		this.ability = this.GetAbility()!;

		// Modifier specials
		this.mana_convergence_manaloss_reduction_pct = this.ability?.GetSpecialValueFor("mana_convergence_manaloss_reduction_pct");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MANACOST_PERCENTAGE_STACKING];
	}

	GetModifierPercentageManacostStacking(): number {
		return -this.mana_convergence_manaloss_reduction_pct!;
	}

	GetEffectName(): string {
		return this.particle_debuff;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.ABSORIGIN_FOLLOW;
	}
}
