import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    base_night_duration: number = 300;
    everlasting_night_stacks: number = 0;
    actual_night_duration?: number;
    peak_of_the_night_time?: number;
    bonus_instances: number = 0;    
    elapsed_time: number = 0;    

    // Reimagined specials
    dead_of_night_interval?: number;
    dead_of_night_stats_per_stack?: number;
    dead_of_night_bonuses_per_stack?: number;
    dead_of_night_durations_per_stack?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Reimagined specials
        this.dead_of_night_interval = this.ability!.GetSpecialValueFor("dead_of_night_interval");
        this.dead_of_night_stats_per_stack = this.ability!.GetSpecialValueFor("dead_of_night_stats_per_stack");
        this.dead_of_night_bonuses_per_stack = this.ability!.GetSpecialValueFor("dead_of_night_bonuses_per_stack");        

        // TODO: Get amount of Everlasting Nights stacks

        // Calculate actual night duration by using Everlasting Nights stacks
        this.actual_night_duration = this.base_night_duration + this.everlasting_night_stacks;

        // Set duration of the buff to match the duration of the night
        this.SetDuration(this.actual_night_duration!, true);

        // Calculate "peak" of the night
        this.peak_of_the_night_time = this.actual_night_duration / 2;        

        // Start thinking
        this.StartIntervalThink(this.dead_of_night_interval);
    }

    OnIntervalThink()
    {
        // Every think interval, increase bonus instance by 1, which will be referenced to determine how much to strengthen the stats
        this.bonus_instances++;
        
        // Increase elapsed time
        this.elapsed_time = this.elapsed_time + this.dead_of_night_interval!;        

        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            // Calculate stack count according to percentage of elapsed time
            this.SetStackCount(this.elapsed_time! / this.peak_of_the_night_time! * 100);
        }
        else
        {
            // Calculate stack count in degrading order (stacks are decaying)
            this.SetStackCount((1 - ((this.elapsed_time - this.peak_of_the_night_time!)) / this.peak_of_the_night_time!) * 100);
        }

        // Calculate stats
        if (IsServer())
        {
            ((this.parent) as CDOTA_BaseNPC_Hero).CalculateStatBonus();

            // If elapsed time surprassed the entire duration, remove this modifier
            if (this.elapsed_time >= this.actual_night_duration!)
            {
                this.Destroy();
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.STATS_STRENGTH_BONUS,
                ModifierFunction.STATS_AGILITY_BONUS,
                ModifierFunction.STATS_INTELLECT_BONUS,
                ModifierFunction.MOVESPEED_BONUS_CONSTANT,
                ModifierFunction.PREATTACK_BONUS_DAMAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT]
    }

    GetModifierBonusStats_Strength(): number
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }

        return actual_bonus;
    }

    GetModifierBonusStats_Agility(): number
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }

        return actual_bonus;
    }

    GetModifierBonusStats_Intellect(): number
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_stats_per_stack!;
        }

        return actual_bonus;
    }

    GetModifierMoveSpeedBonus_Constant(): number
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }

        return actual_bonus;
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }

        return actual_bonus;
    }

    GetModifierAttackSpeedBonus_Constant()
    {
        // Does nothing when broken
        if (this.parent.PassivesDisabled()) return 0;

        // Does nothing if this is currently a day (e.g. Phoenix' Supernova)
        if (this.parent.GetModifierStackCount("modifier_reimagined_night_stalker_hunter_in_the_night_passive", this.parent) == 0)
        {
            return 0;
        }

        let actual_bonus;
        if (this.elapsed_time <= this.peak_of_the_night_time!)
        {
            actual_bonus = this.elapsed_time / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }
        else
        {
            actual_bonus = ((this.peak_of_the_night_time! - this.elapsed_time) + this.peak_of_the_night_time!) / this.dead_of_night_interval! * this.dead_of_night_bonuses_per_stack!;
        }

        return actual_bonus;
    }
}