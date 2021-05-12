import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_antimage_counterspell_active } from "./modifier_reimagined_antimage_counterspell_active";

@registerModifier()
export class modifier_reimagined_antimage_counterspell_passive extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	reflected_abilities?: CDOTABaseAbility[];
	currently_reflecting: boolean = false;

	// Modifier specials
	magic_resistance?: number;

	// Reimagined specials
	instinctive_counter_trigger_multiplier?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		// Modifier specials
		this.magic_resistance = this.ability.GetSpecialValueFor("magic_resistance");

		// Reimagined specials
		this.instinctive_counter_trigger_multiplier = this.ability.GetSpecialValueFor("instinctive_counter_trigger_multiplier");

		// Initialize reflection table for Counterspell's active
		this.reflected_abilities = [];

		if (IsServer()) {
			this.StartIntervalThink(3);
		}
	}

	OnRefresh(): void {
		// Modifier specials
		this.magic_resistance = this.ability.GetSpecialValueFor("magic_resistance");

		// Reimagined specials
		this.instinctive_counter_trigger_multiplier = this.ability.GetSpecialValueFor("instinctive_counter_trigger_multiplier");
	}

	OnIntervalThink(): void {
		util.RemoveReflectedAbilities(this);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.MAGICAL_RESISTANCE_BONUS,
			ModifierFunction.ABSORB_SPELL, // Reimagined effect
			ModifierFunction.REFLECT_SPELL,
		]; // Reimagined effect
	}

	GetModifierMagicalResistanceBonus(): number {
		// If the parent is an illusion or broken, give no bonus
		if (this.parent.IsIllusion()) return 0;
		if (this.parent.PassivesDisabled()) return 0;

		return this.magic_resistance!;
	}

	GetAbsorbSpell(event: ModifierAbilityEvent): 0 | 1 {
		// Reimagined: Instinctive Counter: Can be set to auto cast, allowing it to trigger automatically whenever an ability is fired towards Anti Mage. However, doing so multiplies the cooldown and the mana cost of Counterspell by a certain multiplier.
		if (!this.ReimaginedInstinctiveCounter(event, false)) {
			return 0;
		}

		return 1;
	}

	GetReflectSpell(event: ModifierAbilityEvent): 0 | 1 {
		// Reimagined: Instinctive Counter: Can be set to auto cast, allowing it to trigger automatically whenever an ability is fired towards Anti Mage. However, doing so multiplies the cooldown and the mana cost of Counterspell by a certain multiplier.
		if (!this.ReimaginedInstinctiveCounter(event, true)) {
			return 0;
		}

		return 1;
	}

	ReimaginedInstinctiveCounter(event: ModifierAbilityEvent, reflect: boolean): boolean {
		// Does not trigger on illusions
		if (this.parent.IsIllusion()) return false;

		// Does not trigger if the active portion is currently working
		if (this.parent.HasModifier(modifier_reimagined_antimage_counterspell_active.name)) return false;

		const manacost: number = this.ability.GetManaCost(this.ability.GetLevel() - 1) * this.instinctive_counter_trigger_multiplier!;
		const cooldown: number = this.ability.GetCooldown(this.ability.GetLevel() - 1) * this.instinctive_counter_trigger_multiplier!;

		// Check if the ability is set to auto cast and it is ready to be used
		if (this.ability.GetAutoCastState() && this.ability.IsCooldownReady() && manacost <= this.parent.GetMana()) {
			if (reflect) {
				// Check if the spell reflect can trigger as expected
				if (util.SpellReflect(event, this.parent, this.GetName())) {
					// Activate the ability manually
					this.ability.OnSpellStart();

					// Wait for a frame to allow both absorb and reflect to trigger before going into cooldown
					Timers.CreateTimer(FrameTime(), () => {
						// Spend mana and cooldown with multiplier
						this.parent.SpendMana(manacost, this.ability);
						this.ability.StartCooldown(cooldown);
					});

					return true;
				}
			} else {
				return true;
			}
		}

		// If we got here, Spell Reflect should not trigger
		return false;
	}
}
