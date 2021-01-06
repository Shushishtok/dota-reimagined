import { SlardarTalents } from "../../../abilities/heroes/slardar/reimagined_slardar_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent, IsInRiver } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_sprint_river extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_river: string = "particles/units/heroes/hero_slardar/slardar_sprint_river.vpcf";
    particle_river_fx?: ParticleID;
    currently_in_river: boolean = false;
    river_think_interval: number = 0.1;

    // Modifier specials
    river_speed?: number;
    puddle_regen?: number;
    puddle_armor?: number;
    puddle_status_resistance?: number;

    // Reimagind properties
    time_accumulated_in_river: number = 0;
    water_comfort_timer?: string;

    // Reimagined specials
    watery_comfort_interval?: number;
    watery_comfort_cd_redcution?: number;
    watery_comfort_river_bonus_linger?: number;

    // Reimagined talent specials
    talent_2_movespeed_pct?: number;

    // Stacks set to 1 by default: 1 means inactive and hidden, 0 is active and shown in the HUD.
    IsHidden()
    {
        // Hide when inactive
        return this.GetStackCount() == 1;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}
    DestroyOnExpire() {return false}

    OnCreated(): void
    {
        this.GetAbilitySpecialValues();

        if (!IsServer()) return;

        // Set by default to inactive and start thinking
        this.SetStackCount(1);
        this.StartIntervalThink(this.river_think_interval);
    }

    GetAbilitySpecialValues()
    {
        // Modifier specials
        this.river_speed = this.ability.GetSpecialValueFor("river_speed");

        // Scepter effects
        this.puddle_regen = this.ability.GetSpecialValueFor("puddle_regen");
        this.puddle_armor = this.ability.GetSpecialValueFor("puddle_armor");
        this.puddle_status_resistance = this.ability.GetSpecialValueFor("puddle_status_resistance");

        // Reimagined specials
        this.watery_comfort_interval = this.ability.GetSpecialValueFor("watery_comfort_interval");
        this.watery_comfort_cd_redcution = this.ability.GetSpecialValueFor("watery_comfort_cd_redcution");
        this.watery_comfort_river_bonus_linger = this.ability.GetSpecialValueFor("watery_comfort_river_bonus_linger");
    }

    OnRefresh()
    {
        this.GetAbilitySpecialValues();
    }

    OnIntervalThink(): void
    {
        // Check if we're in a river for this tick
        const currently_in_river = IsInRiver(this.parent);

        // If there is a mismatch, the state has changed - need to check which state we're currently in
        if (this.currently_in_river != currently_in_river)
        {
            // Adjust the the current tick to match
            this.currently_in_river = currently_in_river;

            if (this.currently_in_river)
            {
                // We got into the river!
                this.OnEnteredRiver();
            }
            else
            {
                // We left the river!
                this.OnLeftRiver();
            }
        }

        // Reimagined: Watery Comfort: Passively reduces the cooldown of Guardian Sprint by x every y seconds Slardar is in the river. River bonuses linger for y seconds after leaving the river.
        this.ReimaginedWaterComfort();
    }

    ReimaginedWaterComfort()
    {
        // Accumulate time in river, or reset if modifier is inactive
        if (this.GetStackCount() == 0)
        {
            this.time_accumulated_in_river += this.river_think_interval!;

            // Check if accumlated enough time
            if (this.time_accumulated_in_river >= this.watery_comfort_interval!)
            {
                this.time_accumulated_in_river = 0;

                // Set the cooldown of the Guardian Sprint ability
                const current_cd = this.ability.GetCooldownTimeRemaining();
                this.ability.EndCooldown();
                if (current_cd > this.watery_comfort_cd_redcution!)
                {
                    this.ability.StartCooldown(current_cd - this.watery_comfort_cd_redcution!);
                }
            }
        }
        else
        {
            this.time_accumulated_in_river = 0;
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.HEALTH_REGEN_CONSTANT,
                ModifierFunction.PHYSICAL_ARMOR_BONUS,
                ModifierFunction.STATUS_RESISTANCE_STACKING,
                ModifierFunction.IGNORE_MOVESPEED_LIMIT]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        if (this.GetStackCount() == 0) return this.river_speed!;

        // Talent: Land Adaptation: Allows Slardar to benefit from x% of the river move speed bonuses and unlocks the move speed limit while Slardar is not on a considered standing on a river terrain.
        return this.ReimaginedTalentLandAdaptationMoveSpeed();

        // Use this if the talent above is removed
        //return 0;
    }

    ReimaginedTalentLandAdaptationMoveSpeed(): number
    {
        if (HasTalent(this.caster, SlardarTalents.SlardarTalent_2))
        {
            // Initialize variables
            if (!this.talent_2_movespeed_pct) this.talent_2_movespeed_pct = GetTalentSpecialValueFor(this.caster, SlardarTalents.SlardarTalent_2, "movespeed_pct");

            // Return movespeed bonus
            return this.talent_2_movespeed_pct * this.river_speed! * 0.01;
        }

        return 0;
    }

    GetModifierIgnoreMovespeedLimit(): 0 | 1
    {
        if (this.GetStackCount() == 0) return 1;

        // Talent: Land Adaptation: Allows Slardar to benefit from x% of the river move speed bonuses and unlocks the move speed limit while Slardar is not on a considered standing on a river terrain.
        if (this.ReimaginedTalentLandAdaptationLimitBreak()) return 1;

        return 0;
    }

    ReimaginedTalentLandAdaptationLimitBreak(): boolean
    {
        if (HasTalent(this.caster, SlardarTalents.SlardarTalent_2))
        {
            return true;
        }

        return false;
    }

    GetModifierConstantHealthRegen(): number
    {
        if (this.caster.HasScepter() && this.GetStackCount() == 0) return this.puddle_regen!;

        return 0;
    }

    GetModifierPhysicalArmorBonus(): number
    {
        if (this.caster.HasScepter() && this.GetStackCount() == 0) return this.puddle_armor!;

        return 0;
    }

    GetModifierStatusResistanceStacking(): number
    {
        if (this.caster.HasScepter() && this.GetStackCount() == 0) return this.puddle_status_resistance!;

        return 0;
    }

    OnEnteredRiver(): void
    {
        // Change current status
        this.SetStackCount(0);

        // Activate river particle
        if (!this.particle_river_fx)
        {
            this.particle_river_fx = ParticleManager.CreateParticle(this.particle_river, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
            ParticleManager.SetParticleControl(this.particle_river_fx, 0, this.parent.GetAbsOrigin());
            ParticleManager.SetParticleControl(this.particle_river_fx, 1, Vector(1,0,0))
        }

        // Reimagined: Watery Comfort: Passively reduces the cooldown of Guardian Sprint by x every y seconds Slardar is in the river. River bonuses linger for y seconds after leaving the river.
        this.ReimaginedWaterComfortTimerReset();
    }

    ReimaginedWaterComfortTimerReset()
    {
        // If we currently have a lingering timer, remove the timer
        if (this.water_comfort_timer)
        {
            Timers.RemoveTimer(this.water_comfort_timer);

            this.water_comfort_timer = undefined;

            // Reset the duration
            this.SetDuration(-1, true);
        }
    }

    OnLeftRiver(): void
    {
        if (this.water_comfort_timer) return;

        // Reimagined: Watery Comfort: Passively reduces the cooldown of Guardian Sprint by x every y seconds Slardar is in the river. River bonuses linger for y seconds after leaving the river.
        if (this.ReimaginedWaterComfortTimer()) return;

        // This will always be unreachable as long as the Watery Comfort Reimagination is active, and is used to quickly return to vanilla state if necessary by commenting or removing the above Reimagination code.
        this.SetStackCount(1)
    }

    ReimaginedWaterComfortTimer(): boolean
    {
        // Set the duration to start counting down
        this.SetDuration(this.watery_comfort_river_bonus_linger!, true);

        // Start a timer for lingering duration
        this.water_comfort_timer = Timers.CreateTimer(this.watery_comfort_river_bonus_linger!, () =>
        {
            // Set the status to inactive
            this.SetStackCount(1);

            // Reset the duration
            this.SetDuration(-1, true);

            this.water_comfort_timer = undefined;

            // Remove the river particle, if relevant
            if (this.particle_river_fx)
            {
                ParticleManager.DestroyParticle(this.particle_river_fx, false);
                ParticleManager.ReleaseParticleIndex(this.particle_river_fx);

                this.particle_river_fx = undefined;
            }
        })

        // Always return true: this is done to stop the vanilla behavior from taking effect.
        return true;
    }
}
