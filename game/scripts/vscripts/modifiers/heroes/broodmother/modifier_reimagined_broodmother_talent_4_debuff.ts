import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_talent_4_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_debuff: string = "particles/heroes/broodmother/broodmother_webbed_up_debuff.vpcf";

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.ROOTED]: true,
                [ModifierState.DISARMED]: true}
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
