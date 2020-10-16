import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_passive"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_projectile_handler"
import "../../../modifiers/general_mechanics/modifier_reimagined_damage_penalty"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_pride_drow"

@registerAbility()
export class reimagined_drow_ranger_marksmanship extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "DrowRanger.Marksmanship.PrideOfTheDrow"; 

    // Ability specials
    damage_reduction_scepter?: number;

    // Reimagined specials
    pride_drow_duration?: number;    

    OnAbilityPhaseStart(): boolean
    {
        // Add TI6 activity for cast_ability_2 animation
        this.caster.AddActivityModifier("ti6");
        this.caster.StartGesture(GameActivity.DOTA_CAST_ABILITY_2);

        return true;
    }
    
    OnAbilityPhaseInterrupted(): void
    {
        // Clear TI6 activity for cast_ability_2 animation
        this.caster.ClearActivityModifiers();
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_drow_ranger_marksmanship_passive.name;
    }

    OnSpellStart(): void
    {
        // Clear TI6 activity for cast_ability_2 animation
        this.caster.ClearActivityModifiers();        

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Reimagined specials
        this.pride_drow_duration = this.GetSpecialValueFor("pride_drow_duration");

        // Reimagined: Pride of the Drow!: Can be activated to prevent Marksmanship being disabled by nearby enemies for 4/5/6 seconds. Has a cooldown of 60/50/40 seconds.
        this.ReimaginedPrideOfTheDrow();
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector)
    {
        if (!target) return;

        // Get damage reduction value
        this.damage_reduction_scepter = this.GetSpecialValueFor("damage_reduction_scepter");

        // give Drow a damage reduction penalty modifier for a frame
        const modifier = this.caster.AddNewModifier(this.caster, this, GenericModifier.DAMAGE_REDUCTION, {damage_reduction: this.damage_reduction_scepter});

        // Instant attack the target
        this.caster.PerformAttack(target, true, true, true, false, false, false, false);

        // Remove damage reduction penalty modifier
        modifier.Destroy();
    }

    ReimaginedPrideOfTheDrow(): void
    {
        this.caster.AddNewModifier(this.caster, this, "modifier_reimagined_drow_ranger_marksmanship_pride_drow", {duration: this.pride_drow_duration});
    }
}