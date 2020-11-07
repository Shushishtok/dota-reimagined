import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_skywrath_mage_concussive_shot_slow } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_concussive_shot_slow"
import { modifier_reimagined_skywrath_mage_talent_3_buff } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_talent_3_buff"
import { SkywrathMageTalents } from "./reimagined_skywrath_mage_talents";

@registerAbility()
export class reimagined_skywrath_mage_concussive_shot extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    cast_responses: string[] = ["skywrath_mage_drag_concussive_shot_01", "skywrath_mage_drag_concussive_shot_02", "skywrath_mage_drag_concussive_shot_03"];
    sound_cast: string = "Hero_SkywrathMage.ConcussiveShot.Cast";
    sound_impact: string = "Hero_SkywrathMage.ConcussiveShot.Target";
    particle_cast: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_cast.vpcf";
    particle_cast_fx?: ParticleID;
    particle_fail: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_failure.vpcf";
    particle_fail_fx?: ParticleID;
    projectile_concussive: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot.vpcf";
    projectile_map: Map<ProjectileID, {remaining_bounces: number, main_target: CDOTA_BaseNPC, enemies_hit: Set<CDOTA_BaseNPC>}> = new Map();

    // Ability specials
    launch_radius?: number;
    slow_radius?: number;
    speed?: number;
    damage?: number;
    slow_duration?: number;
    shot_vision?: number;
    vision_duration?: number;
    scepter_radius?: number;
    creep_damage_pct?: number;

    // Reimagined specials
    conjured_relay_bounce_count?: number;
    conjured_relay_search_radius?: number;    
    ghastly_eerie_duration_pct?: number;
    ghastly_eerie_radius_pct?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_cast.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_failure.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_concussive_shot_slow_debuff.vpcf", context);        
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.launch_radius = this.GetSpecialValueFor("launch_radius");
        this.slow_radius = this.GetSpecialValueFor("slow_radius");
        this.speed = this.GetSpecialValueFor("speed");
        this.damage = this.GetSpecialValueFor("damage");
        this.slow_duration = this.GetSpecialValueFor("slow_duration");
        this.shot_vision = this.GetSpecialValueFor("shot_vision");
        this.vision_duration = this.GetSpecialValueFor("vision_duration");
        this.scepter_radius = this.GetSpecialValueFor("scepter_radius");
        this.creep_damage_pct = this.GetSpecialValueFor("creep_damage_pct");

        // Reimagined specials
        this.conjured_relay_bounce_count = this.GetSpecialValueFor("conjured_relay_bounce_count");
        this.conjured_relay_search_radius = this.GetSpecialValueFor("conjured_relay_search_radius");        
        this.ghastly_eerie_duration_pct = this.GetSpecialValueFor("ghastly_eerie_duration_pct");
        this.ghastly_eerie_radius_pct = this.GetSpecialValueFor("ghastly_eerie_radius_pct");                

        // Roll for responses
        if (RollPercentage(75))
        {
            EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length-1)], this.caster);
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Check for nearby enemy heroes, including spell immune
        let enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        this.caster.GetAbsOrigin(),
                                        undefined,
                                        this.launch_radius,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.HERO,
                                        UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE,
                                        FindOrder.CLOSEST,
                                        false);

        // If no enemy heroes were found, check for nearby enemy creeps
        if (enemies.length == 0)
        {
            enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        this.caster.GetAbsOrigin(),
                                        undefined,
                                        this.launch_radius,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.BASIC,
                                        UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE,
                                        FindOrder.CLOSEST,
                                        false);
        }

        // If no enemies were found, play the fizzle particle and return
        if (enemies.length == 0)
        {
            this.particle_fail_fx = ParticleManager.CreateParticle(this.particle_fail, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
			ParticleManager.SetParticleControl(this.particle_fail_fx, 0, this.caster.GetAbsOrigin());
			ParticleManager.SetParticleControl(this.particle_fail_fx, 1, this.caster.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_fail_fx);
            
            // Talent: Trapped Energy: Fizzling a Concussive Shot grants a buff that automatically fires Concussive Shot at a nearby enemy hero that comes into range. Lasts x seconds.
            if (util.HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_3))
            {
                const talent_3_duration = util.GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_3, "duration");
                this.caster.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_talent_3_buff.name, {duration: talent_3_duration})
            }

            return;            
        }

        // Get the closest unit found, designate as target
        let enemy = enemies[0];        

        // Reimagined: Conjured Relay: Concussive Shot bounces x times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in y units around the target.
        let conjured_relay_info = undefined;
        conjured_relay_info = this.ReimaginedConjuredRelayMarker(enemy);        
        
        // Fire a Concussive shot at the target
        this.LaunchConcussiveShot(this.caster, enemy, conjured_relay_info, true);

        // Scepter effect: secondary Concussive Shot
        if (this.caster.HasScepter())
        {
            // Check for enemy heroes, not including spell immune
            let scepter_target;
            let scepter_enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                    this.caster.GetAbsOrigin(),
                                                    undefined,
                                                    this.launch_radius,
                                                    UnitTargetTeam.ENEMY,
                                                    UnitTargetType.HERO,
                                                    UnitTargetFlags.FOW_VISIBLE,
                                                    FindOrder.ANY,
                                                    false);

            for (const scepter_enemy of scepter_enemies)
            {
                if (scepter_enemy != enemy)
                {
                    scepter_target = scepter_enemy;
                }
            }

            // If no heroes were found, check for enemy creeps around the target
            if (!scepter_target)
            {
                let scepter_enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                    this.caster.GetAbsOrigin(),
                                                    undefined,
                                                    this.launch_radius,
                                                    UnitTargetTeam.ENEMY,
                                                    UnitTargetType.BASIC,
                                                    UnitTargetFlags.FOW_VISIBLE,
                                                    FindOrder.CLOSEST,
                                                    false);

                if (scepter_enemies.length > 0)
                {
                    scepter_target = scepter_enemies[0];
                }
            }
    
            // If no targets were found, return
            if (!scepter_target) return;
    
            // Reimagined: Conjured Relay: Concussive Shot bounces x times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in y units around the target.
            let conjured_relay_info = undefined;
            conjured_relay_info = this.ReimaginedConjuredRelayMarker(scepter_target);

            // Fire concussive shot at the scepter target            
            this.LaunchConcussiveShot(this.caster, scepter_target, conjured_relay_info, false);
        }
    }

    LaunchConcussiveShot(source: CDOTA_BaseNPC, target: CDOTA_BaseNPC, conjured_relay_info: {remaining_bounces: number, main_target: CDOTA_BaseNPC, enemies_hit: Set<CDOTA_BaseNPC>}, primary_projectile: boolean)
    {
        if (primary_projectile)
        {
            // Play the cast particle
            this.particle_cast_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);        
            ParticleManager.SetParticleControlEnt(this.particle_cast_fx, 0, this.caster, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, this.caster.GetAbsOrigin(), false);        
            ParticleManager.SetParticleControlEnt(this.particle_cast_fx, 1, target, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, target.GetAbsOrigin(), false);
            ParticleManager.SetParticleControl(this.particle_cast_fx, 2, Vector(this.speed, 0, 0));
            ParticleManager.ReleaseParticleIndex(this.particle_cast_fx);
        }

        // Fire projectile at target
        const projectile = ProjectileManager.CreateTrackingProjectile(
        {                
            Ability: this,
            EffectName: this.projectile_concussive,
            ExtraData: {},
            Source: source,
            Target: target,
            bDodgeable: true,
            bDrawsOnMinimap: false,
            bIsAttack: false,
            bProvidesVision: true,
            bReplaceExisting: false,
            bVisibleToEnemies: true,
            iMoveSpeed: this.speed,
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            iVisionRadius: this.shot_vision,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vSourceLoc: this.caster.GetAbsOrigin()
        });

        // Map projectile
        this.projectile_map.set(projectile, conjured_relay_info!);
    }

    OnProjectileHitHandle(target: CDOTA_BaseNPC, location: Vector, projectile_handle: ProjectileID)
    {
        // If no target was hit, return
        if (!target) return;

        // Add FOW viewer
        AddFOWViewer(this.caster.GetTeamNumber(), location, this.shot_vision!, this.vision_duration!, false);

        // Play impact sound
        EmitSoundOn(this.sound_impact, target);

        let radius = this.slow_radius!;
        let slow_duration = this.slow_duration;        

        // Reimagined: Ghastly Eerie: If the main target of Concussive Shot is afflicted by Ancient Seal's debuff, the radius of Concussive Shot increases by x% and the slow duration increases by y% for all enemies in the blast range.
        const effect_properties = this.ReimaginedGhastlyEerie(target);
        if (effect_properties != undefined)
        {
            radius = effect_properties.radius;
            slow_duration = effect_properties.duration;
        }        

        // Find all enemies around the target
        const enemies = util.FindUnitsAroundUnit(this.caster,
                                                target,
                                                radius,
                                                UnitTargetTeam.ENEMY,
                                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                                UnitTargetFlags.NONE);

        for (const enemy of enemies)
        {            
            // If spell immune, ignore
            if (enemy.IsMagicImmune()) continue;
            
            // If this enemy is a creep, adjust damage
            let damage = this.damage!;
            if (enemy.IsCreep())
            {
                damage = damage * this.creep_damage_pct! * 0.01;
            }

            // Deal damage to enemy            
            ApplyDamage(
            {
                attacker: this.caster,
                damage: damage,
                damage_type: this.GetAbilityDamageType(),
                victim: enemy,
                ability: this,
                damage_flags: DamageFlag.NONE
            });
            
            // Apply slow modifier
            enemy.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_concussive_shot_slow.name, {duration: slow_duration});

            // Reimagined: Conjured Relay: Concussive Shot bounces x times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in y units around the target.
            this.ReimaginedConjuredRelayAddEnemy(projectile_handle, enemy);
        }

        // Reimagined: Brain Concussion: The main target hit by Concussive Shot is also affected by a x spell amp reduction for the duration of the slow.
        this.ReimaginedBrainConcussion(target);

        // Reimagined: Conjured Relay: Concussive Shot bounces x times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in y units around the target.
        this.ReimaginedConjuredRelay(projectile_handle);

        // Remove this projectile ID from the map
        this.projectile_map.delete(projectile_handle);
    }

    ReimaginedConjuredRelayMarker(main_target: CDOTA_BaseNPC): {remaining_bounces: number, main_target: CDOTA_BaseNPC, enemies_hit: Set<CDOTA_BaseNPC>}
    {
        let conjured_relay_info =
        {
            remaining_bounces: this.conjured_relay_bounce_count!,
            enemies_hit: new Set<CDOTA_BaseNPC>(),
            main_target: main_target
        };
        
        return conjured_relay_info;
    }

    ReimaginedConjuredRelayAddEnemy(projectile_handle: ProjectileID, enemy: CDOTA_BaseNPC)
    {
        // Find projectile ID
        if (this.projectile_map.has(projectile_handle))
        {
            // Fetchh relay info
            let conjured_relay_info = this.projectile_map.get(projectile_handle)!;

            // Add enemy to the set
            conjured_relay_info.enemies_hit.add(enemy);

            // Update map
            this.projectile_map.set(projectile_handle, conjured_relay_info);
        }
    }

    ReimaginedConjuredRelay(projectile_handle: ProjectileID)
    {
        // Find the projectile map
        if (this.projectile_map.has(projectile_handle))
        {            
            // Get the amount of bounces remaining
            const conjured_relay_info = this.projectile_map.get(projectile_handle)!;
            if (conjured_relay_info.remaining_bounces > 0)
            {
                // Remove a bounce
                conjured_relay_info.remaining_bounces--;

                const current_main_target = conjured_relay_info.main_target;

                // Search for an additional closest enemy that wasn't hit in this cast
                const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                  current_main_target.GetAbsOrigin(),
                                                  undefined,
                                                  this.conjured_relay_search_radius!,
                                                  UnitTargetTeam.ENEMY,
                                                  UnitTargetType.HERO + UnitTargetType.BASIC,
                                                  UnitTargetFlags.FOW_VISIBLE,
                                                  FindOrder.CLOSEST,
                                                  false);

                let new_main_target;
                for (const enemy of enemies)
                {
                    // If this enemy already exists in the set, move on to the next one
                    if (conjured_relay_info.enemies_hit.has(enemy)) continue;

                    new_main_target = enemy;
                    break;
                }

                if (new_main_target)
                {
                    conjured_relay_info.main_target = new_main_target;
                    this.LaunchConcussiveShot(current_main_target, new_main_target, conjured_relay_info, false);
                }
            }
        }
    }

    ReimaginedBrainConcussion(target: CDOTA_BaseNPC): void
    {
        if (target.IsMagicImmune()) return;

        if (target.HasModifier(modifier_reimagined_skywrath_mage_concussive_shot_slow.name))
        {
            const modifier = target.FindModifierByName(modifier_reimagined_skywrath_mage_concussive_shot_slow.name) as modifier_reimagined_skywrath_mage_concussive_shot_slow;
            if (modifier)
            {
                modifier.brain_concussion = true;
            }
        }
    }

    ReimaginedGhastlyEerie(target: CDOTA_BaseNPC): {radius: number, duration: number}
    {
        let effect_properties: {radius: number, duration: number} =
        {radius: this.slow_radius!,
        duration: this.slow_duration!};
        
        // Check if the target has Ancient Seal's debuff
        if (target.HasModifier("modifier_reimagined_skywrath_mage_ancient_seal_debuff"))
        {
            effect_properties.radius = effect_properties.radius * (1 + this.ghastly_eerie_radius_pct! * 0.01);
            effect_properties.duration = effect_properties.duration * (1 + this.ghastly_eerie_duration_pct! * 0.01);
        }

        return effect_properties;
    }
}