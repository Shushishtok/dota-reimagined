import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_frost_arrows_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    status_effect: string = "particles/status_fx/status_effect_drow_frost_arrow.vpcf";

    // Modifier specials
    frost_arrows_movement_speed?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.frost_arrows_movement_speed = this.ability.GetSpecialValueFor("frost_arrows_movement_speed");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.frost_arrows_movement_speed! * (-1);
    }

    GetStatusEffectName()
    {
        return this.status_effect;
    }
}
