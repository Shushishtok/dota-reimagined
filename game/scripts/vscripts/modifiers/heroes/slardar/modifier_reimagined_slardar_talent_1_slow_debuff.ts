import { SlardarTalents } from "../../../abilities/heroes/slardar/reimagined_slardar_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_talent_1_slow_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_debuff: string = "particles/econ/items/slardar/slardar_takoyaki/slardar_crush_entity_tako_debuff.vpcf"

    // Modifier specials
    slow_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.slow_pct = GetTalentSpecialValueFor(this.caster, SlardarTalents.SlardarTalent_1, "slow_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.slow_pct! * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_debuff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
