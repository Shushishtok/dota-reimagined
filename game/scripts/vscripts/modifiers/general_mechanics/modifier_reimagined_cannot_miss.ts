import { BaseModifier, registerModifier, } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_cannot_miss extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}    

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.CANNOT_MISS]: true}
    }
}