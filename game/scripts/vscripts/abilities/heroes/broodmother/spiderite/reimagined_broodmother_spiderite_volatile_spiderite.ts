import { BaseAbility, registerAbility } from "../../../../lib/dota_ts_adapter";
import "../../../../modifiers/heroes/broodmother/spiderite/modifier_reimagined_broodmother_spiderite_volatile_spiderite";

@registerAbility()
export class reimagined_broodmother_spiderite_volatile_spiderite extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	modifier_volatile_spiderite: string = "modifier_reimagined_broodmother_spiderite_volatile_spiderite";

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.SOUNDFILE, "soundevents/game_sounds_heroes/game_sounds_snapfire.vsndevts", context);
		PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_spiderling_volatile_spiderling.vpcf", context);
	}

	GetIntrinsicModifierName(): string {
		return this.modifier_volatile_spiderite;
	}
}
