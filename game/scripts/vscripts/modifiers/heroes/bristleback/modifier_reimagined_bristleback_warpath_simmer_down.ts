import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_bristleback_warpath_simmer_down extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff: string = "particles/heroes/bristleback/bristleback_warpath_simmer_down.vpcf";

    // Modifier specials
    simmer_down_damage_resistance_bonus_per_stack?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        this.simmer_down_damage_resistance_bonus_per_stack = this.ability.GetSpecialValueFor("simmer_down_damage_resistance_bonus_per_stack");
    }

    GetEffectName(): string
    {
        return this.particle_buff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        return this.simmer_down_damage_resistance_bonus_per_stack! * this.GetStackCount() * (-1);
    }
}
