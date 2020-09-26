import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_sven_great_cleave_passive } from "../../../modifiers/heroes/sven/modifier_reimagined_sven_great_cleave_passive"
import * as util from "../../../lib/util";

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

    // Reimagined specials
    overhead_slam_max_distance?: number;
    overhead_slam_speed?: number;    
    overhead_slam_radius?: number;

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
        ProjectileManager.CreateLinearProjectile(
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
            vVelocity: (direction * this.overhead_slam_speed) as Vector
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector)
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
        }

        // Do not make the projectile disappear upon hitting a target
        return false;
    }
}