import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_drow_ranger_hypothermia extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_counter_stacks: string = "particles/units/heroes/hero_drow/drow_hypothermia_counter_stack.vpcf";
    particle_counter_stacks_fx?: ParticleID
    particle_death: string = "particles/units/heroes/hero_drow/drow_shard_hypothermia_death.vpcf";
    particle_death_fx?: ParticleID;
    projectile_hypothermia: string = "particles/units/heroes/hero_drow/drow_shard_hypothermia_projectile.vpcf";
    last_known_stacks: number = 0;

    // Modifier specials
    shard_health_regen_reduction_stack?: number;
    shard_burst_damage_radius?: number;
    shard_burst_projectile_speed?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}
    ShouldUseOverheadOffset() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.shard_health_regen_reduction_stack = this.ability.GetSpecialValueFor("shard_health_regen_reduction_stack");
        this.shard_burst_damage_radius = this.ability.GetSpecialValueFor("shard_burst_damage_radius");
        this.shard_burst_projectile_speed = this.ability.GetSpecialValueFor("shard_burst_projectile_speed");

        // Create debuff particle
        this.particle_counter_stacks_fx = ParticleManager.CreateParticle(this.particle_counter_stacks, ParticleAttachment.OVERHEAD_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_counter_stacks_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_counter_stacks_fx, 1, Vector(0, this.GetStackCount(), 0));
        ParticleManager.SetParticleControl(this.particle_counter_stacks_fx, 3, this.parent.GetAbsOrigin());
        this.AddParticle(this.particle_counter_stacks_fx, false, false, -1, false, true);
    }

    OnStackCountChanged()
    {
        // Update the particle to show the correct number of stacks
        if (this.particle_counter_stacks_fx)
        {
            ParticleManager.SetParticleControl(this.particle_counter_stacks_fx!, 1, Vector(0, this.GetStackCount(), 0));
        }

        this.last_known_stacks = this.GetStackCount();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.HEALTH_REGEN_PERCENTAGE,
                ModifierFunction.ON_DEATH,
                ModifierFunction.TOOLTIP]
    }

    GetModifierHealthRegenPercentage(): number
    {
        return this.shard_health_regen_reduction_stack! * this.GetStackCount() * 0.01 * (-1);
    }

    OnTooltip(): number
    {
        return this.shard_health_regen_reduction_stack! * this.GetStackCount();
    }

    OnDeath(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Only apply when the parent is the unit that died
        if (event.unit != this.parent) return;

        // Play particle effect
        this.particle_death_fx = ParticleManager.CreateParticle(this.particle_death, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_death_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_death_fx, 3, this.parent.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_death_fx);

        // Find nearby enemies
        const enemies = FindUnitsAroundUnit(this.caster,
                                            this.parent,
                                            this.shard_burst_damage_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO + UnitTargetType.BASIC,
                                            UnitTargetFlags.NONE);

        // Fire projectiles into enemies in range
        for (const enemy of enemies)
        {
            ProjectileManager.CreateTrackingProjectile(
            {
                Ability: this.ability,
                EffectName: this.projectile_hypothermia,
                Source: this.parent,
                Target: enemy,
                bDodgeable: true,
                bProvidesVision: false,
                bVisibleToEnemies: true,
                iMoveSpeed: this.shard_burst_projectile_speed,
                iSourceAttachment: ProjectileAttachment.HITLOCATION,
                vSourceLoc: this.parent.GetAbsOrigin(),
                ExtraData: {stacks: this.last_known_stacks}
            });
        }
    }
}
