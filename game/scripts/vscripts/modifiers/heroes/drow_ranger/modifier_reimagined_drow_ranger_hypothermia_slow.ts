import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_hypothermia_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_slow: string = "particles/generic_gameplay/generic_slowed_cold.vpcf";
    status_effect_slow: string = "particles/status_fx/status_effect_frost.vpcf";

    // Modifier specials
    shard_burst_slow_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.shard_burst_slow_pct = this.ability.GetSpecialValueFor("shard_burst_slow_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.shard_burst_slow_pct! * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_slow;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    GetStatusEffectName(): string
    {
        return this.status_effect_slow;
    }
}
