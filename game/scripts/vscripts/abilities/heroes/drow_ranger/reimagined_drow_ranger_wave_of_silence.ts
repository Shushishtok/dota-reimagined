import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_drow_ranger_gust_freeze } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_gust_freeze";
import { modifier_reimagined_drow_ranger_gust_tailwind } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_gust_tailwind"
import { modifier_reimagined_drow_ranger_gust_root } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_gust_root"
import { DrowRangerTalents } from "./reimagined_drow_ranger_talents";


@registerAbility()
export class reimagined_drow_ranger_wave_of_silence extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_DrowRanger.Silence";
    particle_cast: string = "particles/units/heroes/hero_drow/drow_silence_wave.vpcf";
    particle_cast_fx?: ParticleID;
    projectile_map: Map<ProjectileID, boolean> = new Map();

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

    // Reimagined talent specials
    talent_3_distance?: number;
    talent_3_knockback_duration?: number;
    talent_3_silence_duration?: number;
    talent_4_root_duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_silence_wave.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/wavechill_frozen.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/gust_tailwind.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/talent_taildraft_breeze_projectile.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/frozen_bind_ice.vpcf", context);
    }

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
        const projectile = ProjectileManager.CreateLinearProjectile(
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

        // Set a primary projectile
        this.projectile_map.set(projectile, true);
    }

    OnProjectileHitHandle(target: CDOTA_BaseNPC, location: Vector, projectileID: ProjectileID): void
    {
        // If there is not a record on the map, do nothing (basically this should never occur, but just in case)
        if (!this.projectile_map.has(projectileID)) return;

        // If there was no target, we reached the max distance; remove the record from the map
        if (!target)
        {
            this.projectile_map.delete(projectileID);
            return;
        }

        // Check if this is a primary projectile
        if (this.projectile_map.get(projectileID))
        {
            // Calculate distance and knockback distance. Min distance 1 and max distance defined by max distance
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

            // Reimagined: Wave Chill: Enemies that are closer than x range to Drow Ranger main gust are also frozen, becoming stunned during the Gust's knockback plus y additional seconds.
            this.ReimaginedWaveChill(distance, target);

            // Talent: Frozen Bind: Gusts root affected enemies for x seconds after the knockback. If Wave Chill procced, then the root is also extended by the stun duration.
            this.ReimaginedTalentFrozenBind(target);
        }
        else
        {
            // Talent: Taildraft Breeze: During Tailwind, Drow Ranger fires a small gust projectile backwards every x seconds, which has y width and goes up to z distance, knocking enemies slightly back and silencing them for t seconds.
            this.ReimaginedTalentTaildraftBreeze(target)

            // Talent: Frozen Bind: Gusts root affected enemies for x seconds after the knockback. If Wave Chill procced, then the root is also extended by the stun duration.
            this.ReimaginedTalentFrozenBind(target);
        }
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
        // If distance is below the minimum, freeze the target!
        if (distance <= this.wave_chill_range!)
        {
            // Calculate duration
            const duration = this.knockback_duration! + this.wave_chill_freeze_duration!;

            // Freeze!
            target.AddNewModifier(this.caster, this, modifier_reimagined_drow_ranger_gust_freeze.name, {duration: duration});
        }
    }

    ReimaginedTalentTaildraftBreeze(target: CDOTA_BaseNPC)
    {
        if (util.HasTalent(this.caster, DrowRangerTalents.DrowRangerTalent_3))
        {
            // Initialize variables
            if (!this.talent_3_distance) this.talent_3_distance = util.GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_distance");
            if (!this.talent_3_knockback_duration) this.talent_3_knockback_duration = util.GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_knockback_duration");
            if (!this.talent_3_silence_duration) this.talent_3_silence_duration = util.GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_silence_duration");

            // Knockback properties
            const knockbackProperties: KnockbackProperties =
            {
                center_x: this.caster.GetAbsOrigin().x,
                center_y: this.caster.GetAbsOrigin().y,
                center_z: this.caster.GetAbsOrigin().z,
                duration: this.talent_3_knockback_duration!,
                knockback_duration: this.talent_3_knockback_duration,
                knockback_distance: this.talent_3_distance * 0.5,
                knockback_height: 0,
                should_stun: 0
            }

            // Apply knockback on enemies hit
            target.AddNewModifier(this.caster, this, BuiltInModifier.KNOCKBACK, knockbackProperties)

            // Apply the silence modifier
            target.AddNewModifier(this.caster, this, BuiltInModifier.SILENCE, {duration: this.silence_duration});
        }
    }

    ReimaginedTalentFrozenBind(target: CDOTA_BaseNPC)
    {
        if (util.HasTalent(this.caster, DrowRangerTalents.DrowRangerTalent_4))
        {
            if (!this.talent_4_root_duration) this.talent_4_root_duration = util.GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_4, "talent_4_root_duration");

            // Calculate the duration of the root modifier
            let duration = this.knockback_duration! + this.talent_4_root_duration;
            if (target.HasModifier(modifier_reimagined_drow_ranger_gust_freeze.name))
            {
                duration += this.wave_chill_freeze_duration!;
            }

            // Apply root on the enemy
            target.AddNewModifier(this.caster, this, modifier_reimagined_drow_ranger_gust_root.name, {duration: duration});
        }
    }
}
