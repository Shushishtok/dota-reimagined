import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_void_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_void: string = "particles/units/heroes/hero_night_stalker/nightstalker_void.vpcf";

    // Modifier specials
    movespeed_slow?: number;
    attackspeed_slow?: number;
    vision_day?: number;
    vision_night?: number;    

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.movespeed_slow = this.ability.GetSpecialValueFor("movespeed_slow");
        this.attackspeed_slow = this.ability.GetSpecialValueFor("attackspeed_slow");
        this.vision_day = this.ability.GetSpecialValueFor("vision_day");
        this.vision_night = this.ability.GetSpecialValueFor("vision_night");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.FIXED_DAY_VISION, // Reimagined: Darkness Hungers: Void sets targets' vision to a medium value when cast during the day or to small value when cast during the night.
                ModifierFunction.FIXED_NIGHT_VISION] // Reimagined: Darkness Hungers: Void sets targets' vision to a medium value when cast during the day or to small value when cast during the night.
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.movespeed_slow! * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.attackspeed_slow!;
    }

    GetFixedDayVision(): number
    {
        return this.vision_day!;
    }

    GetFixedNightVision(): number
    {
        return this.vision_night!;
    }

    GetEffectName(): string
    {
        return this.particle_void;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}