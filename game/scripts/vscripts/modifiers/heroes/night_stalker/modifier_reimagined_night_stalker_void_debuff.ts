import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "./modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";

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

    // Reimagined talent specials
    talent_armor_reduction_per_stack?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
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
                ModifierFunction.FIXED_NIGHT_VISION, // Reimagined: Darkness Hungers: Void sets targets' vision to a medium value when cast during the day or to small value when cast during the night.
                ModifierFunction.ON_ATTACK_LANDED, // Talent: Rip and Tear
                ModifierFunction.PHYSICAL_ARMOR_BONUS] // Talent: Rip and Tear
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

    OnAttackLanded(event: ModifierAttackEvent)
    {
        // Talent: Rip And Tear: Each attack Night Stalker makes against an enemy affected by Void reduces their armor by x
        this.ReimaginedTalentRipAndTear(event);
    }

    GetModifierPhysicalArmorBonus(): number
    {
        // Talent: Rip And Tear: Each attack Night Stalker makes against an enemy affected by Void reduces their armor by x
        return this.ReimaginedTalentRipAndTearArmorReduction();
    }

    GetEffectName(): string
    {
        return this.particle_void;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    ReimaginedTalentRipAndTear(event: ModifierAttackEvent)
    {
        // Only apply if the attacker is the caster the applied the debuff
        if (event.attacker != this.caster) return;

        if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_1))
        {                                    
            this.IncrementStackCount();
        }
    }    

    ReimaginedTalentRipAndTearArmorReduction(): number
    {
        if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_1))
        {
            if (!this.talent_armor_reduction_per_stack) this.talent_armor_reduction_per_stack = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_1, "armor_reduction");            

            return this.talent_armor_reduction_per_stack * this.GetStackCount() * (-1);
        }

        return 0;
    }
}