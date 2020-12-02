import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.HEALTH_BONUS]
    }

    GetModifierHealthBonus(): number
    {
        return this.GetStackCount();
    }
}
