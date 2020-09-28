import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_effect: string = "particles/heroes/crystal_maiden/arcane_aura_focused_arcane_effect.vpcf";

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    GetEffectName()
    {
        return this.particle_effect;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.GetAbility()!.GetSpecialValueFor("focused_arcane_radius");
    }
}