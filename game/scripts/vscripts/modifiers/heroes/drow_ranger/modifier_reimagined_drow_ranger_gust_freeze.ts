import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_gust_freeze extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_frozen: string = "particles/heroes/drow_ranger/wavechill_frozen.vpcf";

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}
    IsStunDebuff() {return true}
    IsPurgeException() {return true}
    ShouldUseOverheadOffset() {return true}

    GetEffectName(): string
    {
        return this.particle_frozen;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.FROZEN]: true,
                [ModifierState.STUNNED]: true}
    }
}
