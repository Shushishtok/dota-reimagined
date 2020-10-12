import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_pride_drow extends BaseModifier
{
    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    // TODO: Add a cool particle effect
}