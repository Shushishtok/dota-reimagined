import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_insatiable_hunger_buff"
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_insatiable_hunger_feed_brood_debuff"
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff"
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_insatiable_hunger_feed_brood_unit_heal"
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_insatiable_hunger_queen_of_brood_buff"
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_talent_7_cooldown"

@registerAbility()
export class reimagined_broodmother_insatiable_hunger extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_insatiable: string = "modifier_reimagined_broodmother_insatiable_hunger_buff";
    ability_spiderking: string = "reimagined_broodmother_spawn_spiderking";

    // Ability specials
    duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_broodmother/broodmother_hunger_buff.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/broodmother/broodmother_insatiable_hunger_feed_brood_heal.vpcf", context);
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Apply Insatiable Hunger's buff
        this.caster.AddNewModifier(this.caster, this, this.modifier_insatiable, {duration: this.duration});
    }
}
