import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { AddActiveItemModifierArray, IsActiveModifierItem, RemoveActiveModifierItem } from "../../../lib/util";

@registerModifier()
export class modifier_item_reimagined_skull_basher extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability = this.GetAbility() as CDOTA_Item;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_impact: string = "DOTA_Item.SkullBasher";

	// Modifier specials
	bonus_damage?: number;
	bonus_strength?: number;
	bash_chance_melee?: number;
	bash_chance_ranged?: number;
	bash_duration?: number;
	bonus_chance_damage?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	GetAttributes() {
		return ModifierAttribute.MULTIPLE;
	}

	OnCreated(): void {
		// Modifier specials
		this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");
		this.bonus_strength = this.ability.GetSpecialValueFor("bonus_strength");
		this.bash_chance_melee = this.ability.GetSpecialValueFor("bash_chance_melee");
		this.bash_chance_ranged = this.ability.GetSpecialValueFor("bash_chance_ranged");
		this.bash_duration = this.ability.GetSpecialValueFor("bash_duration");
		this.bonus_chance_damage = this.ability.GetSpecialValueFor("bonus_chance_damage");

		// Activate item modifier
		AddActiveItemModifierArray(this.ability);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PREATTACK_BONUS_DAMAGE, ModifierFunction.STATS_STRENGTH_BONUS, ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL];
	}

	GetModifierPreAttack_BonusDamage(): number {
		return this.bonus_damage!;
	}

	GetModifierBonusStats_Strength(): number {
		return this.bonus_strength!;
	}

	GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number {
		// Check if this is the active item modifier
		if (!IsActiveModifierItem(this.ability)) return 0;

		// Cannot be procced by illusions
		if (this.parent.IsIllusion()) return 0;

		// Does not work against wards or buildings
		if (event.target.IsBuilding() || event.target.IsOther()) return 0;

		// Does nothing if ability is in cooldown
		if (!this.ability.IsCooldownReady()) return 0;

		// Calculate chance based on ranged/melee attacker
		const chance = this.parent.IsRangedAttacker() ? this.bash_chance_ranged! : this.bash_chance_melee!;

		// Psuedo random chance
		if (RollPseudoRandomPercentage(chance, PseudoRandom.CUSTOM_GAME_1, this.parent)) {
			// Put item in cooldown
			this.ability.UseResources(false, false, true);

			// Play impact sound
			event.target.EmitSound(this.sound_impact);

			// Stun
			event.target.AddNewModifier(this.parent, this.ability, BuiltInModifier.STUN, { duration: this.bash_duration });

			// Deal bonus damage
			return this.bonus_chance_damage!;
		}

		return 0;
	}

	OnDestroy(): void {
		RemoveActiveModifierItem(this.ability);
	}
}
