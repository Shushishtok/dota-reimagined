import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_stifling_dagger_slow } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_stifling_dagger_slow"
import { modifier_reimagined_phantom_assassin_stifling_dagger_caster } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_stifling_dagger_caster"        

@registerAbility()
export class reimagined_phantom_assassin_stifling_dagger extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_PhantomAssassin.Dagger.Cast";
    particle_dagger: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger.vpcf";
    sound_kill_responses: string[] = ["phantom_assassin_phass_ability_stiflingdagger_01","phantom_assassin_phass_ability_stiflingdagger_02","phantom_assassin_phass_ability_stiflingdagger_03","phantom_assassin_phass_ability_stiflingdagger_04"]
    kill_responses_chance: number = 20;    

    // Reimagined properties
    dagger_map: Map<ProjectileID, boolean> = new Map();

    // Ability specials
    dagger_speed?: number;
    duration?: number;

    // Reimagined specials
    fan_of_knives_add_daggers?: number;
    fan_of_knives_delay?: number;    
    fan_of_knives_fixed_damage?: number;    

    OnSpellStart(): void
    {
        // Ability properties:
        const target = this.GetCursorTarget()!;        

        // Ability specials
        this.dagger_speed = this.GetSpecialValueFor("dagger_speed");
        this.duration = this.GetSpecialValueFor("duration");

        // Reimagined specials
        this.fan_of_knives_add_daggers = this.GetSpecialValueFor("fan_of_knives_add_daggers");
        this.fan_of_knives_delay = this.GetSpecialValueFor("fan_of_knives_delay");
        this.fan_of_knives_fixed_damage = this.GetSpecialValueFor("fan_of_knives_fixed_damage")

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Launch a dagger towards the target
       this.ThrowStiflingDagger(target, true);

       // Launches up to x additional daggers to nearby enemies except for the main target. If there any number of daggers remaining, one dagger is thrown at the main target. The rest are not used. Additional daggers deal y fixed physical damage, and do not proc on-hit effects. Still applies the slow debuff.
       this.ReimaginedFanOfKnives(target);
    }

    ThrowStiflingDagger(target: CDOTA_BaseNPC, real_dagger: boolean)
    {
        const particleID = ProjectileManager.CreateTrackingProjectile(
        {                
            Ability: this,
            EffectName: this.particle_dagger,
            ExtraData: {},
            Source: this.caster,
            Target: target,
            bDodgeable: true,
            bDrawsOnMinimap: false,
            bIsAttack: false,
            bProvidesVision: true,
            bReplaceExisting: false,
            bVisibleToEnemies: true,
            iMoveSpeed: this.dagger_speed,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            iVisionRadius: 450,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vSourceLoc: this.caster.GetAbsOrigin()
        })

        // Put particle ID in the map for the on-hit data
        this.dagger_map.set(particleID, real_dagger);
    }

    OnProjectileHitHandle(target: CDOTA_BaseNPC, location: Vector, projectileHandle: ProjectileID): void
    {
        // If there was no target, do nothing else
        if (!target) return;

        // Check for Linken's sphere
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            if (target.TriggerSpellAbsorb(this))
            {
                return;
            }
        }

        // Apply FOW vision on target position
        AddFOWViewer(this.caster.GetTeamNumber(), target.GetAbsOrigin(), 450, 3.34, false);

        // Check if this was a real dagger       
        if (this.dagger_map.get(projectileHandle))
        {
            // Set the damage altering modifier on the caster
            const caster_modifier = this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_stifling_dagger_caster.name, {duration: FrameTime()});
    
            // Calculate "set" position
            const caster_position = this.caster.GetAbsOrigin();
            const caster_forward = this.caster.GetForwardVector();
            const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target.GetAbsOrigin());
            const distance = util.CalculateDistanceBetweenEntities(this.caster, target);
            const attack_position = (caster_position + direction * (distance - 100)) as Vector;
    
            // Set position in front of the enemy to trigger cleaves correctly
            this.caster.SetAbsOrigin(attack_position);
            this.caster.SetForwardVector(direction);
    
            // Perform attack on enemy
            this.caster.PerformAttack(target, true, true, true, false, false, false, true);
    
            // Return caster to its original position and forward vector
            this.caster.SetAbsOrigin(caster_position);
            this.caster.SetForwardVector(caster_forward);

            // Remove damage altering modifier from caster to prevent any other damage changes this frame
            caster_modifier.Destroy();
        }
        else
        {
            // Fake dagger: Fan of Knives
            this.ReimaginedFanOfKnivesDamage(target);
        }

        // Remove projectile from map to not allow map to get too big
        this.dagger_map.delete(projectileHandle);

        // Apply slow modifier on enemy if it's not spell immune
        if (!target.IsMagicImmune())
        {
            target.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_stifling_dagger_slow.name, {duration: this.duration});
        }

        // Check if target has died: if so, roll for a kill response
        if (!target.IsAlive())
        {
            if (RollPercentage(this.kill_responses_chance))
            {
                EmitSoundOn(this.sound_kill_responses[RandomInt(1, this.sound_kill_responses.length-1)], this.caster);
            }
        }
    }

    ReimaginedFanOfKnives(main_target: CDOTA_BaseNPC): void
    {        
        // Find all enemies in cast range        
        const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                          this.caster.GetAbsOrigin(),
                                          undefined,
                                          this.GetCastRange(this.caster.GetAbsOrigin(), undefined) + 50,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                          FindOrder.ANY,
                                          false);        

        
        // Throw the set amount of daggers at nearby enemies
        let daggers_thrown = 0;        
              
        for (const enemy of enemies)
        {
            // Ignore main target
            if (enemy == main_target) continue;
            
            // Check if there are any daggers "left"
            if (daggers_thrown < this.fan_of_knives_add_daggers!)
            {
                // Increment thrown daggers
                daggers_thrown++;

                // Throw fake dagger at enemy
                Timers.CreateTimer(this.fan_of_knives_delay! * daggers_thrown, () =>
                {
                    this.ThrowStiflingDagger(enemy, false);
                })
            }
            else break;
        }

        // If after all enemies were found there are still daggers left, throw one additional at the main target
        if (daggers_thrown < this.fan_of_knives_add_daggers!)
        {
            // Throw fake dagger at enemy
            Timers.CreateTimer(this.fan_of_knives_delay! * (daggers_thrown + 1), () =>
            {
                this.ThrowStiflingDagger(main_target, false);
            })
        }    
    }

    ReimaginedFanOfKnivesDamage(target: CDOTA_BaseNPC): void
    {
        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: this.fan_of_knives_fixed_damage!,
            damage_type: DamageTypes.PHYSICAL,
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE
        });
    }
}