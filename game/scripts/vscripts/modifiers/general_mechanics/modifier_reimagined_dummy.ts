import { BaseModifier, registerModifier, } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_dummy extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated()
    {
        if (IsServer()) this.parent.AddNoDraw();
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.INVULNERABLE]: true,
                [ModifierState.UNTARGETABLE]: true,
                [ModifierState.NOT_ON_MINIMAP]: true,
                [ModifierState.NO_HEALTH_BAR]: true,
                [ModifierState.NO_UNIT_COLLISION]: true,
                [ModifierState.OUT_OF_GAME]: true,
                [ModifierState.STUNNED]: true,
                [ModifierState.UNSELECTABLE]: true}
    }
}
