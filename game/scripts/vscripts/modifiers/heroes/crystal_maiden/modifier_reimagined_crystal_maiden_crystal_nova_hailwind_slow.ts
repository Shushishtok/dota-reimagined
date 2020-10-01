import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_hailwind_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_slowed = "particles/generic_gameplay/generic_slowed_cold.vpcf";

    // Reimagined specials
    hailwind_slow_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Reimagined specials
        this.hailwind_slow_pct = this.ability.GetSpecialValueFor("hailwind_slow_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.hailwind_slow_pct! * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_slowed;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}