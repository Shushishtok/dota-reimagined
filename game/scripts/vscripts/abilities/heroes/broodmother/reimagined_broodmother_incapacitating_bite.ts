import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_incapacitating_bite_passive";

@registerAbility()
export class reimagined_broodmother_incapacitating_bite extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_passive: string = "modifier_reimagined_broodmother_incapacitating_bite_passive";

    GetIntrinsicModifierName(): string
    {
        return this.modifier_passive;
    }
}
