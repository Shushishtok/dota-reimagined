import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit } from "../../../../lib/util";
import "./modifier_reimagined_broodmother_spiderling_poison_sting_debuff"

@registerModifier()
export class modifier_reimagined_broodmother_spiderling_poison_sting_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_volatile_spiderling: string = "Hero_Snapfire.MortimerBlob.Impact";
    sound_death: string = "Hero_Broodmother.SpawnSpiderlingsDeath";
    particle_volatile_spiderling: string = "particles/heroes/broodmother/broodmother_spiderling_volatile_spiderling.vpcf";
    particle_volatile_spiderling_fx?: ParticleID;
    modifier_poison_sting_debuff = "modifier_reimagined_broodmother_spiderling_poison_sting_debuff";

    // Modifier specials
    duration_hero?: number;
    duration?: number;

    // Reimagined specials
    volatile_spiderling_damage?: number;
    volatile_spiderling_radius?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.duration_hero = this.ability.GetSpecialValueFor("duration_hero");
        this.duration = this.ability.GetSpecialValueFor("duration");

        // Reimagined specials
        this.volatile_spiderling_damage = this.ability.GetSpecialValueFor("volatile_spiderling_damage");
        this.volatile_spiderling_radius = this.ability.GetSpecialValueFor("volatile_spiderling_radius");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.ON_DEATH]
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the parent is the attacker
        if (event.attacker != this.parent) return;

        // Ignore buildings
        if (event.target.IsBuilding()) return;

        // Decide duration
        let duration;
        if (event.target.IsHero())
        {
            duration = this.duration_hero!;
        }
        else
        {
            duration = this.duration!;
        }

        // Apply poison on the target
        const modifier = event.target.AddNewModifier(this.caster, this.ability, this.modifier_poison_sting_debuff, {duration: duration});

        // Reimagined: Ticking Poison: Poison Sting accumulates stacks each time a Spiderling attacks the target. Upon reaching x stacks, the stacks are consumed, and the target takes y magical damage.
        this.ReimaginedTickingPoison(modifier);
    }

    ReimaginedTickingPoison(modifier: CDOTA_Buff)
    {
        if (!modifier) return;

        // Accumulate a stack
        modifier.IncrementStackCount();
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Reimagined: Volatile Spiderlings: Spiderlings explode on death, dealing 60 damage in 300 AoE around them. Enemies in range are afflicted with the Spiderling's poison (or add one stack of it, if they already have it).
        this.ReimaginedVolatileSpiderlings(event);

        // Only apply if the dead unit is the parent
        if (event.unit != this.parent) return;

        // Play death sound
        EmitSoundOn(this.sound_death, this.parent);
    }

    ReimaginedVolatileSpiderlings(event: ModifierAttackEvent): void
    {
        // Only apply if the dead unit is the parent
        if (event.unit! != this.parent) return;

        // Only apply if it was not killed by its kill timer expiring
        if (event.attacker == event.unit!) return;

        // Play explosion sound
        this.parent.EmitSoundParams(this.sound_volatile_spiderling, 0, 0.5, 0);

        // Create explosion particle
        this.particle_volatile_spiderling_fx = ParticleManager.CreateParticle(this.particle_volatile_spiderling, ParticleAttachment.ABSORIGIN, this.parent);
        ParticleManager.SetParticleControl(this.particle_volatile_spiderling_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_volatile_spiderling_fx);

        // Find all enemies in radius
        const enemies = FindUnitsAroundUnit(this.parent,
                                            this.parent,
                                            this.volatile_spiderling_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO + UnitTargetType.BASIC,
                                            UnitTargetFlags.NONE);

        for (const enemy of enemies)
        {
            // Deal damage to each enemy
            ApplyDamage(
            {
                attacker: this.caster,
                damage: this.volatile_spiderling_damage!,
                damage_type: this.ability.GetAbilityDamageType(),
                victim: enemy,
                ability: this.ability,
                damage_flags: DamageFlag.NONE
            });

            // Decide duration
            let duration;
            if (enemy.IsHero())
            {
                duration = this.duration_hero!;
            }
            else
            {
                duration = this.duration!;
            }

            // Apply a stack of Poison Sting to them
            const modifier = enemy.AddNewModifier(this.caster, this.ability, this.modifier_poison_sting_debuff, {duration: duration});

            // Reimagined: Ticking Poison: Poison Sting accumulates stacks each time a Spiderling attacks the target. Upon reaching x stacks, the stacks are consumed, and the target takes y magical damage.
            this.ReimaginedTickingPoison(modifier);
        }
    }
}
