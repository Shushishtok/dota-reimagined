import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost extends BaseModifier
{   
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    ranger_frost_attack_speed?: number;
    ranger_frost_projectile_speed?: number;
    ranger_frost_disable_distance_decrease?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated()
    {
        this.ranger_frost_attack_speed = this.ability.GetSpecialValueFor("ranger_frost_attack_speed");
        this.ranger_frost_projectile_speed = this.ability.GetSpecialValueFor("ranger_frost_projectile_speed");
        this.ranger_frost_disable_distance_decrease = this.ability.GetSpecialValueFor("ranger_frost_disable_distance_decrease");
    }

    OnRefresh()
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.PROJECTILE_SPEED_BONUS,
                ModifierFunction.TOOLTIP]
    }    

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.ranger_frost_attack_speed! * this.GetStackCount();
    }

    GetModifierProjectileSpeedBonus(): number
    {
        return this.ranger_frost_projectile_speed! * this.GetStackCount();
    }

    OnTooltip(): number
    {
        return this.ranger_frost_disable_distance_decrease!;
    }
}