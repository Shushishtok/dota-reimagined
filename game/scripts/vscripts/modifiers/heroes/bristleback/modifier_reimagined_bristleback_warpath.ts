import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetIllusions } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_warpath extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_warpath: string = "particles/units/heroes/hero_bristleback/bristleback_warpath.vpcf";
    particle_warpath_fx_table: ParticleID[] = [];
    particle_warpath_dust: string = "particles/units/heroes/hero_bristleback/bristleback_warpath_dust.vpcf";
    last_stack_time: number = 0;

    // Modifier specials
    damage_per_stack?: number;
    move_speed_per_stack?: number;
    stack_duration?: number;
    max_stacks?: number;

    // Reimagined specials
    simmer_down_damage_resistance_bonus_per_stack?: number;
    tantrum_stack_duration?: number;
    tantrum_stack_bonuses_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.damage_per_stack = this.ability.GetSpecialValueFor("damage_per_stack");
        this.move_speed_per_stack = this.ability.GetSpecialValueFor("move_speed_per_stack");
        this.stack_duration = this.ability.GetSpecialValueFor("stack_duration");
        this.max_stacks = this.ability.GetSpecialValueFor("max_stacks");

        // Reimagined specials
        this.simmer_down_damage_resistance_bonus_per_stack = this.ability.GetSpecialValueFor("simmer_down_damage_resistance_bonus_per_stack");
        this.tantrum_stack_duration = this.ability.GetSpecialValueFor("tantrum_stack_duration");
        this.tantrum_stack_bonuses_pct = this.ability.GetSpecialValueFor("tantrum_stack_bonuses_pct");
    }

    OnStackCountChanged(previous_stacks: number): void
    {
        if (!IsServer()) return;

        // We only care about incrementals
        if (previous_stacks > this.GetStackCount()) return;

        // Add particle for the new stack
        const particle_warpath_fx = ParticleManager.CreateParticle(this.particle_warpath, ParticleAttachment.POINT_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(particle_warpath_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControlEnt(particle_warpath_fx, 3, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.ATTACK1, this.parent.GetAbsOrigin(), true);
        ParticleManager.SetParticleControlEnt(particle_warpath_fx, 4, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.ATTACK2, this.parent.GetAbsOrigin(), true);

        // Insert into particle array
        this.particle_warpath_fx_table.push(particle_warpath_fx);

        // Reimagined: Tantrum: Warpath stack count can keep increasing above the maximum limit. However, those additional stacks only last for x seconds and only generate x% of the bonuses.
        let stack_duration = this.stack_duration!;
        stack_duration = this.ReimaginedTantrum(stack_duration, false);

        // Add a new timer for those stack(s)
        Timers.CreateTimer(stack_duration, () =>
        {
            // Verify the caster, the parent, and the modifier still exist as valid entities
            if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
            {
                // Remove particles of removed stacks
                const particle_fx = this.particle_warpath_fx_table.shift();
                if (particle_fx)
                {
                    ParticleManager.DestroyParticle(particle_fx, false);
                    ParticleManager.ReleaseParticleIndex(particle_fx);
                }

                // Decrement stacks, or destroy modifier is there are no more stacks
                if (this.GetStackCount() == 1)
                {
                    if (!this.parent.IsIllusion())
                    {
                        // Destroy similar modifiers on illusions, if any
                        let illusions = GetIllusions(this.parent)
                        if (illusions && illusions.length > 0)
                        {
                            illusions = illusions.filter(illusion => illusion.HasModifier(this.GetName()))
                            for (const illusion of illusions)
                            {
                                const modifier = illusion.FindModifierByName(this.GetName());
                                if (modifier)
                                {
                                    modifier.Destroy();
                                }
                            }
                        }
                    }

                    this.Destroy();
                }
                else
                {
                    this.SetStackCount(this.GetStackCount() - 1);
                }
            }
        });
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PREATTACK_BONUS_DAMAGE,
                ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.MODEL_SCALE]
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        // Standard bonus
        if (this.GetStackCount() <= this.max_stacks!)
        {
            return this.damage_per_stack! * this.GetStackCount();
        }
        else
        {
            // Reimagined: Tantrum: Warpath stack count can keep increasing above the maximum limit. However, those additional stacks only last for x seconds and only generate x% of the bonuses.
            return this.ReimaginedTantrumBonusDamage();
        }
    }

    ReimaginedTantrumBonusDamage(): number
    {
        const standard_bonus = this.damage_per_stack! * this.max_stacks!;
        const tantrum_bonus = this.damage_per_stack! * this.tantrum_stack_bonuses_pct! * 0.01 * (this.GetStackCount() - this.max_stacks!);
        return standard_bonus + tantrum_bonus;
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        if (this.GetStackCount() <= this.max_stacks!)
        {
            return this.move_speed_per_stack! * this.GetStackCount();
        }
        else
        {
            // Reimagined: Tantrum: Warpath stack count can keep increasing above the maximum limit. However, those additional stacks only last for x seconds and only generate x% of the bonuses.
            return this.ReimaginedTantrumMoveSpeedBonus();
        }
    }

    ReimaginedTantrumMoveSpeedBonus(): number
    {
        const standard_bonus = this.move_speed_per_stack! * this.max_stacks!;
        const tantrum_bonus = this.move_speed_per_stack! * this.tantrum_stack_bonuses_pct! * 0.01 * (this.GetStackCount() - this.max_stacks!);
        return standard_bonus + tantrum_bonus;
    }

    GetModifierModelScale(): number
    {
        return this.GetStackCount() * 5;
    }

    GetEffectName(): string
    {
        return this.particle_warpath_dust;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // If there are any particles that still need to be cleaned, clean them out
        if (this.particle_warpath_fx_table.length > 0)
        {
            for (const particle_fx of this.particle_warpath_fx_table)
            {
                ParticleManager.DestroyParticle(particle_fx, false);
                ParticleManager.ReleaseParticleIndex(particle_fx);
            }
        }
    }

    ReimaginedTantrum(stack_duration: number, forced_tantrum: boolean): number
    {
        // If stack count is above the maximum, or it is the forced tantrum stack
        if (this.GetStackCount() > this.max_stacks! || forced_tantrum)
        {
            stack_duration = this.tantrum_stack_duration!;
        }

        // Assign the last stack time, used to make the modifier always show the correct duration of the longest lasting stack
        if (this.last_stack_time == 0) this.last_stack_time = stack_duration;
        else
        {
            if (this.last_stack_time < stack_duration)
            {
                this.last_stack_time = stack_duration;
                this.SetDuration(stack_duration, true);

                // Refresh the duration of the modifier
                this.ForceRefresh();
            }
        }

        // Count down how much time elapsed since the last stack was updated.
        this.StartIntervalThink(0.1);

        return stack_duration;
    }

    // This is only necessary for the Tantrum reimagination
    OnIntervalThink(): void
    {
        if (this.last_stack_time <= 0) return;
        this.last_stack_time -= 0.1;
    }
}
