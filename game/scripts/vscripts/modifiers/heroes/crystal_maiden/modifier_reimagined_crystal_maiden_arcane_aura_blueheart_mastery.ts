import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	stack_set: number[] = [];

	// Modifier specials
	blueheart_mastery_duration?: number;
	blueheart_mastery_mana_regen?: number;

	// Reimagined talent specials
	talent_movespeed_bonus_pct?: number;

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
		this.blueheart_mastery_duration = this.ability.GetSpecialValueFor("blueheart_mastery_duration");
		this.blueheart_mastery_mana_regen = this.ability.GetSpecialValueFor("blueheart_mastery_mana_regen");
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
		Timers.CreateTimer(this.blueheart_mastery_duration!, () => {
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

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.TOOLTIP, ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
	}

	OnTooltip(): number {
		return this.blueheart_mastery_mana_regen! * this.GetStackCount();
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		// Talent: Frost Drift: Blueheart Mastery now also improves Crystal Maiden's move speed by x% per stack.
		return this.ReimaginedTalentFrostDrift();
	}

	ReimaginedTalentFrostDrift(): number {
		if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_5)) {
			if (!this.talent_movespeed_bonus_pct) this.talent_movespeed_bonus_pct = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_5, "talent_movespeed_bonus_pct");
			return this.talent_movespeed_bonus_pct * this.GetStackCount();
		}

		return 0;
	}
}
