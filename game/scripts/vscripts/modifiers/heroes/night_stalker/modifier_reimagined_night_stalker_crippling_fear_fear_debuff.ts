import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "./modifier_reimagined_night_stalker_talent_4_debuff";

@registerModifier()
export class modifier_reimagined_night_stalker_crippling_fear_fear_debuff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_effect: string = "particles/heroes/night_stalker/reimagined_nightstalker_crippling_fear_feared.vpcf";

	// Reimagined talent properties
	elapsed_time: number = 0;

	// Reimagined talent specials
	application_threshold?: number;

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
		if (IsServer()) {
			this.StartIntervalThink(0.1);
		}
	}

	OnIntervalThink(): void {
		// Talent: Dreadful Creature: Enemies that are affected by Crippling Fear for over x seconds have Break applied on them and take y% more damage until they lose the aura debuff.
		this.ReimaginedTalentDreadfulCreature();

		// Calculate the distance and direction between the parent and the caster
		const direction = util.CalculateDirectionToPosition(this.caster!.GetAbsOrigin(), this.parent.GetAbsOrigin());
		const distance = util.CalculateDistanceBetweenEntities(this.caster!, this.parent);

		// Find a position away from the caster
		const run_position: Vector = (this.caster!.GetAbsOrigin() + direction * (distance + 200)) as Vector;

		// Force parent to move to this position
		this.parent.MoveToPosition(run_position);
	}

	ReimaginedTalentDreadfulCreature() {
		if (!IsServer()) return;

		if (util.HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_4)) {
			this.elapsed_time += 0.1;

			// Initialize properties
			if (!this.application_threshold) this.application_threshold = util.GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_4, "application_threshold");

			// Check if the talent should be active
			if (this.elapsed_time >= this.application_threshold) {
				if (!this.parent.HasModifier("modifier_reimagined_night_stalker_talent_4_debuff")) {
					// Find out how long the aura is still active for
					let aura_duration;
					const modifier_aura = this.caster.FindModifierByName("modifier_reimagined_night_stalker_crippling_fear_aura");
					if (modifier_aura) {
						aura_duration = modifier_aura.GetRemainingTime();
						this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_night_stalker_talent_4_debuff", { duration: aura_duration });

						// Stop thinking
						return -1;
					}
				}
			}
		}
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.FEARED]: true, [ModifierState.COMMAND_RESTRICTED]: true };
	}

	GetEffectName() {
		return this.particle_effect;
	}

	GetEffectAttachType() {
		return ParticleAttachment.OVERHEAD_FOLLOW;
	}
}
