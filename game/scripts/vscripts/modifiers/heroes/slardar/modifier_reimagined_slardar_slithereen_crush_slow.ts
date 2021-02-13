import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_slardar_slithereen_crush_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    status_fx = "particles/status_fx/status_effect_slardar_crush.vpcf";

    // Modifier specials
    crush_extra_slow?: number;
    crush_attack_slow_tooltip?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.crush_extra_slow = this.ability.GetSpecialValueFor("crush_extra_slow");
        this.crush_attack_slow_tooltip = this.ability.GetSpecialValueFor("crush_attack_slow_tooltip");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT]
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        // Reimagined: Royal Breaker: Enemies that are affected by Slithereen Crush's slow cannot block.
        return {[ModifierState.BLOCK_DISABLED]: true}
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.crush_extra_slow! * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.crush_attack_slow_tooltip! * (-1);
    }

    GetStatusEffectName(): string
    {
        return this.status_fx;
    }
}
