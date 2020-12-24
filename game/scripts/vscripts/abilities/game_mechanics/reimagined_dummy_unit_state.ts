import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import "../../modifiers/general_mechanics/modifier_reimagined_dummy"

@registerAbility()
export class reimagined_dummy_unit_state extends BaseAbility
{
    modifier_dummy = "modifier_reimagined_dummy"

    GetIntrinsicModifierName(): string
    {
        return this.modifier_dummy;
    }
}
