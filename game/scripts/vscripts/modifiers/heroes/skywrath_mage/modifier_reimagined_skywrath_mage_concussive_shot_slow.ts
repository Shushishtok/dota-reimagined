import { SkywrathMageTalents } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_skywrath_mage_concussive_shot_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_slow: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_slow_debuff.vpcf";

    // Reimagined properties
    brain_concussion: boolean = false;

    // Modifier specials
    movement_speed_pct?: number;

    // Reimagined specials
    brain_concussion_spell_amp_rdct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.movement_speed_pct = this.ability.GetSpecialValueFor("movement_speed_pct");

        // Reimagined specials
        this.brain_concussion_spell_amp_rdct = this.ability.GetSpecialValueFor("brain_concussion_spell_amp_rdct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.SPELL_AMPLIFY_PERCENTAGE,
                ModifierFunction.TURN_RATE_PERCENTAGE]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.movement_speed_pct! * (-1);
    }

    GetModifierSpellAmplify_Percentage(): number
    {
        if (this.brain_concussion)
        {
            return this.brain_concussion_spell_amp_rdct! * (-1);
        }

        return 0;
    }

    GetModifierTurnRate_Percentage(): number
    {
        // Talent: Motor Dysfunction: Brain Concussion now also decreases turn rate by x%
        return this.ReimaginedTalentMotorDysfunction();

        return 0;
    }    

    GetEffectName(): string
    {
        return this.particle_slow;        
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    ReimaginedTalentMotorDysfunction(): number
    {
        if (HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_4))
        {
            return GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_4, "turn_rate_reduction") * (-1);            
        }

        return 0;
    }
}