import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_quill_spray_stacks"
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_quill_spray_needle"
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_quill_spray_needle_spreader"
import { CalculateDistanceBetweenPoints, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_bristleback_bristleback_passive } from "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_bristleback_passive";
import { BristlebackTalents } from "./reimagined_bristleback_talents";

@registerAbility()
export class reimagined_bristleback_quill_spray extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Bristleback.QuillSpray.Cast";
    sound_hit: string = "Hero_Bristleback.QuillSpray.Target";
    kill_responses: string[] = ["bristleback_bristle_quill_spray_01", "bristleback_bristle_quill_spray_02", "bristleback_bristle_quill_spray_03", "bristleback_bristle_quill_spray_04", "bristleback_bristle_quill_spray_05", "bristleback_bristle_quill_spray_06"];
    particle_quills_projectile: string = "particles/heroes/bristleback/bristleback_quill_spray.vpcf";
    particle_quills_projectile_fx?: ParticleID;
    particle_impact: string = "particles/units/heroes/hero_bristleback/bristleback_quill_spray_impact.vpcf";
    particle_impact_fx?: ParticleID;
    enemies_hit_map: Map<number, Set<CDOTA_BaseNPC>> = new Map();
    modifier_quills_stacks: string = "modifier_reimagined_bristleback_quill_spray_stacks"

    // Ability specials
    radius?: number;
    quill_base_damage?: number;
    quill_stack_damage?: number;
    quill_stack_duration?: number;
    max_damage?: number;
    projectile_speed?: number;

    // Reimagined properties
    modifier_needle_state: string = "modifier_reimagined_bristleback_quill_spray_needle"
    modifier_needle_spreader: string = "modifier_reimagined_bristleback_quill_spray_needle_spreader"
    modifier_warpath: string = "modifier_reimagined_bristleback_warpath";
    modifier_bristleback: string = "modifier_reimagined_bristleback_bristleback_passive";

    // Reimagined specials
    needle_spreader_cooldown?: number;
    needle_spreader_manacost?: number;
    needle_spreader_total_instances?: number;
    needle_spreader_interval?: number;
    spiked_edge_distance?: number;
    spiked_edge_damage_bonus_pct?: number;
    raging_quills_warpath_stacks?: number;
    raging_quills_radius_multiplier?: number;
    raging_quills_projectile_speed_bonus_pct?: number;

    // Reimagind talent properties
    talent_3_projectile: string = "particles/heroes/bristleback/bristleback_quillgun_projectile.vpcf";

    // Reimagined talent specials
    talent_3_additional_quills?: number;
    talent_3_quill_interval?: number

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/bristleback/bristleback_quill_spray.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_quill_spray_impact.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_quill_spray_hit_creep.vpcf", context);
    }

    GetIntrinsicModifierName()
    {
        // Needed for Needle Spreader Reimagination, since you can't check Autocast state on the client.
        return this.modifier_needle_state;
    }

    GetManaCost(level: number): number
    {
        // Changes based on auto cast state, which is reflected by the stacks count of the Needle Spreader hidden modifier
        if (this.caster.HasModifier(this.modifier_needle_state))
        {
            // Stacks set at 1 means the ability is in Autocast state
            const state = this.caster.GetModifierStackCount(this.modifier_needle_state, this.caster);
            if (state == 1)
            {
                return this.GetSpecialValueFor("needle_spreader_manacost");
            }
        }

        return super.GetManaCost(level);
    }

    GetCooldown(level: number): number
    {
        // Changes based on auto cast state, which is reflected by the stacks count of the Needle Spreader hidden modifier
        if (this.caster.HasModifier(this.modifier_needle_state))
        {
            // Stacks set at 1 means the ability is in Autocast state
            const state = this.caster.GetModifierStackCount(this.modifier_needle_state, this.caster);
            if (state == 1)
            {
                return this.GetSpecialValueFor("needle_spreader_cooldown");
            }
        }

        return super.GetCooldown(level);
    }

    OnUpgrade(): void
    {
        // Ability specials
        this.radius = this.GetSpecialValueFor("radius");
        this.quill_base_damage = this.GetSpecialValueFor("quill_base_damage");
        this.quill_stack_damage = this.GetSpecialValueFor("quill_stack_damage");
        this.quill_stack_duration = this.GetSpecialValueFor("quill_stack_duration");
        this.max_damage = this.GetSpecialValueFor("max_damage");
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed");

        // Reimagined specials
        this.needle_spreader_total_instances = this.GetSpecialValueFor("needle_spreader_total_instances");
        this.needle_spreader_interval = this.GetSpecialValueFor("needle_spreader_interval");
        this.spiked_edge_distance = this.GetSpecialValueFor("spiked_edge_distance");
        this.spiked_edge_damage_bonus_pct = this.GetSpecialValueFor("spiked_edge_damage_bonus_pct");
        this.raging_quills_warpath_stacks = this.GetSpecialValueFor("raging_quills_warpath_stacks");
        this.raging_quills_radius_multiplier = this.GetSpecialValueFor("raging_quills_radius_multiplier");
        this.raging_quills_projectile_speed_bonus_pct = this.GetSpecialValueFor("raging_quills_projectile_speed_bonus_pct");
    }

    OnSpellStart(): void
    {
        // Fire a spray
        this.FireQuillSpray(this.caster);

        // Reimagined: Needle Spreader: Can be set to auto cast. When cast with auto cast on, Bristleback continually spraying quills around it for a few seconds. Has higher cooldown and mana cost.
        this.ReimaginedNeedleSpreader();
    }

    ReimaginedNeedleSpreader()
    {
        // Only apply if the spell is cast in autocast state
        if (!this.GetAutoCastState()) return;

        // Calculate duration
        const duration = this.needle_spreader_interval! * (this.needle_spreader_total_instances! - 1);

        // Add modifier
        this.caster.AddNewModifier(this.caster, this, this.modifier_needle_spreader, {duration: duration});
    }

    FireQuillSpray(source: CDOTA_BaseNPC, forced_radius?: number)
    {
        // Get caster's current position on cast
        const source_pos = source.GetAbsOrigin();

        // Play cast sound
        source.EmitSound(this.sound_cast);

        // Reimagined: Raging Quills: If Bristleback has at least x stacks of Warpath, Quill Spray's radius is multiplied by y, and the projectile speed increases by z%.
        let projectile_speed = this.projectile_speed!;
        projectile_speed = this.ReimaginedRagingQuillsProjectileSpeed(projectile_speed);
        let radius = this.radius!;
        radius = this.ReimaginedRagingQuillsRadiusMultiplier(radius);

        if (forced_radius)
        {
            radius = forced_radius;
        }

        let times = 0;
        // Create quills particle
        this.particle_quills_projectile_fx = ParticleManager.CreateParticle(this.particle_quills_projectile, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_quills_projectile_fx, 0, source_pos);
        ParticleManager.SetParticleControl(this.particle_quills_projectile_fx, 1, Vector(projectile_speed * 0.85, projectile_speed, 0)); // Custom particle: made min/max speed assigned to CP1X/Y
        ParticleManager.ReleaseParticleIndex(this.particle_quills_projectile_fx);
        times++;

        let current_radius = 0;
        let played_cast_response = false;
        let current_gametime: number = GameRules.GetGameTime();

        // Create a new set of enemies for this cast
        this.enemies_hit_map.set(current_gametime, new Set());

        // Create a frame time timer
        Timers.CreateTimer(FrameTime(), () =>
        {
            // Every frame, increase radius by speed * FrameTime() until reaching the max radius
            current_radius = math.min(current_radius + projectile_speed! * FrameTime(), radius);

            // Find all enemies in range, including magic immune enemies, based on the caster's position on cast
            let enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                              source_pos,
                                              undefined,
                                              current_radius,
                                              UnitTargetTeam.ENEMY,
                                              UnitTargetType.HERO + UnitTargetType.BASIC,
                                              UnitTargetFlags.MAGIC_IMMUNE_ENEMIES,
                                              FindOrder.ANY,
                                              false);

            // Filter out enemies that were already hit by this cast
            enemies = enemies.filter(enemy =>
            {
                if (this.enemies_hit_map.has(current_gametime))
                {
                    return !this.enemies_hit_map.get(current_gametime)!.has(enemy);
                }

                return false;
            })

            for (const enemy of enemies)
            {
                // Deal damage to enemy
                const actual_damage = this.DealQuillDamageToEnemy(enemy, source_pos);

                // Reimagined: Prickly Sensations: Every Quill Spray cast also adds 10% of all damage done to the next Quill Spray trigger threshold counter.
                this.ReimaginedPricklySensations(actual_damage);

                // Add enemy to this timer's map's set
                if (this.enemies_hit_map.has(current_gametime))
                {
                    this.enemies_hit_map.get(current_gametime)!.add(enemy);
                }

                // If enemy died and the kill response was not played, play a random kill response
                if (!played_cast_response)
                {
                    if (!enemy.IsAlive())
                    {
                        this.caster.EmitSound(this.kill_responses[RandomInt(0, this.kill_responses.length - 1)]);
                    }

                    // Tag random kill response for this cast
                    played_cast_response = true;
                }

                // If enemy is still alive, add quill spray stack modifier
                if (enemy.IsAlive())
                {
                    const modifier = enemy.AddNewModifier(this.caster, this, this.modifier_quills_stacks, {duration: this.quill_stack_duration!});
                    if (modifier)
                    {
                        modifier.IncrementStackCount();
                    }
                }
            }

            // Timer: Repeat until max radius was calculated
            if (current_radius < radius)
            {
                return FrameTime();
            }
            else
            {
                // If max radius was achieved, remove instance from the map
                if (this.enemies_hit_map.has(current_gametime))
                {
                    // Talent: Quillgun: When there is only one enemy in the cast range, fires additional x tracking quills at that enemy. Those quills do not increase the debuff's stack count, but do bonus damage based on it.
                    this.ReimaginedTalentQuillGun(this.enemies_hit_map.get(current_gametime)!, source);

                    this.enemies_hit_map.delete(current_gametime);
                }

                // Stop iterating this timer
                return undefined;
            }
        });
    }

    DealQuillDamageToEnemy(enemy: CDOTA_BaseNPC, caster_pos: Vector): number
    {
        // Play particle effect
        this.particle_impact_fx = ParticleManager.CreateParticle(this.particle_impact, ParticleAttachment.POINT_FOLLOW, enemy);
        ParticleManager.SetParticleControlEnt(this.particle_impact_fx, 1, enemy, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, enemy.GetAbsOrigin(), true);
        ParticleManager.ReleaseParticleIndex(this.particle_impact_fx);

        // Calculate damage based on their Quill Spray stacks
        let damage = this.quill_base_damage!;
        if (enemy.HasModifier(this.modifier_quills_stacks))
        {
            damage += enemy.GetModifierStackCount(this.modifier_quills_stacks, this.caster) * this.quill_stack_damage!;
        }

        // Reimagined: Spiked Edge: If an enemy is closer than x units to Bristleback, the damage dealt to it increases by y%.
        damage = this.ReimaginedSpikedEdge(damage, enemy, caster_pos);

        // Damage has a cap
        damage = math.min(damage, this.max_damage!);

        // Deal damage to enemy
        const actual_damage = ApplyDamage(
        {
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            victim: enemy,
            ability: this,
            damage_flags: DamageFlag.BYPASSES_BLOCK
        });

        return actual_damage
    }

    ReimaginedSpikedEdge(damage: number, enemy: CDOTA_BaseNPC, caster_pos: Vector): number
    {
        // Calculate distance
        const distance = CalculateDistanceBetweenPoints(caster_pos, enemy.GetAbsOrigin());
        if (distance <= this.spiked_edge_distance!)
        {
            damage = damage * (1 + this.spiked_edge_damage_bonus_pct! * 0.01);
        }

        return damage;
    }

    ReimaginedRagingQuillsProjectileSpeed(projectile_speed: number): number
    {
        if (this.caster.HasModifier(this.modifier_warpath))
        {
            if (this.caster.GetModifierStackCount(this.modifier_warpath, this.caster) >= this.raging_quills_warpath_stacks!)
            {
                projectile_speed = projectile_speed * (1 + this.raging_quills_projectile_speed_bonus_pct! * 0.01);
            }
        }

        return projectile_speed;
    }

    ReimaginedRagingQuillsRadiusMultiplier(radius: number): number
    {
        if (this.caster.HasModifier(this.modifier_warpath))
        {
            if (this.caster.GetModifierStackCount(this.modifier_warpath, this.caster) >= this.raging_quills_warpath_stacks!)
            {
                radius = radius * this.raging_quills_radius_multiplier!;
            }
        }

        return radius;
    }

    ReimaginedPricklySensations(actual_damage: number): void
    {
        // Only apply if the caster has the Bristleback ability
        if (this.caster.HasModifier(this.modifier_bristleback))
        {
            const modifier = this.caster.FindModifierByName(this.modifier_bristleback) as modifier_reimagined_bristleback_bristleback_passive;
            if (modifier)
            {
                modifier.ReimaginedPricklySensations(actual_damage);
            }
        }
    }

    ReimaginedTalentQuillGun(enemies_set: Set<CDOTA_BaseNPC>, source: CDOTA_BaseNPC)
    {
        if (HasTalent(this.caster, BristlebackTalents.BristlebackTalent_3))
        {
            // Initialize variables
            if (!this.talent_3_additional_quills) this.talent_3_additional_quills = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_3, "additional_quills");
            if (!this.talent_3_quill_interval) this.talent_3_quill_interval = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_3, "quill_interval");

            // Only apply if the set only has one enemy
            if (enemies_set.size != 1) return;

            // Only applies if the source is the caster
            if (source != this.caster) return;

            // Get the target
            const enemy: CDOTA_BaseNPC = enemies_set.values().next().value;
            let quills_fired = 0;

            Timers.CreateTimer(this.talent_3_quill_interval!, () =>
            {
                // Play fire sound
                this.caster.EmitSoundParams(this.sound_cast, 0, 0.5, 0);

                ProjectileManager.CreateTrackingProjectile
                (
                    {
                        Ability: this,
                        EffectName: this.talent_3_projectile,
                        Source: this.caster,
                        Target: enemy,
                        bDodgeable: true,
                        bProvidesVision: false,
                        iMoveSpeed: this.projectile_speed!,
                        vSourceLoc: RandomVector(source.GetHullRadius()),
                        iSourceAttachment: ProjectileAttachment.HITLOCATION
                    }
                )

                quills_fired++;
                if (quills_fired < this.talent_3_additional_quills!)
                {
                    return this.talent_3_quill_interval!;
                }
            })
        }
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector)
    {
        if (!target) return;

        target.EmitSoundParams(this.sound_hit, 0 , 0.5, 0);

        // Deal damage
        this.DealQuillDamageToEnemy(target, this.caster.GetAbsOrigin());
    }
}
