import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_dark_ascension_active extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	bonus_damage?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		// Modifier properties

		this.ability = this.GetAbility()!;

		// Modifier specials
		this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");

		if (IsServer()) this.StartIntervalThink(FrameTime());
	}

	OnIntervalThink() {
		// Unobstructed vision
		AddFOWViewer(this.parent.GetTeamNumber(), this.parent.GetAbsOrigin(), this.parent.GetCurrentVisionRange(), FrameTime(), false);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.PREATTACK_BONUS_DAMAGE, ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS];
	}

	GetModifierPreAttack_BonusDamage() {
		return this.bonus_damage!;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.FLYING]: true };
	}

	GetPriority(): ModifierPriority {
		return ModifierPriority.NORMAL;
	}

	GetActivityTranslationModifiers(): string {
		return "hunter_night";
	}
}
