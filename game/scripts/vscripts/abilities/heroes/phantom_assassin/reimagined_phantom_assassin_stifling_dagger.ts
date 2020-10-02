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

    // Ability specials
    dagger_speed?: number;
    duration?: number;

    // Reimagined specials`
    fan_of_knives_add_daggers?: number;
    fan_of_knives_delay?: number;    
    sharp_and_quite_hp_threshold_per_stack?: number;    

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

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Launch a dagger towards the target
       this.ThrowStiflingDagger(target);

       this.ReimaginedFanOfKnives();
    }

    ThrowStiflingDagger(target: CDOTA_BaseNPC)
    {
        ProjectileManager.CreateTrackingProjectile(
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
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): void
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

        // Apply slow modifier on enemy, if it's not spell immune
        if (!target.IsMagicImmune())
        {
            target.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_stifling_dagger_slow.name, {duration: this.duration});
        }

        // Remove damage altering modifier from caster to prevent any other damage changes this frame
        caster_modifier.Destroy();

        // Check if target has died: if so, roll for a kill response
        if (!target.IsAlive())
        {
            if (RollPercentage(this.kill_responses_chance))
            {
                EmitSoundOn(this.sound_kill_responses[RandomInt(1, this.sound_kill_responses.length-1)], this.caster);
            }
        }
    }

    ReimaginedFanOfKnives(): void
    {        
        // Find all enemies in cast range
        let possible_targets: CDOTA_BaseNPC[] = [];
        const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                          this.caster.GetAbsOrigin(),
                                          undefined,
                                          this.GetCastRange(this.caster.GetAbsOrigin(), undefined) + 50,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NO_INVIS,
                                          FindOrder.ANY,
                                          false);        

        // Add all enemies to the possible targets array        
        enemies.forEach(element => 
        {
            possible_targets.push(element);
        });
        
        // Throw the set amount of daggers at enemies
        let daggers_thrown = 0;
        Timers.CreateTimer(this.fan_of_knives_delay!, () =>
        {            
            // Check if list of possible targets is empty, refresh if it is            
            if (possible_targets.length <= 0)
            {                
                enemies.forEach(element => 
                {
                    possible_targets.push(element);
                });
            }

            // Roll a random enemy
            const random_number = RandomInt(0, possible_targets.length -1);            
            const chosen_enemy = possible_targets[random_number];            
            if (IsValidEntity(chosen_enemy))
            {
                // Throw dagger after a short delay
                this.ThrowStiflingDagger(chosen_enemy);                    

                // Remove this enemy from list of possible targets                
                possible_targets.splice(random_number, 1);
            }            

            daggers_thrown++;

            if (daggers_thrown <= this.fan_of_knives_add_daggers!)
            {
                return this.fan_of_knives_delay!;
            }
            else
            {
                return undefined;
            }
        });        
    }
}