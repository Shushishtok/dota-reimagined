import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { IsSpiderlingUnit } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_spin_web_aura_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	health_regen?: number;
	bonus_movespeed?: number;
	bonus_movespeed_scepter?: number;

	// Reimagined specials
	web_menuever_dmg_pct?: number;
	web_menuever_attack_speed?: number;

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
		// Modifier specials
		this.health_regen = this.ability.GetSpecialValueFor("health_regen");
		this.bonus_movespeed = this.ability.GetSpecialValueFor("bonus_movespeed");
		this.bonus_movespeed_scepter = this.ability.GetSpecialValueFor("bonus_movespeed_scepter");

		// Reimagined specials
		this.web_menuever_dmg_pct = this.ability.GetSpecialValueFor("web_menuever_dmg_pct");
		this.web_menuever_attack_speed = this.ability.GetSpecialValueFor("web_menuever_attack_speed");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.HEALTH_REGEN_CONSTANT,
			ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
			ModifierFunction.IGNORE_MOVESPEED_LIMIT,

			// Reimagined: Web Manuever: Increases Spiderlings and Spiderites' damage reduction by x% while they are on a web. Broodmother and any spider unit under her control also gain y attack speed bonus while on a web.
			ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
			ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
			ModifierFunction.TOOLTIP,
		];
	}

	OnTooltip(): number {
		return this.web_menuever_dmg_pct!;
	}

	GetModifierConstantHealthRegen(): number {
		return this.health_regen!;
	}

	GetModifierMoveSpeedBonus_Percentage(): number {
		if (!this.caster.HasScepter()) return this.bonus_movespeed!;
		else return this.bonus_movespeed_scepter!;
	}

	GetModifierIgnoreMovespeedLimit(): 0 | 1 {
		if (this.caster.HasScepter()) return 1;
		else return 0;
	}

	GetModifierIncomingDamage_Percentage(): number {
		// Reimagined: Web Manuever: Increases Spiderlings and Spiderites' damage reduction by x% while they are on a web. Broodmother and any spider unit under her control also gain y attack speed bonus while on a web.
		return this.ReimaginedWebManueverIncomingDamage();
	}

	GetModifierAttackSpeedBonus_Constant(): number {
		// Reimagined: Web Manuever: Increases Spiderlings and Spiderites' damage reduction by x% while they are on a web. Broodmother and any spider unit under her control also gain y attack speed bonus while on a web.
		return this.ReimaginedWebManueverAttackSpeed();
	}

	ReimaginedWebManueverIncomingDamage(): number {
		if (IsSpiderlingUnit(this.parent, false)) return this.web_menuever_dmg_pct! * -1;
		return 0;
	}

	ReimaginedWebManueverAttackSpeed(): number {
		return this.web_menuever_attack_speed!;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true };
	}
}
