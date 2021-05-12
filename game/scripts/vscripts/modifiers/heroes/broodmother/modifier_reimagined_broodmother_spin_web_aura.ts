import { reimagined_broodmother_spin_web } from "../../../abilities/heroes/broodmother/reimagined_broodmother_spin_web";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { IsSpiderlingUnit } from "../../../lib/util";
import "./modifier_reimagined_broodmother_spin_web_aura_buff";
import "./modifier_reimagined_broodmother_spin_web_debuff";

@registerModifier()
export class modifier_reimagined_broodmother_spin_web_aura extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_web_loop: string = "Hero_Broodmother.WebLoop";
	aura_modifier_name = "modifier_reimagined_broodmother_spin_web_aura_buff";
	friendly_modifier_name = "modifier_reimagined_broodmother_spin_web_aura_buff";
	enemy_modifier_name = "modifier_reimagined_broodmother_spin_web_debuff";

	// Modifier specials
	radius?: number;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	RemoveOnDeath() {
		return true;
	}

	OnCreated(): void {
		// Modifier specials
		this.radius = this.ability.GetSpecialValueFor("radius");

		// Play loop sound
		EmitSoundOn(this.sound_web_loop, this.parent);
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.NO_HEALTH_BAR]: true, [ModifierState.INVULNERABLE]: true, [ModifierState.NO_UNIT_COLLISION]: true, [ModifierState.NOT_ON_MINIMAP_FOR_ENEMIES]: true };
	}

	OnDestroy(): void {
		// Stop playing loop sound
		StopSoundOn(this.sound_web_loop, this.parent);

		if (IsServer()) UTIL_Remove(this.parent);
	}

	// Aura properties
	IsAura() {
		return true;
	}
	GetAuraDuration() {
		return 0.2;
	}
	GetAuraEntityReject(target: CDOTA_BaseNPC): boolean {
		// Reject illusions
		if (target.IsIllusion()) return true;

		// Change the modifier name based on the team of the target
		if (target.GetTeamNumber() == this.caster.GetTeamNumber()) {
			this.aura_modifier_name = this.friendly_modifier_name;

			// Only apply on the caster or any spider units under her control
			if (IsSpiderlingUnit(target, true) || target == this.caster) return false;
			return true;
		} else {
			// Reimagined: Web Sense: Enemies entering the web have their models shown through Fog of War for x seconds. This can only occur once per entrance to the web.
			// The aura also applies for Webbed Up in Incapacitating Bite
			this.aura_modifier_name = this.enemy_modifier_name;
			return false;
		}
	}

	GetAuraRadius() {
		return this.radius!;
	}
	GetAuraSearchFlags() {
		return UnitTargetFlags.NONE;
	}
	GetAuraSearchTeam() {
		return UnitTargetTeam.BOTH;
	}
	GetAuraSearchType() {
		return UnitTargetType.HERO + UnitTargetType.BASIC;
	}
	GetModifierAura() {
		return this.aura_modifier_name;
	}
}
