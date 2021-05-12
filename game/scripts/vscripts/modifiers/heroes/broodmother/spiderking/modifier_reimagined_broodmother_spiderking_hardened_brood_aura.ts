import { BaseModifier, registerModifier } from "../../../../lib/dota_ts_adapter";
import { IsSpiderlingUnit } from "../../../../lib/util";
import "./modifier_reimagined_broodmother_spiderking_hardened_brood_buff";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_hardened_brood_aura extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	modifier_buff: string = "modifier_reimagined_broodmother_spiderking_hardened_brood_buff";

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

	OnCreated(): void {
		// Modifier specials
		this.radius = this.ability.GetSpecialValueFor("radius");
	}

	IsAura() {
		return true;
	}
	GetAuraDuration() {
		return 0.25;
	}
	GetAuraEntityReject(target: CDOTA_BaseNPC): boolean {
		// Only apply on Spiderlings and Spiderites
		if (IsSpiderlingUnit(target, false)) return false;
		return true;
	}
	GetAuraRadius() {
		return this.radius!;
	}
	GetAuraSearchFlags() {
		return UnitTargetFlags.OUT_OF_WORLD + UnitTargetFlags.PLAYER_CONTROLLED;
	}
	GetAuraSearchTeam() {
		return UnitTargetTeam.FRIENDLY;
	}
	GetAuraSearchType() {
		return UnitTargetType.BASIC;
	}
	GetModifierAura() {
		return this.modifier_buff;
	}
}
