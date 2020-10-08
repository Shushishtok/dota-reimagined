import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_drow_ranger_gust_freeze } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_gust_freeze";
import { modifier_reimagined_drow_ranger_gust_tailwind } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_gust_tailwind"

@registerAbility()
export class reimagined_drow_ranger_wave_of_silence extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_DrowRanger.Silence";
    particle_cast: string = "particles/units/heroes/hero_drow/drow_silence_wave.vpcf";
    particle_cast_fx?: ParticleID;

    // Ability specials
    wave_speed?: number;
    wave_width?: number;
    silence_duration?: number;
    knockback_distance_max?: number;
    knockback_duration?: number;

    // Reimagined specials
    xgust_projectiles?: number;
    xgust_angle?: number;
    wave_chill_range?: number;
    wave_chill_freeze_duration?: number;
    tailwind_duration?: number;    

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget();
        const target_point = this.GetCursorPosition();
        let direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target_point);

        // Ability specials
        this.wave_speed = this.GetSpecialValueFor("wave_speed");
        this.wave_width = this.GetSpecialValueFor("wave_width");
        this.silence_duration = this.GetSpecialValueFor("silence_duration");
        this.knockback_distance_max = this.GetSpecialValueFor("knockback_distance_max");
        this.knockback_duration = this.GetSpecialValueFor("knockback_duration");

        // Reimagined specials
        this.xgust_projectiles = this.GetSpecialValueFor("xgust_projectiles");
        this.xgust_angle = this.GetSpecialValueFor("xgust_angle");
        this.wave_chill_range = this.GetSpecialValueFor("wave_chill_range");
        this.wave_chill_freeze_duration = this.GetSpecialValueFor("wave_chill_freeze_duration");
        this.tailwind_duration = this.GetSpecialValueFor("tailwind_duration");

        // Resolve issues of 0 length vector ability casts
        if (target_point == this.caster.GetAbsOrigin())
        {   
            direction = this.caster.GetForwardVector();
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Reimagined: Tailwind: May be cast on self to constantly push Drow Ranger on the direction she's currently facing, silencing (but not pushing) any enemies in her path. Drow can rotate herself to change the direction the gust pushes. During this effect, Drow is disarmed. Last 4 seconds.
        if (this.ReimaginedTailwind(target)) return;

        // Fire linear projectile
        this.LaunchGustTowardsDirection(direction);

        // Reimagined: X-Gust: Fires a wave of Gust in every 90 degrees of Drow Ranger, forming a X shape of gust, pushing all enemies away from her.
        this.ReimaginedXGust(target_point);
    }

    LaunchGustTowardsDirection(direction: Vector)
    {
        
        ProjectileManager.CreateLinearProjectile(
            {
                Ability: this,
                EffectName: this.particle_cast,            
                Source: this.caster,
                bDrawsOnMinimap: false,
                bHasFrontalCone: false,
                bIgnoreSource: false,
                bProvidesVision: false,
                bVisibleToEnemies: true,
                fDistance: this.GetCastRange(this.caster.GetAbsOrigin(), undefined),
                fEndRadius: this.wave_width,
                fExpireTime: GameRules.GetGameTime() + 10,
                fMaxSpeed: undefined,
                fStartRadius: this.wave_width,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                iVisionRadius: undefined,
                iVisionTeamNumber: undefined,
                vAcceleration: undefined,
                vSpawnOrigin: this.caster.GetAbsOrigin(),
                vVelocity: (direction * this.wave_speed! * Vector(1, 1, 0)) as Vector
            });
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): void
    {
        // If there was no target, do nothing
        if (!target) return;

        // Calculate distance and knockback distance. Min distance 1 and max distance defined by this.knockback_distance_max
        const distance = util.CalculateDistanceBetweenEntities(this.caster, target);
        let knockback_distance = 0.5 * (this.GetCastRange(this.caster.GetAbsOrigin(), target) - distance);
        if (knockback_distance > this.knockback_distance_max!)
        {
            knockback_distance = this.knockback_distance_max!;
        }
        else if (knockback_distance <= 0)
        {
            knockback_distance = 1;
        }

        // Knockback properties
        const knockbackProperties: KnockbackProperties =
            {
                center_x: this.caster.GetAbsOrigin().x,
                center_y: this.caster.GetAbsOrigin().y,
                center_z: this.caster.GetAbsOrigin().z,
                duration: this.knockback_duration!,
                knockback_duration: this.knockback_duration!,
                knockback_distance: knockback_distance,
                knockback_height: 0,
                should_stun: 0                
            }

        // Apply knockback on enemies hit
        target.AddNewModifier(this.caster, this, BuiltInModifier.KNOCKBACK, knockbackProperties)

        // Apply the silence modifier
        target.AddNewModifier(this.caster, this, BuiltInModifier.SILENCE, {duration: this.silence_duration});

        // Reimagined: Wave Chill: Enemies that are closer than 200 range to Drow Ranger main gust are also frozen, becoming stunned during the Gust's knockback plus 2 additional seconds.
        this.ReimaginedWaveChill(distance, target);
    }

    ReimaginedTailwind(target: CDOTA_BaseNPC | undefined): boolean
    {
        // If target is empty, do nothing and return 
        if (!target) return false;

        // Only apply if the target is the caster
        if (this.caster != target) return false;

        // Apply the Tailwind modifier on the caster
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_drow_ranger_gust_tailwind.name, {duration: this.tailwind_duration});

        return true;
    }

    ReimaginedXGust(target_point: Vector)
    {
        let qangle
        for (let index = 0; index < this.xgust_projectiles!; index++) 
        {
            // Calculate qangle
            qangle = QAngle(0, (index + 1) * this.xgust_angle!, 0);

            // Rotate position
            const new_cast_position = RotatePosition(this.caster.GetAbsOrigin(), qangle, target_point);

            // Calculate new direction
            const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), new_cast_position);

            // Fire projectile
            this.LaunchGustTowardsDirection(direction);
        }
    }

    ReimaginedWaveChill(distance: number, target: CDOTA_BaseNPC)
    {
        print(distance, this.wave_chill_range)
        // If distance is below the minimum, freeze the target!
        if (distance <= this.wave_chill_range!)
        {            
            // Calculate duration
            const duration = this.knockback_duration! + this.wave_chill_freeze_duration!;            

            // Freeze!
            target.AddNewModifier(this.caster, this, modifier_reimagined_drow_ranger_gust_freeze.name, {duration: duration});            
        }
    }
}