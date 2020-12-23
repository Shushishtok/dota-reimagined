import { BristlebackTalents } from "../../../abilities/heroes/bristleback/reimagined_bristleback_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetIllusionOwner, GetTalentSpecialValueFor, HasBit, HasTalent } from "../../../lib/util";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_talent_7_buff"

@registerModifier()
export class modifier_reimagined_bristleback_warpath_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    modifier_warpath_stacks: string = "modifier_reimagined_bristleback_warpath";
    modifier_simmer_down: string = "modifier_reimagined_bristleback_warpath_simmer_down";

    // Modifier specials
    stack_duration?: number;

    // Reimagined properties
    particle_anger_burst: string = "particles/heroes/bristleback/bristleback_warpath_anger_burst_trigger.vpcf";
    particle_anger_burst_fx?: ParticleID;

    // Reimagined specials
    anger_burst_damage_threshold?: number;
    anger_burst_reset_time?: number;
    tantrum_stack_duration?: number;

    // Reimagined talent properties
    talent_7_modifier = "modifier_reimagined_bristleback_talent_7_buff";

    // Reimagined talent specials
    talent_7_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}
    IsPermanent() {return true}
    DestroyOnExpire() {return false}

    OnCreated(): void
    {
        this.GetAbilitySpecials();

        if (!IsServer()) return;

        // Illusions immediately gain the same amount of Warpath stacks of their caster.
        if (this.parent.IsIllusion())
        {
            const illusion_owner = GetIllusionOwner(this.parent);
            if (illusion_owner)
            {
                if (illusion_owner.HasModifier(this.modifier_warpath_stacks))
                {
                    const modifier = illusion_owner.FindModifierByName(this.modifier_warpath_stacks);
                    if (modifier)
                    {
                        const stacks = modifier.GetStackCount();

                        // Technically it doesn't follow the caster's exact timings, but come on, nobody goes this far to check illusions this way, this isn't TeamLiquid shit
                        const illusion_modifier = this.parent.AddNewModifier(this.parent, this.ability, this.modifier_warpath_stacks, {duration: this.stack_duration});
                        illusion_modifier.SetStackCount(stacks);
                    }
                }
            }
        }
    }

    OnRefresh(): void
    {
        this.GetAbilitySpecials();
    }

    GetAbilitySpecials()
    {
        // Modifier specials
        this.stack_duration = this.ability.GetSpecialValueFor("stack_duration");

        // Reimagined specials
        this.anger_burst_damage_threshold = this.ability.GetSpecialValueFor("anger_burst_damage_threshold");
        this.anger_burst_reset_time = this.ability.GetSpecialValueFor("anger_burst_reset_time");
        this.tantrum_stack_duration = this.ability.GetSpecialValueFor("tantrum_stack_duration");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ABILITY_FULLY_CAST,

                // Reimagined: Anger Burst: When Bristleback accumulates over x damage after reductions, generates a Warpath stack. Resets after not taking any damage over y seconds.
                ModifierFunction.ON_TAKEDAMAGE,
                ModifierFunction.TOOLTIP]
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the caster is the parent, or, if it is an illusion, the caster is the one casting the ability
        if (!this.IsValidCasterForWarpath(event)) return;

        // Only apply if the ability wasn't an item
        if (event.ability.IsItem()) return;

        // Only apply if the parent's passives aren't disabled
        if (this.parent.PassivesDisabled()) return;

        // Reimagined: Simmer Down: Can be activated to consume all current Warpath stacks. Each stack consumed grants Bristleback damage resistance from the from all directions. While this buff is active, Warpath stacks cannot be generated.
        if (this.ReimaginedSimmerDownCheck()) return;

        this.AddWarpathStack();
    }

    AddWarpathStack(): void
    {
        // Add a stack to Warpath
        let modifier;
        if (!this.parent.HasModifier(this.modifier_warpath_stacks))
        {
            modifier = this.parent.AddNewModifier(this.parent, this.ability, this.modifier_warpath_stacks, {duration: this.stack_duration});
        }
        else
        {
            modifier = this.parent.FindModifierByName(this.modifier_warpath_stacks);
        }

        if (modifier)
        {
            modifier.IncrementStackCount();
        }
    }

    OnTakeDamage(event: ModifierAttackEvent): void
    {
        // Reimagined: Anger Burst: When Bristleback accumulates over x damage after reductions, generates a Warpath stack. Resets after not taking any damage over y seconds.
        this.ReimaginedAngerBurst(event);
    }

    OnTooltip(): number
    {
        return this.anger_burst_damage_threshold!;
    }

    ReimaginedAngerBurst(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the unit taking damage is the parent
        if (event.unit != this.parent) return;

        // Only apply if the damage is positive
        if (event.damage <= 0) return;

        // Only apply if the damage isn't a HP LOSS or a reflection
        if (HasBit(event.damage_flags, DamageFlag.HPLOSS || HasBit(event.damage_flags, DamageFlag.REFLECTION))) return;

        // Only apply if the parent's passives aren't disabled
        if (this.parent.PassivesDisabled()) return;

        // Only apply if the parent doesn't have Simmer Down's modifier
        if (this.parent.HasModifier(this.modifier_simmer_down)) return;

        // Only apply if the attackers aren't allies
        if (event.attacker.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Increase damage counter
        this.SetStackCount(this.GetStackCount() + event.damage);

        // Check if the accumulated damage is past the threshold
        if (this.GetStackCount() >= this.anger_burst_damage_threshold!)
        {
            // Grant a Warpath stack
            this.AddWarpathStack();

            // Reset the accumulated damage
            this.SetStackCount(this.GetStackCount() - this.anger_burst_damage_threshold!);

            // Play particle
            this.particle_anger_burst_fx = ParticleManager.CreateParticle(this.particle_anger_burst, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
            ParticleManager.SetParticleControl(this.particle_anger_burst_fx, 0, this.parent.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_anger_burst_fx);

            // Talent: Talent: Hot Temper: When Anger Burst procs, Bristleback also gains x attack speed for y seconds.
            this.ReimaginedTalentHotTemper();
        }

        // (Re)start the timer
        this.StartIntervalThink(this.anger_burst_reset_time!);

        if (this.GetDuration() != this.anger_burst_reset_time)
        {
            this.SetDuration(this.anger_burst_reset_time!, true);
        }

        this.ForceRefresh();
    }

    OnIntervalThink(): void
    {
        if (!IsServer()) return;

        // Reimagined: Anger Burst: When Bristleback accumulates over x damage after reductions, generates a Warpath stack. Resets after not taking any damage over y seconds.
        this.ReimaginedAngerBurstReset();
    }

    ReimaginedAngerBurstReset(): void
    {
        // Reset damage to 0
        this.SetStackCount(0);

        // Stop the timer
        this.StartIntervalThink(-1);
        this.SetDuration(-1, true);
    }

    IsValidCasterForWarpath(event: ModifierAbilityEvent): boolean
    {
        if (event.unit != this.parent)
        {
            // Check if the unit is an illusion
            if (this.parent.IsIllusion())
            {
                if (GetIllusionOwner(this.parent) && event.unit == GetIllusionOwner(this.parent))
                {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    ReimaginedSimmerDownCheck(): boolean
    {
        // If the caster has the Simmer Down modifier, do not grant Warpath stacks
        if (this.parent.HasModifier(this.modifier_simmer_down))
        {
            // Illusion check
            if (this.parent.IsIllusion())
            {
                const illusion_owner = GetIllusionOwner(this.parent);
                if (illusion_owner && illusion_owner.HasModifier(this.modifier_simmer_down))
                {
                    return true;
                }
            }

            // Return true: do not grant stacks
            return true;
        }

        return false;
    }

    ReimaginedTalentHotTemper()
    {
        if (!IsServer()) return;

        if (HasTalent(this.caster, BristlebackTalents.BristlebackTalent_7))
        {
            // Initialize variables
            if (!this.talent_7_duration) this.talent_7_duration = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_7, "duration");

            // Add the Hot Temper modifier
            this.caster.AddNewModifier(this.caster, this.ability, this.talent_7_modifier, {duration: this.talent_7_duration});
        }
    }
}
