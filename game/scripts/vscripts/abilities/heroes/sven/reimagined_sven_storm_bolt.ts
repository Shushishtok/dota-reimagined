import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagind_sven_storm_hammer_scepter } from "../../../modifiers/heroes/sven/modifier_reimagind_sven_storm_hammer_scepter"

interface StormBoltProjectile
{    
    momentum_punch_current_location: Vector;
    momentum_punch_total_distance: number;
    tracking_projectile: boolean;
    hit_targets: Set<CDOTA_BaseNPC>;
    main_target: CDOTA_BaseNPC | undefined;
}

interface GatlingGunProjectile
{
    tracking_projectile: boolean;
    hit_targets: Set<CDOTA_BaseNPC>;
}

@registerAbility()
export class reimagined_sven_storm_bolt extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Sven.StormBolt";
    sound_impact: string = "Hero_Sven.StormBoltImpact";
    cast_responses: string[] = ["sven_sven_ability_stormbolt_01", // 50% chance on cast
                                "sven_sven_ability_stormbolt_02",
                                "sven_sven_ability_stormbolt_03",
                                "sven_sven_ability_stormbolt_04",
                                "sven_sven_ability_stormbolt_05",
                                "sven_sven_ability_stormbolt_06",
                                "sven_sven_ability_stormbolt_07",
                                "sven_sven_ability_stormbolt_08",
                                "sven_sven_ability_stormbolt_09"]; 
    impact_responses: string[] = ["sven_sven_ability_teleport_01", // 20% chance on impact, interrupting a teleport
                                  "sven_sven_ability_teleport_02",
                                  "sven_sven_ability_teleport_03"];                               
    particle_bolt: string = "particles/units/heroes/hero_sven/sven_spell_storm_bolt.vpcf";    
    particle_momentum_explosion: string = "particles/heroes/sven/storm_hammer_momentum_punch_explosion.vpcf";
    particle_momentum_explosion_fx?: ParticleID;
    particle_strong_right: string = "particles/heroes/sven/storm_hammer_strong_right.vpcf";
    particle_strong_right_fx?: ParticleID;
    particle_gatling_gun: string = "particles/heroes/sven/storm_hammer_gatling_gun.vpcf";

    // Ability specials
    bolt_speed?: number;
    bolt_stun_duration?: number;
    bolt_aoe?: number;
    vision_radius?: number;
    cast_range_bonus_scepter?: number;

    // Reimagined specials
    strong_right_damage?: number;
    strong_right_radius?: number;
    gatling_gun_count?: number;    
    gatling_gun_behind_max_distance?: number;
    gatling_gun_spawn_min_distance?: number;
    gatling_gun_spawn_max_distance?: number;
    gatling_gun_spawn_delay?: number;
    gatling_gun_radius?: number;
    gatling_gun_damage?: number;
    momentum_punch_units_travel?: number;
    momentum_punch_aoe_increase?: number;

    // Reimagined properties
    active_projectiles_map = new Map();
    momentum_punch_current_location?: Vector;
    momentum_punch_total_distance: number = 0;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_sven/sven_spell_storm_bolt.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/storm_hammer_gatling_gun.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/storm_hammer_momentum_punch_explosion.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/storm_hammer_strong_right.vpcf", context);        
    }

    GetAOERadius()
    {
        return this.GetSpecialValueFor("bolt_aoe");
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number
    {
        // Scepter: increases cast range
        if (this.caster.HasScepter())
        {
            return super.GetCastRange(location, target) + this.GetSpecialValueFor("cast_range_bonus_scepter");
        }

        return super.GetCastRange(location, target);
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget();
        const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target!.GetAbsOrigin());

        // Ability specials
        this.bolt_speed = this.GetSpecialValueFor("bolt_speed");
        this.bolt_stun_duration = this.GetSpecialValueFor("bolt_stun_duration");
        this.bolt_aoe = this.GetSpecialValueFor("bolt_aoe");
        this.vision_radius = this.GetSpecialValueFor("vision_radius");
        this.cast_range_bonus_scepter = this.GetSpecialValueFor("cast_range_bonus_scepter");

        // Reimagined specials
        this.strong_right_damage = this.GetSpecialValueFor("strong_right_damage");
        this.strong_right_radius = this.GetSpecialValueFor("strong_right_radius");
        this.gatling_gun_count = this.GetSpecialValueFor("gatling_gun_count");        
        this.gatling_gun_behind_max_distance = this.GetSpecialValueFor("gatling_gun_behind_max_distance");
        this.gatling_gun_spawn_min_distance = this.GetSpecialValueFor("gatling_gun_spawn_min_distance");
        this.gatling_gun_spawn_max_distance = this.GetSpecialValueFor("gatling_gun_spawn_max_distance");
        this.gatling_gun_spawn_delay = this.GetSpecialValueFor("gatling_gun_spawn_delay");
        this.gatling_gun_radius = this.GetSpecialValueFor("gatling_gun_radius");
        this.gatling_gun_damage = this.GetSpecialValueFor("gatling_gun_damage");
        this.momentum_punch_units_travel = this.GetSpecialValueFor("momentum_punch_units_travel");
        this.momentum_punch_aoe_increase = this.GetSpecialValueFor("momentum_punch_aoe_increase");

        // Play sound cast
        EmitSoundOn(this.sound_cast, this.caster);

        // Play a random cast response
        EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length-1)], this.caster);

        // Fire main projectile towards the target
        const projectileID = ProjectileManager.CreateTrackingProjectile(
        {                
            Ability: this,
            EffectName: this.particle_bolt,            
            Source: this.caster,
            Target: target,
            bDodgeable: true,
            bDrawsOnMinimap: false,
            bIsAttack: false,
            bProvidesVision: true,
            bReplaceExisting: false,
            bVisibleToEnemies: true,
            iMoveSpeed: this.bolt_speed,
            iSourceAttachment: ProjectileAttachment.ATTACK_2,
            iVisionRadius: this.vision_radius,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vSourceLoc: this.caster.GetAbsOrigin()
        });        

        // Define projectile
        let storm_bolt_projectile: StormBoltProjectile = 
        {            
            momentum_punch_current_location: this.caster.GetAbsOrigin(),
            momentum_punch_total_distance: 0,
            tracking_projectile: true,
            hit_targets: new Set(),
            main_target: target!
        };
        
        // Add projectile into the map
        this.active_projectiles_map.set(projectileID, storm_bolt_projectile);

        // Scepter: teleports the caster with the main projectile
        if (this.caster.HasScepter())
        {
            const modifier = this.caster.AddNewModifier(this.caster, this, modifier_reimagind_sven_storm_hammer_scepter.name, {});
            if (modifier)
            {
                (modifier as modifier_reimagind_sven_storm_hammer_scepter).projectileID = projectileID;
                (modifier as modifier_reimagind_sven_storm_hammer_scepter).target = target;
            }
        }

        // Reimagined: Gomu Gomu No Gatling Gun: Fires additional mini-Storm Hammer projectiles in random positions next to Sven directly forward in the direction of his target, mini-stunning and dealing minor damage in every hit. Linear projectiles. 
        // Done on cast, unless you have a scepter which will then be done on modifier removal instead
        if (!this.caster.HasScepter())
        {
            this.ReimaginedGomuGomuNoGatlingGun(direction)
        }
    }
    
    OnProjectileHitHandle(target: CDOTA_BaseNPC | undefined, location: Vector, projectileID: ProjectileID): boolean | void
    {
        // Reimagined: Gomu Gomu No Gatling Gun: Fires additional mini-Storm Hammer projectiles in random positions next to Sven directly forward in the direction of his target, mini-stunning and dealing minor damage in every hit. Linear projectiles. 
        if (this.ReimaginedGomuGomuNoGatlingGunImpact(target, location, projectileID)) return true;

        // Play impact sound
        EmitSoundOnLocationWithCaster(location, this.sound_impact, this.caster);

        // If caster has the scepter transportation modifier, remove it from him
        if (this.caster.HasModifier(modifier_reimagind_sven_storm_hammer_scepter.name))
        {
            this.caster.RemoveModifierByName(modifier_reimagind_sven_storm_hammer_scepter.name);

            // Reimagined: Gomu Gomu No Gatling Gun: Fires additional mini-Storm Hammer projectiles in random positions next to Sven directly forward in the direction of his target, mini-stunning and dealing minor damage in every hit. Linear projectiles. 
            // If the caster has a scepter, waits until reaching the final position to activate.
            this.ReimaginedGomuGomuNoGatlingGun(this.caster.GetForwardVector());
        }        

        let radius = this.bolt_aoe!;
        // Reimagined: Momentum Punch: For every few units the main projectile traveled until it hit the target or was disjointed, increases the impact's AoE by a small amount.
        radius = this.ReimaginedMomentumPunchRadiusIncrease(location, projectileID)   

        // Spell Absorb blocks on the main target            
        if (target && target.TriggerSpellAbsorb(this))
        {
            return;
        }

        // Find all enemy units in AoE
        const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                          location,
                                          undefined,
                                          radius,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.ANY,
                                          false);

        for (const enemy of enemies)
        {
            // If this stopped the main target from teleporting, play line
            if (enemy == target! && target!.HasModifier("modifier_teleporting"))
            {
                EmitSoundOn(this.impact_responses[RandomInt(0, this.impact_responses.length-1)], this.caster);
            }
         
            // Deal damage to all enemies            
            ApplyDamage(
            {
                attacker: this.caster,
                damage: this.GetAbilityDamage(),
                damage_type: this.GetAbilityDamageType(),
                victim: enemy,
                ability: this,
                damage_flags: DamageFlag.NONE
            });

            // Stun them!
            enemy.AddNewModifier(this.caster, this, BuiltInModifier.STUN, {duration: this.bolt_stun_duration});
        }
    }

    OnProjectileThinkHandle(projectileID: ProjectileID)
    {
        // Only triggers for main projectile, which is a tracking one
        if (this.active_projectiles_map.has(projectileID) && (this.active_projectiles_map.get(projectileID) as StormBoltProjectile).tracking_projectile)
        {
            this.ReimaginedMomentumPunchThink(projectileID);    

            // Reimagined: Strong Right: Goes through all units in the projectile's path, dealing damage.
            this.ReimaginedStrongRight(projectileID)
        }        
    }

    ReimaginedMomentumPunchThink(projectileID: ProjectileID)
    {
        const location = ProjectileManager.GetTrackingProjectileLocation(projectileID);        
        const projectile: StormBoltProjectile = this.active_projectiles_map.get(projectileID);

        if (!projectile) return;        

        // Store current location if there's not any stored yet
        if (!projectile.momentum_punch_current_location)
        {
            projectile.momentum_punch_current_location = location;
        }

        else // Compare location and accumulate distance
        {
            const distance =  util.CalculateDistanceBetweenPoints(projectile.momentum_punch_current_location, location);            
            if (distance > 0)
            {
                projectile.momentum_punch_current_location = location;
                projectile.momentum_punch_total_distance += distance;                
            }
        }

        return;
    }

    ReimaginedMomentumPunchRadiusIncrease(location: Vector, projectileID: ProjectileID): number
    {                    
        // Verify that this is a main projectile
        if (!(this.active_projectiles_map.get(projectileID) as StormBoltProjectile).tracking_projectile)
        {
            return this.bolt_aoe!;
        }
        
        // Calculate radius increase
        const projectile: StormBoltProjectile = this.active_projectiles_map.get(projectileID);
        const ticks = projectile.momentum_punch_total_distance / this.momentum_punch_units_travel!;                
        const radius = ticks * this.momentum_punch_aoe_increase!;
        const final_radius = (radius + this.bolt_aoe!);                

        // Play Momentum particle effect
        const speed = (final_radius / 0.35 - 1); // Calculate of final radius = initial radius + speed * lifetime, lifetime for this particle is 0.35
        this.particle_momentum_explosion_fx = ParticleManager.CreateParticle(this.particle_momentum_explosion, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_momentum_explosion_fx, 0, location);
        ParticleManager.SetParticleControl(this.particle_momentum_explosion_fx, 1, Vector(speed,0,0)); // Position along ring's min and max speed
        ParticleManager.ReleaseParticleIndex(this.particle_momentum_explosion_fx);

        // Remove projectile from the map
        this.active_projectiles_map.delete(projectileID);

        return final_radius;        
    }

    ReimaginedStrongRight(projectileID: ProjectileID)
    {
        const projectile: StormBoltProjectile = this.active_projectiles_map.get(projectileID);

        // Check for nearby enemies
        const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                          ProjectileManager.GetTrackingProjectileLocation(projectileID),
                                          undefined,
                                          this.strong_right_radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.ANY,
                                          false);

        for (const enemy of enemies)
        {
            // If this is the main enemy, ignore it
            if (projectile.main_target == enemy) continue;            

            // Check if the enemy is in the set of this projectile. If so, ignore it
            if (!projectile.hit_targets.has(enemy))
            {
                // Add enemy to the set
                projectile.hit_targets.add(enemy);

                // Deal damage to the enemy                
                ApplyDamage(
                {
                    attacker: this.caster,
                    damage: this.strong_right_damage!,
                    damage_type: this.GetAbilityDamageType(),
                    victim: enemy,
                    ability: this,
                    damage_flags: DamageFlag.NONE
                });

                // Play particle effect
                this.particle_strong_right_fx = ParticleManager.CreateParticle(this.particle_strong_right, ParticleAttachment.POINT_FOLLOW, enemy);                
                ParticleManager.SetParticleControlEnt(this.particle_strong_right_fx, 3, enemy, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", enemy.GetAbsOrigin(), true);
                ParticleManager.ReleaseParticleIndex(this.particle_strong_right_fx);

                // Scepter: Instant attacks all enemies the projectile goes through
                if (this.caster.HasScepter())
                {
                    util.PerformAttackNoCleave(this.caster, enemy, false, true, true, false, false, false, true);
                }
            }
        }                                          
    }

    ReimaginedGomuGomuNoGatlingGun(direction: Vector)
    {
        // We'll do one punch to the right and one to the left of the caster each time        
        let right_side = true;
        let count = 0;
        const caster_pos = this.caster.GetAbsOrigin();

        Timers.CreateTimer(this.gatling_gun_spawn_delay! * (count+1), () => 
        {
            count++;

            // Create position in front of the caster
            const distance_behind = RandomInt(0, this.gatling_gun_behind_max_distance!);
            const behind_position: Vector = (caster_pos - direction * distance_behind) as Vector;
            const front_cast_position: Vector = (behind_position + direction * RandomInt(this.gatling_gun_spawn_min_distance!, this.gatling_gun_spawn_max_distance!)) as Vector;

            // Define QAngle
            let qangle;
            if (right_side)
            {  
                qangle = QAngle(0, -90, 0);
            }
            else
            {
                qangle = QAngle(0, 90, 0);
            }

            // Rotate the position 90 degrees to either the right or the left
            const actual_position = RotatePosition(behind_position, qangle, front_cast_position);                        

            const projectileID = ProjectileManager.CreateLinearProjectile(
            {
                Ability: this,
                EffectName: this.particle_gatling_gun,            
                Source: this.caster,
                bDrawsOnMinimap: false,
                bHasFrontalCone: false,
                bIgnoreSource: false,
                bProvidesVision: false,
                bVisibleToEnemies: true,
                fDistance: this.GetCastRange(caster_pos, undefined),
                fEndRadius: 80,
                fExpireTime: GameRules.GetGameTime() + 10,
                fMaxSpeed: this.bolt_speed,
                fStartRadius: 80,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.BASIC | UnitTargetType.HERO,            
                vSpawnOrigin: actual_position,
                vVelocity: (direction * this.bolt_speed!) as Vector
            });
            
            const projectile: GatlingGunProjectile = 
            {
                hit_targets: new Set(),
                tracking_projectile: false
            };
    
            this.active_projectiles_map.set(projectileID, projectile);

            // Flip the side
            if (right_side)
            {
                right_side = false;
            }
            else
            {
                right_side = true;
            }

            // If we still hasn't reached the maximum amount, repeat
            if (count < this.gatling_gun_count!)
            {
                return this.gatling_gun_spawn_delay!;
            }
            
            return undefined;
        })

    }

    ReimaginedGomuGomuNoGatlingGunImpact(target: CDOTA_BaseNPC | undefined, location: Vector, projectileID: ProjectileID): boolean
    {
        // Only go to this block if this is a linear projectile (Gatling Gun)
        if (!(this.active_projectiles_map.get(projectileID) as StormBoltProjectile).tracking_projectile)
        {
            // Play impact sound
            EmitSoundOnLocationWithCaster(location, "high_five.impact", this.caster);

            if (target)
            {   
                // Deal damage to the target
                ApplyDamage(
                {
                    attacker: this.caster,
                    damage: this.gatling_gun_damage!,
                    damage_type: this.GetAbilityDamageType(),
                    victim: target,
                    ability: this,
                    damage_flags: DamageFlag.NONE
                });

                // Mini stun it!                
                target.AddNewModifier(this.caster, this, BuiltInModifier.STUN, {duration: 0.1});
            }

            return true;
        }

        return false;
    }
}