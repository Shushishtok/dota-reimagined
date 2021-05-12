import { reimagined_bristleback_viscous_nasal_goo } from "../../../abilities/heroes/bristleback/reimagined_bristleback_viscous_nasal_goo";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

// Reimagined: Sneezer Pound: When attacking an enemy unit, grants a chance to automatically cast Nasal Goo on it, regardless of cooldown and mana. Doesn't trigger cooldown.
@registerModifier()
export class modifier_reimagined_bristleback_nasal_goo_passive extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	sneezer_pound_chance?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	IsPermanent() {
		return true;
	}

	OnCreated(): void {
		this.GetAbilitySpecialValues();
	}

	OnRefresh(): void {
		this.GetAbilitySpecialValues();
	}

	GetAbilitySpecialValues(): void {
		this.sneezer_pound_chance = this.ability.GetSpecialValueFor("sneezer_pound_chance");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ON_ATTACK_LANDED];
	}

	OnAttackLanded(event: ModifierAttackEvent): void {
		if (!IsServer()) return;

		// Only apply on attacks done by the parent
		if (event.attacker != this.parent) return;

		// Do nothing if target is a building or a ward
		if (event.target.IsBuilding() || event.target.IsOther()) return;

		// Do nothing if this is an illusion
		if (event.attacker.IsIllusion()) return;

		// Do nothing if the attacker's passives are disabled
		if (event.attacker.PassivesDisabled()) return;

		// Do nothing if target is spell immune
		if (event.target.IsMagicImmune()) return;

		// Calculate chance
		if (RollPseudoRandomPercentage(this.sneezer_pound_chance!, PseudoRandom.CUSTOM_GAME_1, this.parent)) {
			(this.ability as reimagined_bristleback_viscous_nasal_goo).FireNasalGoo(this.parent, event.target, true);
		}
	}
}
