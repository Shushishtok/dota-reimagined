import { BaseAbility , registerAbility } from "../../../../lib/dota_ts_adapter";
import "../../../../modifiers/heroes/broodmother/spiderling/modifier_reimagined_broodmother_spiderling_spawn_spiderite_passive";

@registerAbility()
export class reimagined_broodmother_spiderling_spawn_spiderite extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_spawn_spiderite: string = "modifier_reimagined_broodmother_spiderling_spawn_spiderite_passive";

    GetIntrinsicModifierName(): string
    {
        return this.modifier_spawn_spiderite;
    }
}
