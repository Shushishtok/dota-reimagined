import { BaseAbility, registerAbility } from "../../../../lib/dota_ts_adapter";
import "../../../../modifiers/heroes/broodmother/spiderking/modifier_reimagined_broodmother_spiderking_venom_stinger_passive"

@registerAbility()
export class reimagined_spiderking_venom_stinger extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_passive: string = "modifier_reimagined_broodmother_spiderking_venom_stinger_passive"

    // Ability specials

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_spiderling_ticking_poison.vpcf", context);
        PrecacheResource(PrecacheType.SOUNDFILE,"soundevents/game_sounds_heroes/game_sounds_viper.vsndevts", context);
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_passive;
    }
}
