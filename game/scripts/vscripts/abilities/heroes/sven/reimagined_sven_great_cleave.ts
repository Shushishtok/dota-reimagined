import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_sven_great_cleave_passive } from "../../../modifiers/heroes/sven/modifier_reimagined_sven_great_cleave_passive"
import "../../../modifiers/heroes/sven/modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction"
import "../../../modifiers/heroes/sven/modifier_reimagined_sven_great_cleave_epic_cleave_counter"
import * as util from "../../../lib/util";
import { SvenTalents } from "./reimagined_sven_talents";

@registerAbility()
export class reimagined_sven_great_cleave extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_pre_cast: string = "Sven.GreatCleave.OverheadSlam.PreCast";
    sound_cast: string = "Sven.GreatCleave.OverheadSlam.Cast";
    sound_hit: string = "Sven.GreatCleave.OverheadSlam.Hit";
    particle: string = "particles/heroes/sven/overhead_slam.vpcf";
    particle_hit: string = "particles/heroes/sven/overhead_slam_hit.vpcf";
    particle_hit_fx?: ParticleID;

    // Reimagined properties
    active_projectile_map: Map<ProjectileID, Vector> = new Map();

    // Reimagined specials
    overhead_slam_max_distance?: number;
    overhead_slam_speed?: number;    
    overhead_slam_radius?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/overhead_slam.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/overhead_slam_hit.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_sven/sven_spell_great_cleave.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/sven/great_cleave_epic_cleave.vpcf", context);        
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_sven_great_cleave_passive.name;
    }

    GetCastAnimation()
    {
        this.caster.AddActivityModifier("loadout");
        return GameActivity.DOTA_SPAWN;
    }

    OnAbilityPhaseStart()
    {
        // Play pre-cast sound
        EmitSoundOn(this.sound_pre_cast, this.caster);
        return true;
    }

    OnAbilityPhaseInterrupted()
    {
        // Stop pre-cast sound
        StopSoundOn(this.sound_pre_cast, this.caster);
        this.caster.ClearActivityModifiers();
    }

    OnSpellStart(): void
    {   
        // Clear cast animation activity override
        this.caster.ClearActivityModifiers();

        // Ability properties
        const target_position = this.GetCursorPosition();
        const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target_position);
        
        // Reimagined specials
        this.overhead_slam_max_distance = this.GetSpecialValueFor("overhead_slam_max_distance");
        this.overhead_slam_speed = this.GetSpecialValueFor("overhead_slam_speed");
        this.overhead_slam_radius = this.GetSpecialValueFor("overhead_slam_radius");

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Launch projectile towards position
        const projectile = ProjectileManager.CreateLinearProjectile(
        {
            Ability: this,
            EffectName: this.particle,            
            Source: this.caster,
            bDrawsOnMinimap: false,
            bHasFrontalCone: false,
            bIgnoreSource: true,
            bProvidesVision: true,
            bVisibleToEnemies: true,
            fDistance: this.overhead_slam_max_distance,
            fEndRadius: this.overhead_slam_radius,
            fExpireTime: GameRules.GetGameTime() + 10,
            fMaxSpeed: undefined,
            fStartRadius: this.overhead_slam_radius,
            iUnitTargetFlags: UnitTargetFlags.MAGIC_IMMUNE_ENEMIES,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC | UnitTargetType.HERO,
            iVisionRadius: 250,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vAcceleration: undefined,
            vSpawnOrigin: this.caster.GetAttachmentOrigin(this.caster.ScriptLookupAttachment("attach_sword_end")),
            vVelocity: (direction * this.overhead_slam_speed * Vector(1, 1, 0)) as Vector
        });

        this.active_projectile_map.set(projectile, this.caster.GetAbsOrigin());
    }

    OnProjectileHitHandle(target: CDOTA_BaseNPC | undefined, location: Vector, projectileID: ProjectileID)
    {
        if (target)
        {
            // Perform an attack against the target
            util.PerformAttackNoCleave(this.caster, target, false, true, true, false, false, false, true);            

            // Play hit sound
            EmitSoundOn(this.sound_hit, target);

            // Create hit particle effect
            this.particle_hit_fx = ParticleManager.CreateParticle(this.particle_hit, ParticleAttachment.ABSORIGIN_FOLLOW, target)
            ParticleManager.SetParticleControl(this.particle_hit_fx, 0, target.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_hit_fx);

            // Talent: Quakewave: Overhead Slam knockbacks enemies hit up and backwards over a duration of x seconds, stunning them in the process.
            this.ReimaginedQuakewave(target, projectileID);
        }
        else
        {
            // Reached max distance, remove from map
            this.active_projectile_map.delete(projectileID);
        }

        // Do not make the projectile disappear upon hitting a target
        return false;
    }

    ReimaginedQuakewave(target: CDOTA_BaseNPC, projectileID: ProjectileID)
    {
        if (util.HasTalent(this.caster, SvenTalents.SvenTalent_3))
        {
            // Verify this is a valid projectile
            if (this.active_projectile_map.has(projectileID))
            {
                // Get current position
                const original_caster_pos = this.active_projectile_map.get(projectileID)!;

                // Initialize talent properties                
                const knockback_duration = util.GetTalentSpecialValueFor(this.caster, SvenTalents.SvenTalent_3, "knockback_duration");
                const knockback_height = util.GetTalentSpecialValueFor(this.caster, SvenTalents.SvenTalent_3, "knockback_height");
                const knockback_distance = util.GetTalentSpecialValueFor(this.caster, SvenTalents.SvenTalent_3, "knockback_distance");
                const stun_duration = util.GetTalentSpecialValueFor(this.caster, SvenTalents.SvenTalent_3, "stun_duration");

                // Initialize knockback properties
                const knockback: KnockbackProperties = 
                {
                    center_x: original_caster_pos.x,
                    center_y: original_caster_pos.y,
                    center_z: original_caster_pos.z,
                    duration: stun_duration,
                    knockback_distance: knockback_distance,
                    knockback_duration: knockback_duration,
                    knockback_height: knockback_height,
                    should_stun: 1
                };
    
                target.AddNewModifier(this.caster, this, BuiltInModifier.KNOCKBACK, knockback);
            }
        }
    }
}