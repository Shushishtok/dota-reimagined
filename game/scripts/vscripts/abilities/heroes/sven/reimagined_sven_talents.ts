import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { registerTalent, BaseTalent, BaseTalentModifier } from "../../../lib/talents";
import { GetTalentSpecialValueFor } from "../../../lib/util";

export const enum SvenTalents {
	SvenTalent_1 = "reimagined_sven_talent_1",
	SvenTalent_2 = "reimagined_sven_talent_2",
	SvenTalent_3 = "reimagined_sven_talent_3",
	SvenTalent_4 = "reimagined_sven_talent_4",
	SvenTalent_5 = "reimagined_sven_talent_5",
	SvenTalent_6 = "reimagined_sven_talent_6",
	SvenTalent_7 = "reimagined_sven_talent_7",
	SvenTalent_8 = "reimagined_sven_talent_8",
}

@registerTalent()
export class reimagined_sven_talent_1 extends BaseTalent {}

@registerTalent()
export class reimagined_sven_talent_2 extends BaseTalent {}

@registerTalent()
export class reimagined_sven_talent_3 extends BaseTalent {}

@registerTalent()
export class reimagined_sven_talent_4 extends BaseTalent {}

@registerTalent()
export class reimagined_sven_talent_5 extends BaseTalent {}

@registerTalent()
export class reimagined_sven_talent_6 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_sven_talent_7 extends BaseTalentModifier {
	parent = this.GetParent() as CDOTA_BaseNPC_Hero;
	ability_handle?: CDOTABaseAbility;
	buff_fish_cooldown?: number;
	buff_fish_bonus_damage_pct?: number;

	OnCreated() {
		if (!IsServer()) return;

		if (this.parent.HasAbility("reimagined_sven_gods_strength")) {
			this.ability_handle = this.parent.FindAbilityByName("reimagined_sven_gods_strength");
			if (this.ability_handle) {
				this.buff_fish_cooldown = this.ability_handle.GetSpecialValueFor("buff_fish_cooldown");
				this.buff_fish_bonus_damage_pct = this.ability_handle.GetSpecialValueFor("buff_fish_bonus_damage_pct");
			}
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL];
	}

	GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number {
		if (!IsServer()) return 0;

		// Couldn't find it.. try again!
		if (!this.ability_handle) {
			this.OnCreated();
		}

		// Check if Buff Fish is initialized and ready to be applied
		if (this.ability_handle) {
			// Update values, just in case the ability was recently leveled
			this.buff_fish_cooldown = this.ability_handle.GetSpecialValueFor("buff_fish_cooldown");
			this.buff_fish_bonus_damage_pct = this.ability_handle.GetSpecialValueFor("buff_fish_bonus_damage_pct");

			if (!this.parent.HasModifier("modifier_reimagined_sven_gods_strength_buff_fish_counter")) {
				// Set buff fish cooldown modifier
				this.parent.AddNewModifier(this.parent, this.ability_handle, "modifier_reimagined_sven_gods_strength_buff_fish_counter", { duration: this.buff_fish_cooldown! });

				const parentdamage = this.parent.GetAverageTrueAttackDamage(event.target);
				const damage = parentdamage * this.buff_fish_bonus_damage_pct! * 0.01;

				SendOverheadEventMessage(undefined, OverheadAlert.DAMAGE, event.target, damage + parentdamage, undefined);
				return damage;
			}
		}

		return 0;
	}
}

@registerTalent(undefined, modifier_reimagined_sven_talent_7)
export class reimagined_sven_talent_7 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_sven_talent_8 extends BaseTalentModifier {
	parent = this.GetParent() as CDOTA_BaseNPC_Hero;
	modifier_gods_strength: string = "modifier_reimagined_sven_gods_strength";
	modifier_great_cleave: string = "modifier_reimagined_sven_great_cleave_passive";
	modifier_great_cleave_handle?: CDOTA_Buff;
	modifier_epic_cleave: string = "modifier_reimagined_sven_great_cleave_epic_cleave";
	epic_cleave_attacks?: number;
	chance_pct?: number;

	OnCreated() {
		if (!IsServer()) return;

		// Get talent specials
		this.chance_pct = GetTalentSpecialValueFor(this.parent, SvenTalents.SvenTalent_8, "chance_pct");

		// Get handle for Great Cleave's modifier
		if (this.parent.HasModifier(this.modifier_great_cleave)) {
			this.modifier_great_cleave_handle = this.parent.FindModifierByName(this.modifier_great_cleave);
			if (this.modifier_great_cleave_handle) {
				this.epic_cleave_attacks = this.modifier_great_cleave_handle.GetAbility()!.GetSpecialValueFor("epic_cleave_attacks");
			}
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ON_ATTACK];
	}

	OnAttack(event: ModifierAttackEvent): void {
		// Only apply on parent's attacks
		if (event.attacker != this.parent) return;

		// Only apply if the modifier handle was initialized. If it wasn't, let's try to initialize it again
		if (!this.modifier_great_cleave_handle) this.OnCreated();

		// If we still couldn't make it initialize, too bad
		if (!this.modifier_great_cleave_handle) return;

		// Only apply if the parent has God's Strength active
		if (!this.parent.HasModifier(this.modifier_gods_strength)) return;

		// Only apply if the parent has the counter modifier
		if (!this.parent.HasModifier(this.modifier_epic_cleave)) return;

		// Update values, just in case
		this.epic_cleave_attacks = this.modifier_great_cleave_handle.GetAbility()!.GetSpecialValueFor("epic_cleave_attacks");

		// Get modifier handle
		const modifier_counter = this.parent.FindModifierByName(this.modifier_epic_cleave);
		if (modifier_counter) {
			// Only apply if the stacks counter isn't at max stacks already
			if (modifier_counter.GetStackCount() >= this.epic_cleave_attacks! - 1) return;

			// Roll psuedo random!
			if (RollPseudoRandomPercentage(this.chance_pct!, PseudoRandom.CUSTOM_GAME_1, this.parent)) {
				// Set stacks at max
				modifier_counter.SetStackCount(this.epic_cleave_attacks! - 1);
			}
		}
	}
}

@registerTalent(undefined, modifier_reimagined_sven_talent_8)
export class reimagined_sven_talent_8 extends BaseTalent {}
