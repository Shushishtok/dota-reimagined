import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_skywrath_mage_talent_7_debuff } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_talent_7_debuff"
import { modifier_reimagined_skywrath_mage_talent_8_buff } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_talent_8_buff"
import { SkywrathMageTalents } from "./reimagined_skywrath_mage_talents";

interface MysticFlareProperties
{
    position: Vector;
    duration: number;
    radius: number;
    damage: number;
    damage_interval: number;
    damage_per_interval: number;
    particle_mystic_flare_fx?: ParticleID;    
}

@registerAbility()
export class reimagined_skywrath_mage_mystic_flare extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    cast_responses: string[] = ["skywrath_mage_drag_mystic_flare_01", "skywrath_mage_drag_mystic_flare_02", "skywrath_mage_drag_mystic_flare_03", "skywrath_mage_drag_mystic_flare_04", "skywrath_mage_drag_mystic_flare_05"];
    sound_cast = "Hero_SkywrathMage.MysticFlare.Cast"        
    sound_scepter = "Hero_SkywrathMage.MysticFlare.Scepter";        
    sound_mystic_flare = "Hero_SkywrathMage.MysticFlare";
    sound_target = "Hero_SkywrathMage.MysticFlare.Target";
    particle_mystic_flare_ambient = "particles/heroes/skywrath_mage/skywrath_mage_mystic_flare_moving_ambient.vpcf";
    particle_hit = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_mystic_flare_ambient_hit.vpcf";
    mystic_flare_map: Map<number, MysticFlareProperties> = new Map();
    mystic_flare_counter = 0;

    // Ability specials
    duration?: number;
    scepter_radius?: number;    
    radius?: number;
    damage?: number;
    damage_interval?: number;

    // Reimagined specials
    mystical_bombardment_min_range?: number;
    mystical_bombardment_max_range?: number;    
    mystical_bombardment_hits_per_interval?: number;    
    mystical_bombardment_radius?: number;
    flare_divinity_search_radius?: number;
    flare_divinity_move_speed?: number;
    high_mage_duration_per_int_pct?: number;
    high_mage_max_duration_reduction_pct?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/skywrath_mage/skywrath_mage_mystic_flare_moving_ambient.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_mystic_flare_ambient_hit.vpcf", context);        
    }

    GetAOERadius(): number
    {
        return this.GetSpecialValueFor("radius");
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target_position = this.GetCursorPosition();

        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");
        this.scepter_radius = this.GetSpecialValueFor("scepter_radius");
        this.radius = this.GetSpecialValueFor("radius");
        this.damage = this.GetSpecialValueFor("damage");
        this.damage_interval = this.GetSpecialValueFor("damage_interval");

        // Reimagined specials
        this.mystical_bombardment_min_range = this.GetSpecialValueFor("mystical_bombardment_min_range");
        this.mystical_bombardment_max_range = this.GetSpecialValueFor("mystical_bombardment_max_range");
        this.mystical_bombardment_hits_per_interval = this.GetSpecialValueFor("mystical_bombardment_hits_per_interval");        
        this.mystical_bombardment_radius = this.GetSpecialValueFor("mystical_bombardment_radius");
        this.flare_divinity_search_radius = this.GetSpecialValueFor("flare_divinity_search_radius");
        this.flare_divinity_move_speed = this.GetSpecialValueFor("flare_divinity_move_speed");
        this.high_mage_duration_per_int_pct = this.GetSpecialValueFor("high_mage_duration_per_int_pct");
        this.high_mage_max_duration_reduction_pct = this.GetSpecialValueFor("high_mage_max_duration_reduction_pct");

        // Roll for a cast response
        if (RollPercentage(75))
        {
            EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length -1)], this.caster);
        }
    
        // Play cast sound
        EmitSoundOnLocationWithCaster(target_position, this.sound_cast, this.caster);     
    
        // Add a mystic flare
        this.AddNewMysticFlare(target_position);

        // Talent: Divine Flight:  When casting Mystic Flare, Skywrath Mage gains flying movement for x seconds. Doesn't grant flying vision.
        this.ReimaginedTalentDivineFlight();

        // Scepter effect: cast Mystic Flare on a nearby target that is further then the radius of the initial target. Priotizes heroes. 
        if (this.caster.HasScepter())
        {
            const enemy_heroes = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                   target_position,
                                                   undefined,
                                                   this.scepter_radius,
                                                    UnitTargetTeam.ENEMY,
                                                    UnitTargetType.HERO,
                                                    UnitTargetFlags.NOT_CREEP_HERO + UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                                    FindOrder.ANY,
                                                    false);

            for (const enemy_hero of enemy_heroes)
            {
                // Check if hero is outside the radius
                if (util.CalculateDistanceBetweenPoints(enemy_hero.GetAbsOrigin(), target_position) > this.radius)
                {
                    // Apply Mystic Flare on its position and exit
                    this.AddNewMysticFlare(enemy_hero.GetAbsOrigin());
                    return;
                }
            }

            // We didn't find an eligible hero - check for creeps instead
            const enemy_creeps = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                   target_position,
                                                   undefined,
                                                   this.scepter_radius,
                                                   UnitTargetTeam.ENEMY,
                                                   UnitTargetType.BASIC,
                                                   UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                                   FindOrder.ANY,
                                                   false);

            for (const enemy_creep of enemy_creeps)
            {
                // Check if the creep is outside the radius
                if (util.CalculateDistanceBetweenPoints(enemy_creep.GetAbsOrigin(), target_position) > this.radius)
                {
                    // Apply Mystic Flare on its position and exit
                    this.AddNewMysticFlare(enemy_creep.GetAbsOrigin());
                    return;
                }
            }                                                 
        }
    }

    AddNewMysticFlare(target_position: Vector)
    {
        // Increment counter for the next Mystic Flare casts
        this.mystic_flare_counter++;

        let duration = this.duration!;
        duration = this.ReimaginedSkywrathHighMage();        

        // Bundle the properties
        const mystic_flare_properties: MysticFlareProperties = 
        {
            position: target_position,
            damage: this.damage!,
            damage_interval: this.damage_interval!,
            duration: duration,
            particle_mystic_flare_fx: undefined,
            radius: this.radius!,            
            damage_per_interval: this.damage! / duration * this.damage_interval!
        };

        // Insert mystic flare into map
        this.mystic_flare_map.set(this.mystic_flare_counter, mystic_flare_properties);

        // Apply a mystic flare!
        this.ActivateMysticFlare(this.mystic_flare_counter);        
    }

    ActivateMysticFlare(mystic_flare_ID: number)
    {
        // Play cast sound
        EmitSoundOnLocationWithCaster(this.caster.GetAbsOrigin(), this.sound_mystic_flare, this.caster); 

        // Unpack the map        
        if (this.mystic_flare_map.has(mystic_flare_ID))
        {
            let properties = this.mystic_flare_map.get(mystic_flare_ID)!;

            // Add particle effect
            properties.particle_mystic_flare_fx = ParticleManager.CreateParticle(this.particle_mystic_flare_ambient, ParticleAttachment.WORLDORIGIN, undefined);        
            ParticleManager.SetParticleControl(properties.particle_mystic_flare_fx, 0 , properties.position);
            ParticleManager.SetParticleControl(properties.particle_mystic_flare_fx, 1, Vector(properties.radius, properties.duration, properties.damage_interval));            

            // Update the map with the new particle ID
            this.mystic_flare_map.set(mystic_flare_ID, properties);

            // Start thinking!
            this.MysticFlareThink(mystic_flare_ID);

            // Reimagined: Flare of Divinity: Mystic Flare automatically moves towards the closest hero in x range of its center, moving at y speed. 
            this.ReimaginedFlareOfDivinity(mystic_flare_ID);

            // Talent: Null Field: Mystic Flare now adds the Leashed state to all enemy units in the initial AoE, preventing usage of movement abilities until leaving the AoE.
            this.ReimaginedTalentNullField(properties, mystic_flare_ID);
        }
    }

    MysticFlareThink(mystic_flare_ID: number): void
    {
        // Unpack the map
        if (this.mystic_flare_map.has(mystic_flare_ID))
        {
            const properties = this.mystic_flare_map.get(mystic_flare_ID)!;
            let elapsed_duration = 0
            Timers.CreateTimer(properties.damage_interval, () => 
            {                    
                // Increment elapsed time
                elapsed_duration += properties.damage_interval;

                // Reimagined: Mystical Bombardment: Also fires small instances of Mystic Flare in random locations up between x and y around the target point, dealing an instance damage to all enemies in a z radius where it landed. Damage is distributed evenly between enemies in the hit radius.
                this.ReimaginedMysticalBombardment(properties);   

                // Apply a damage instance
                this.MysticFlareDamageInstance(properties);

                // Check if this timer should repeat
                if (elapsed_duration >= properties.duration)
                {
                    // Apply end effects
                    this.EndMysticFlare(mystic_flare_ID, properties);

                    // Stop thinking
                    return undefined;
                }
                else
                {
                    // Repeat!
                    return properties.damage_interval;
                }
            });
        }
    }

    MysticFlareDamageInstance(properties: MysticFlareProperties)
    {
        // Find all enemy heroes in the radius
        let enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        properties.position,
                                        undefined,
                                        properties.radius,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.HERO,
                                        UnitTargetFlags.NOT_ILLUSIONS + UnitTargetFlags.NOT_CREEP_HERO,
                                        FindOrder.ANY,
                                        false);

        // If no enemy heroes found, find all creeps in the radius
        if (enemies.length == 0)
        {
            enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        properties.position,
                                        undefined,
                                        properties.radius,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.BASIC,
                                        UnitTargetFlags.NOT_CREEP_HERO,
                                        FindOrder.ANY,
                                        false);
        }

        // If at least one enemy was found...
        if (enemies.length > 0)
        {
            // ...Calculate damage for this instance based on how many enemies were found
            const actual_damage_this_instance = properties.damage_per_interval / enemies.length;

            for (const enemy of enemies)
            {
                // Deal damage for each enemy            
                ApplyDamage(
                {
                    attacker: this.caster,
                    damage: actual_damage_this_instance,
                    damage_type: this.GetAbilityDamageType(),
                    victim: enemy,
                    ability: this,
                    damage_flags: DamageFlag.NONE
                });

                // Play hit sound    
                EmitSoundOn(this.sound_target, enemy);
            }
        }
    }

    EndMysticFlare(mystic_flare_ID: number, properties: MysticFlareProperties)
    {
        // Release particle
        ParticleManager.ReleaseParticleIndex(properties.particle_mystic_flare_fx!);

        // Remove instance from map
        this.mystic_flare_map.delete(mystic_flare_ID);
    }

    ReimaginedMysticalBombardment(properties: MysticFlareProperties)
    {
        for (let index = 0; index < this.mystical_bombardment_hits_per_interval!; index++) 
        {            
            // Determine a random position around the target point
            const random_position = util.GenerateRandomPositionAroundPosition(properties.position, this.mystical_bombardment_min_range!, this.mystical_bombardment_max_range!);

            // Play particle at position
            const particle_hit_fx = ParticleManager.CreateParticle(this.particle_hit, ParticleAttachment.WORLDORIGIN, undefined);
            ParticleManager.SetParticleControl(particle_hit_fx, 0, random_position);
            ParticleManager.ReleaseParticleIndex(particle_hit_fx);

            // Find all enemy heroes in the radius
            let enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                            random_position,
                                            undefined,
                                            this.mystical_bombardment_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO,
                                            UnitTargetFlags.NOT_ILLUSIONS + UnitTargetFlags.NOT_CREEP_HERO,
                                            FindOrder.ANY,
                                            false);

            // If no enemy heroes found, find all creeps in the radius
            if (enemies.length == 0)
            {
                enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                            random_position,
                                            undefined,
                                            this.mystical_bombardment_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.BASIC,
                                            UnitTargetFlags.NOT_CREEP_HERO,
                                            FindOrder.ANY,
                                            false);
            }

            // If at least one enemy was found...
            if (enemies.length > 0)
            {
                // ...Calculate damage for this instance based on how many enemies were found
                const actual_damage_this_instance = properties.damage_per_interval / enemies.length;

                for (const enemy of enemies)
                {
                    // Deal damage for each enemy            
                    ApplyDamage(
                    {
                        attacker: this.caster,
                        damage: actual_damage_this_instance,
                        damage_type: this.GetAbilityDamageType(),
                        victim: enemy,
                        ability: this,
                        damage_flags: DamageFlag.NONE
                    });

                    // Play hit sound    
                    EmitSoundOn(this.sound_target, enemy);
                }
            }
        }        
    }

    ReimaginedFlareOfDivinity(mystic_flare_ID: number): void
    {
        // Unpack the map
        if (this.mystic_flare_map.has(mystic_flare_ID))
        {
            let properties = this.mystic_flare_map.get(mystic_flare_ID)!;
            Timers.CreateTimer(properties.damage_interval, () => 
            {
                // Check that the map wasn't deleted due to expiration
                if (!this.mystic_flare_map.has(mystic_flare_ID)) return undefined;

                // Scan for nearby enemies
                const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                  properties.position,
                                                  undefined,
                                                  this.flare_divinity_search_radius!,
                                                  UnitTargetTeam.ENEMY,
                                                  UnitTargetType.HERO + UnitTargetType.BASIC,
                                                  UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                                  FindOrder.CLOSEST,
                                                  false);

                if (enemies.length > 0)
                {
                    // Move towards the closest enemy found if the distance is above a minimum
                    const enemy_pos = enemies[0].GetAbsOrigin();

                    if (util.CalculateDistanceBetweenPoints(enemy_pos, properties.position) > 50)
                    {
                        // Get direction
                        const direction = util.CalculateDirectionToPosition(properties.position, enemy_pos);
                        
                        // Calculate move speed per frame
                        const speed = this.flare_divinity_move_speed! * FrameTime();
    
                        // Get new position
                        const new_pos: Vector = (properties.position + direction * speed) as Vector;
    
                        // Update particle position
                        ParticleManager.SetParticleControl(properties.particle_mystic_flare_fx!, 0, new_pos);
    
                        // Update the map
                        properties.position = new_pos;
                        if (this.mystic_flare_map.has(mystic_flare_ID))
                        {
                            this.mystic_flare_map.set(mystic_flare_ID, properties);
                        }
                    }

                    return FrameTime();
                }
            });
        }
    }

    ReimaginedSkywrathHighMage(): number
    {
        let duration = this.duration!;

        // Calculate reduction percentage
        let duration_reduction_pct = (this.caster as CDOTA_BaseNPC_Hero).GetIntellect() * this.high_mage_duration_per_int_pct!;
        
        // Limit duration reduction
        if (duration_reduction_pct > this.high_mage_max_duration_reduction_pct!)
        {
            duration_reduction_pct = this.high_mage_max_duration_reduction_pct!;
        }

        // Calculate actual duration
        duration = duration * (1 - duration_reduction_pct * 0.01);
        return duration;
    }

    ReimaginedTalentNullField(properties: MysticFlareProperties, mystic_flare_ID: number)
    {
        if (util.HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_7))
        {
            // Find all enemies in the initial AoE
            const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                properties.position,
                                                undefined,
                                                this.radius!,
                                                UnitTargetTeam.ENEMY,
                                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                                UnitTargetFlags.NONE,
                                                FindOrder.ANY,
                                                false);
            
            // Give them the leashed modifier
            for (const enemy of enemies)
            {
                enemy.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_talent_7_debuff.name, {duration: properties.duration, mystic_flare_ID: mystic_flare_ID});    
            }
        }
    }

    ReimaginedTalentDivineFlight(): void
    {
        if (util.HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_8))
        {
            const talent_duration = util.GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_8, "duration");
            this.caster.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_talent_8_buff.name, {duration: talent_duration});
        }
    }
}