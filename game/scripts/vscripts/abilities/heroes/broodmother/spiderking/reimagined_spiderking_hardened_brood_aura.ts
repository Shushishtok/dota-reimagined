import { BaseAbility, registerAbility } from "../../../../lib/dota_ts_adapter";
import "../../../../modifiers/heroes/broodmother/spiderking/modifier_reimagined_broodmother_spiderking_hardened_brood_aura";

@registerAbility()
export class reimagined_spiderking_hardened_brood_aura extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	modifier_aura: string = "modifier_reimagined_broodmother_spiderking_hardened_brood_aura";

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_spiderking_hardened_brood.vpcf", context);
	}

	GetIntrinsicModifierName(): string {
		return this.modifier_aura;
	}
}
