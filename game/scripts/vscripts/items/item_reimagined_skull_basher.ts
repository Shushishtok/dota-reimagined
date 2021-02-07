import { BaseItem , registerAbility } from "../lib/dota_ts_adapter";
import "../modifiers/items/skull_basher/modifier_item_reimagined_skull_basher"

@registerAbility()
export class item_reimagined_skull_basher extends BaseItem
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_passive: string = "modifier_item_reimagined_skull_basher"

    GetIntrinsicModifierName()
    {
        return this.modifier_passive;
    }
}
