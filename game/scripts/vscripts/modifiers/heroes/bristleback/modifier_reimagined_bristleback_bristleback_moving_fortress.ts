import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_bristleback_bristleback_moving_fortress extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    moving_fortress_move_slow_pct?: number;
    moving_fortress_attack_speed_slow?: number;
    moving_fortress_damage_reduction_bonus?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.moving_fortress_move_slow_pct = this.ability.GetSpecialValueFor("moving_fortress_move_slow_pct");
        this.moving_fortress_attack_speed_slow = this.ability.GetSpecialValueFor("moving_fortress_attack_speed_slow");
        this.moving_fortress_damage_reduction_bonus = this.ability.GetSpecialValueFor("moving_fortress_damage_reduction_bonus");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.TOOLTIP]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.moving_fortress_move_slow_pct! * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.moving_fortress_attack_speed_slow! * (-1);
    }

    OnTooltip(): number
    {
        return this.moving_fortress_damage_reduction_bonus!;
    }
}
