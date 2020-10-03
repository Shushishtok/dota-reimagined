import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_phantom_strike_escape_plan extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Reimagined specials
    escape_plan_ms_bonus_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Reimagined specials
        this.escape_plan_ms_bonus_pct = this.ability.GetSpecialValueFor("escape_plan_ms_bonus_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.escape_plan_ms_bonus_pct!;
    }
}