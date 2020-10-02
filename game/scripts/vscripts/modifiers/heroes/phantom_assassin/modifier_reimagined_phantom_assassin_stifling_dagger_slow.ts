import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_stifling_dagger_slow extends BaseModifier
{
    // // Modifier properties
    // caster: CDOTA_BaseNPC = this.GetCaster()!;
    // ability: CDOTABaseAbility = this.GetAbility()!; 
    // parent: CDOTA_BaseNPC = this.GetParent();
    // particle_slow: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger_debuff.vpcf";

    // // Modifier specials
    // move_slow?: number;

    // // Reimagined specials
    // stifling_blade_outgoing_damage?: number;

    // IsHidden() {return false}
    // IsDebuff() {return true}
    // IsPurgable() {return true}

    OnCreated(): void
    {
        // // Modifier specials
        // this.move_slow = this.ability.GetSpecialValueFor("move_slow");

        // // Reimagined specials
        // this.stifling_blade_outgoing_damage = this.ability.GetSpecialValueFor("stifling_blade_outgoing_damage");        
    }

    // DeclareFunctions(): ModifierFunction[]
    // {
    //     return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
    //             // Reimagined: Stifling Blade: Also reduces the outgoing damage of the target by 30% for the duration of the slow.
    //             ModifierFunction.DAMAGEOUTGOING_PERCENTAGE 
    //         ]
    // }

    // GetModifierMoveSpeedBonus_Percentage(): number
    // {
    //     return this.move_slow! * (-1);
    // }

    // GetModifierDamageOutgoing_Percentage(): number
    // {
    //     return this.stifling_blade_outgoing_damage! * (-1);
    // }

    // GetEffectName(): string
    // {
    //     return this.particle_slow;
    // }

    // GetEffectAttachType(): ParticleAttachment
    // {
    //     return ParticleAttachment.ABSORIGIN_FOLLOW;
    // }
}