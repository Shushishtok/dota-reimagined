import { BaseAbility , registerAbility } from "../../../../lib/dota_ts_adapter";
import "../../../../modifiers/heroes/broodmother/spiderling/modifier_reimagined_broodmother_spiderling_poison_sting_passive"

@registerAbility()
export class reimagined_broodmother_spiderling_poison_sting extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_poison_sting = "modifier_reimagined_broodmother_spiderling_poison_sting_passive"

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.SOUNDFILE, "soundevents/game_sounds_heroes/game_sounds_snapfire.vsndevts", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_spiderling_volatile_spiderling.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_spiderling_ticking_poison.vpcf", context);
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_poison_sting;
    }
}
