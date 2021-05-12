import { SkywrathMageTalents } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_skywrath_mage_talent_1_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	int_bonus?: number;
	duration?: number;

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
		this.int_bonus = GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_1, "int_bonus");
		this.duration = GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_1, "duration");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.STATS_INTELLECT_BONUS];
	}

	GetModifierBonusStats_Intellect(): number {
		return this.int_bonus! * this.GetStackCount();
	}

	OnStackCountChanged(previous_stacks: number): void {
		if (!IsServer()) return;

		// We only care about incrementals
		if (previous_stacks > this.GetStackCount()) return;

		// Get the amount of new stacks that we just got
		const new_stacks = this.GetStackCount() - previous_stacks;

		// Refresh the duration of the modifier
		this.ForceRefresh();

		// Add a new timer for those stack(s)
		Timers.CreateTimer(this.duration!, () => {
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
}
