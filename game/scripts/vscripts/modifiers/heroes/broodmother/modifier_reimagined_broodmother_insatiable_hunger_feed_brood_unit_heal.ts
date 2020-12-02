import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_insatiable_hunger_feed_brood_unit_heal extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_heal: string = "particles/heroes/broodmother/broodmother_insatiable_hunger_feed_brood_heal.vpcf";

    // Modifier specials
    feed_brood_heal_per_second?: number;
    feed_brood_heal_interval?: number;
    feed_brood_heal_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.feed_brood_heal_per_second = this.ability.GetSpecialValueFor("feed_brood_heal_per_second");
        this.feed_brood_heal_interval = this.ability.GetSpecialValueFor("feed_brood_heal_interval");
        this.feed_brood_heal_duration = this.ability.GetSpecialValueFor("feed_brood_heal_duration");

        if (!IsServer()) return;
        this.StartIntervalThink(this.feed_brood_heal_interval);
    }

    OnIntervalThink(): void
    {
        // Calculate heal for this instance
        let heal = this.feed_brood_heal_per_second! * this.feed_brood_heal_interval! * this.GetStackCount();

        // Heal the target
        this.parent.Heal(heal, this.ability);
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

        // Add a new timer for those stack(s)
        Timers.CreateTimer(this.feed_brood_heal_duration!, () =>
        {
            // Verify the caster, the parent, and the modifier still exist as valid entities
            if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
            {
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

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.feed_brood_heal_per_second! * this.GetStackCount();
    }

    GetEffectName(): string
    {
        return this.particle_heal;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
