import { BristlebackTalents } from "../../../abilities/heroes/bristleback/reimagined_bristleback_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_quill_spray_stacks extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_quill_stacks: string = "particles/units/heroes/hero_bristleback/bristleback_quill_spray_hit_creep.vpcf";
    particle_quill_stacks_fx_table: ParticleID[] = [];

    // Modifier specials
    quill_stack_duration?: number;
    quill_stack_damage?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.quill_stack_duration = this.ability.GetSpecialValueFor("quill_stack_duration");
        this.quill_stack_damage = this.ability.GetSpecialValueFor("quill_stack_damage");
    }

    OnStackCountChanged(previous_stacks: number): void
    {
        if (!IsServer()) return;

        // We only care about incrementals
        if (previous_stacks > this.GetStackCount()) return;

        // Get the amount of new stacks that we just got
        const new_stacks = this.GetStackCount() - previous_stacks;

        // Refresh the duration of the modifier
        this.ForceRefresh();

        // Add a quill particle for each stack added
        for (let index = 0; index < new_stacks; index++)
        {
            const particle_quill_stacks_fx = ParticleManager.CreateParticle(this.particle_quill_stacks, ParticleAttachment.POINT_FOLLOW, this.parent);
            ParticleManager.SetParticleControlEnt(particle_quill_stacks_fx, 0, this.parent, ParticleAttachment.POINT, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
            ParticleManager.SetParticleControlEnt(particle_quill_stacks_fx, 1, this.parent, ParticleAttachment.POINT, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
            ParticleManager.SetParticleControlEnt(particle_quill_stacks_fx, 60, this.parent, ParticleAttachment.POINT, AttachLocation.HITLOC, Vector(8, 229, 96), true);

            this.particle_quill_stacks_fx_table.push(particle_quill_stacks_fx);
        }

        // Talent: Drill Quills: Quill Spray's stacks no longer have an independent duration, and each stack added refreshes the entire modifier.
        if (this.ReimaginedTalentDrillQuills()) return

        // Add a new timer for those stack(s)
        Timers.CreateTimer(this.quill_stack_duration!, () =>
        {
            // Verify the caster, the parent, and the modifier still exist as valid entities
            if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
            {
                // Remove particle for each removed stack
                for (let index = 0; index < new_stacks; index++)
                {
                    const removed_particle = this.particle_quill_stacks_fx_table.shift();
                    if (removed_particle)
                    {
                        ParticleManager.DestroyParticle(removed_particle, false);
                        ParticleManager.ReleaseParticleIndex(removed_particle);
                    }
                }

                // Decrement stacks, or destroy modifier is there are no more stacks
                if (this.GetStackCount() == new_stacks)
                {
                    this.Destroy();
                }
                else
                {
                    this.SetStackCount(this.GetStackCount() - new_stacks);
                }
            }
        });
    }

    ReimaginedTalentDrillQuills(): boolean
    {
        return HasTalent(this.caster, BristlebackTalents.BristlebackTalent_4);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.quill_stack_damage! * this.GetStackCount();
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // Remove remaining particles on the table, if any
        for (let index = 0; index < this.particle_quill_stacks_fx_table.length; index++)
        {
            const particle_fx = this.particle_quill_stacks_fx_table[index];
            ParticleManager.DestroyParticle(particle_fx, false);
            ParticleManager.ReleaseParticleIndex(particle_fx);
        }
    }
}
