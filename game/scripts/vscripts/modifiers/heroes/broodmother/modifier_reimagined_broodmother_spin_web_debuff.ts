import { BroodmotherTalents } from "../../../abilities/heroes/broodmother/reimagined_broodmother_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenEntities, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import "./modifier_reimagined_broodmother_spin_web_web_sense_debuff";

@registerModifier()
export class modifier_reimagined_broodmother_spin_web_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    unit_web: string = "npc_dota_broodmother_web";
    closest_web?: CDOTA_BaseNPC;
    interval_think: number = 0.25;
    modifier_web_sense: string = "modifier_reimagined_broodmother_spin_web_web_sense_debuff";

    // Modifier specials
    web_sense_duration?: number;
    radius?: number;

    // Reimagined talent properties
    talent_3_accumulated_moving_time: number = 0;
    timer?: string;

    // Reimagined talent specials
    talent_3_move_speed_slow_per_stack?: number;
    talent_3_max_stacks?: number;
    talent_3_check_interval?: number;
    talent_3_time_threshold?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.web_sense_duration = this.ability.GetSpecialValueFor("web_sense_duration");
        this.radius = this.ability.GetSpecialValueFor("radius");

        if (IsServer()) this.StartIntervalThink(this.interval_think);
    }

    OnIntervalThink(): void
    {
        // Check if no web is registered yet, or the current web is invalid
        if (!this.closest_web || !IsValidEntity(this.closest_web) || this.closest_web.IsNull())
        {
            const closest_web = this.FindClosestWeb();
            if (closest_web)
            {
                this.closest_web = closest_web;
                this.parent.AddNewModifier(this.caster, this.ability, this.modifier_web_sense, {duration: this.web_sense_duration!});
            }
        }
        // Check if we're no longer in distance of the current web
        else if (CalculateDistanceBetweenEntities(this.parent, this.closest_web) > this.radius!)
        {
            // We need a new web
            const closest_web = this.FindClosestWeb();

            // Register the new closest web and initialize timer
            if (closest_web)
            {
                // We got a new web: re-initialize
                this.closest_web = closest_web;
                this.parent.RemoveModifierByName(this.modifier_web_sense);
                this.parent.AddNewModifier(this.caster, this.ability, this.modifier_web_sense, {duration: this.web_sense_duration!});
            }
        }

        // Talent: Tangled: Enemies that move while inside of a web gain a stack for every t seconds they accumulate moving in a web. Each stack reduces move speed by x, up to a maximum of y stacks up. Checks in z seconds intervals.
        this.ReimaginedTalentTangled();
    }

    ReimaginedTalentTangled()
    {
        if (HasTalent(this.caster, BroodmotherTalents.BroodmotherTalent_3))
        {
            // Initialize variables
            if (!this.talent_3_move_speed_slow_per_stack) this.talent_3_move_speed_slow_per_stack = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_3, "move_speed_slow_per_stack");
            if (!this.talent_3_max_stacks) this.talent_3_max_stacks = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_3, "max_stacks");
            if (!this.talent_3_check_interval) this.talent_3_check_interval = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_3, "check_interval");
            if (!this.talent_3_time_threshold) this.talent_3_time_threshold = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_3, "time_threshold");

            // If timer is initialized already, do nothing
            if (this.timer) return;

            // Initialize a timer
            this.timer = Timers.CreateTimer(this.talent_3_check_interval, () =>
            {
                // Only apply if the modifier still exists
                if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
                {
                    // Check if the parent is moving inside the web (if it wasn't on the web, that debuff wouldn't exist)
                    if (this.parent.IsMoving())
                    {
                        // Accumulate movement
                        this.talent_3_accumulated_moving_time += this.talent_3_check_interval!;

                        // Check if we're past the threshold
                        if (this.talent_3_accumulated_moving_time >= this.talent_3_time_threshold!)
                        {
                            // Increment a stack and reset the timer
                            this.IncrementStackCount();
                            this.talent_3_accumulated_moving_time = 0;

                            // Check if stacks can be accumulated further; if not, stop the timer.
                            if (this.GetStackCount() >= this.talent_3_max_stacks!)
                            {
                                return undefined;
                            }
                        }
                    }

                    return this.talent_3_check_interval;
                }
            });
        }
    }

    FindClosestWeb(): CDOTA_BaseNPC | undefined
    {
        // Find the closest web in the radius
        const webs = Entities.FindAllByNameWithin(this.unit_web, this.parent.GetAbsOrigin(), this.radius!) as CDOTA_BaseNPC[];
        let closest_web: CDOTA_BaseNPC | undefined;
        let closest_web_distance: number = 0;
        for (const web of webs)
        {
            if (!closest_web)
            {
                closest_web = web;
                closest_web_distance = CalculateDistanceBetweenEntities(this.parent, web);
            }
            else
            {
                // Check if the web is closer than the closest web we've encountered thus far
                if (CalculateDistanceBetweenEntities(this.parent, web) < closest_web_distance)
                {
                    closest_web = web;
                    closest_web_distance = CalculateDistanceBetweenEntities(this.parent, web);
                }
            }
        }

        return closest_web;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP,
                // Talent: Tangled: Enemies that move while inside of a web gain a stack for every t seconds they accumulate moving in a web. Each stack reduces move speed by x, up to a maximum of y stacks up. Checks in z seconds intervals.
                ModifierFunction.MOVESPEED_BONUS_CONSTANT
        ]
    }

    OnTooltip(): number
    {
        return this.web_sense_duration!;
    }

    GetModifierMoveSpeedBonus_Constant(): number
    {
        // Talent: Tangled: Enemies that move while inside of a web gain a stack for every t seconds they accumulate moving in a web. Each stack reduces move speed by x, up to a maximum of y stacks up. Checks in z seconds intervals.
        return this.ReimaginedTalentTangledSlow()
    }

    ReimaginedTalentTangledSlow(): number
    {
        if (HasTalent(this.caster, BroodmotherTalents.BroodmotherTalent_3))
        {
            // Initialize variables
            if (!this.talent_3_move_speed_slow_per_stack) this.talent_3_move_speed_slow_per_stack = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_3, "move_speed_slow_per_stack");

            return this.talent_3_move_speed_slow_per_stack * this.GetStackCount() * (-1);
        }

        return 0
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // Remove the Web Sense modifier, if any
        if (this.parent.HasModifier(this.modifier_web_sense)) this.parent.RemoveModifierByName(this.modifier_web_sense);
    }
}
