import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_night_stalker_talent_4_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	fear_modifier: string = "modifier_reimagined_night_stalker_crippling_fear_fear_debuff";
	silence_modifier: string = "modifier_reimagined_night_stalker_crippling_fear_silence_debuff";
	particle_break: string = "particles/generic_gameplay/generic_break.vpcf";
	particle_break_fx?: ParticleID;

	// Modifier specials
	incoming_damage_increase?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return true;
	}
	IsPurgable() {
		return false;
	}
	ShouldUseOverheadOffset() {
		return true;
	}

	OnCreated(): void {
		// Modifier specials
		this.incoming_damage_increase = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_4, "incoming_damage_increase");
		this.StartIntervalThink(0.25);
	}

	OnIntervalThink(): void {
		// Check if the parent is no longer affected by either debuff
		if (!this.parent.HasModifier(this.fear_modifier) && !this.parent.HasModifier(this.silence_modifier)) {
			this.Destroy();
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
	}

	GetModifierIncomingDamage_Percentage(): number {
		return this.incoming_damage_increase!;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> | undefined {
		return { [ModifierState.PASSIVES_DISABLED]: true };
	}

	GetEffectName(): string {
		return this.particle_break;
	}

	GetEffectAttachType(): ParticleAttachment {
		return ParticleAttachment.OVERHEAD_FOLLOW;
	}
}
