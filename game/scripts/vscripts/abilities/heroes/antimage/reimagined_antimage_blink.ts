import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_antimage_blink_magic_nullity } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_blink_magic_nullity";


@registerAbility()
export class reimagined_antimage_blink extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();    
    sound_blink_out: string = "Hero_Antimage.Blink_out";
    sound_blink_in: string = "Hero_Antimage.Blink_in";    
    particle_blink_start: string = "particles/units/heroes/hero_antimage/antimage_blink_start.vpcf";
    particle_blink_start_fx?: ParticleID;
    particle_blink_end: string = "particles/units/heroes/hero_antimage/antimage_blink_end.vpcf";
    particle_blink_end_fx?: ParticleID;
    particle_interference: string = "particles/econ/items/antimage/antimage_weapon_basher_ti5/am_manaburn_basher_ti_5.vpcf";
    particle_interference_fx?: ParticleID;

    // Ability specials
    blink_range?: number;

    // Reimagined specials
    reaction_radius?: number;
    interference_radius?: number;
    interference_curr_mana_rdct_pct?: number;
    magic_nullity_duration?: number;


    OnSpellStart(): void
    {
        // Ability properties
        const target_position = this.GetCursorPosition();
        const direction = util.CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target_position);
        const original_caster_position = this.caster.GetAbsOrigin();

        // Ability specials
        this.blink_range = this.GetSpecialValueFor("blink_range");

        // Reimagined specials
        this.reaction_radius = this.GetSpecialValueFor("reaction_radius");
        this.interference_radius = this.GetSpecialValueFor("interference_radius");
        this.interference_curr_mana_rdct_pct = this.GetSpecialValueFor("interference_curr_mana_rdct_pct");
        this.magic_nullity_duration = this.GetSpecialValueFor("magic_nullity_duration");

        // Disjoint projectile
        ProjectileManager.ProjectileDodge(this.caster);        

        // Check distance and calculate Blink position accordingly
        const distance = util.CalculateDistanceBetweenPoints(this.caster.GetAbsOrigin(), target_position);
        let blink_pos: Vector;
        if (distance < this.blink_range)
        {
            blink_pos = (this.caster.GetAbsOrigin() + direction * distance) as Vector;
        }
        else
        {
            blink_pos = (this.caster.GetAbsOrigin() + direction * this.blink_range) as Vector;
        }

        // Play blink out sound
        EmitSoundOn(this.sound_blink_out, this.caster);

        // Play blink start particle
        this.particle_blink_start_fx = ParticleManager.CreateParticle(this.particle_blink_start, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_blink_start_fx, 0, original_caster_position);
        ParticleManager.ReleaseParticleIndex(this.particle_blink_start_fx);

        // Set caster at blink position
        this.caster.SetAbsOrigin(blink_pos);
        FindClearSpaceForUnit(this.caster, blink_pos, true);
        ResolveNPCPositions(blink_pos, this.caster.GetHullRadius());

        // Play blink in sound
        EmitSoundOn(this.sound_blink_in, this.caster);

        // Play blink end particle
        this.particle_blink_end_fx = ParticleManager.CreateParticle(this.particle_blink_end, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControl(this.particle_blink_end_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_blink_end_fx);

        // Reimagination Reaction: Causes enemies in the area of Anti Mage's Blink to issue a Stop command around the destination position.
        this.ReimaginationReaction();

        // Reimagination: Interference: Removes a percentage of the nearby enemies' current mana on the start and end positions.
        this.ReimaginationInterference(original_caster_position);

        // Reimagination: Magic Nullity: Increases the caster's Magic Resistance for a duration after blinking.
        this.ReimaginationMagicNullity();
    }

    ReimaginationReaction()
    {
        // Find enemies around the caster
        const enemies = util.FindUnitsAroundUnit(this.caster,
                                                 this.caster,
                                                 this.reaction_radius!,
                                                 UnitTargetTeam.ENEMY,
                                                 UnitTargetType.HERO + UnitTargetType.BASIC,
                                                 UnitTargetFlags.NONE)
        
        // Issue a stop command for every enemy
        for (const enemy of enemies)
        {
            enemy.Stop();   
        }                                                 
    }

    ReimaginationInterference(start_pos: Vector)
    {
        // Find enemies in both start and end positions
        const enemies_start = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                start_pos,
                                                undefined,
                                                this.interference_radius!,
                                                UnitTargetTeam.ENEMY,
                                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                                UnitTargetFlags.MANA_ONLY,
                                                FindOrder.ANY,
                                                false);

        const enemies_end = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                this.caster.GetAbsOrigin(),
                                                undefined,
                                                this.interference_radius!,
                                                UnitTargetTeam.ENEMY,
                                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                                UnitTargetFlags.MANA_ONLY,
                                                FindOrder.ANY,
                                                false);                    
             
        // Combine the arrays
        const enemies = enemies_start.concat(enemies_end);

        for (const enemy of enemies)
        {
            // Play particle effect on enemies
            this.particle_interference_fx = ParticleManager.CreateParticle(this.particle_interference, ParticleAttachment.ABSORIGIN_FOLLOW, enemy);
            ParticleManager.SetParticleControl(this.particle_interference_fx, 0, enemy.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_interference_fx);

            // Remove a portion of the current mana that the enemy has, if any
            if (enemy.GetMana() > 0)
            {
                const mana_burn = enemy.GetMana() * this.interference_curr_mana_rdct_pct! * 0.01;
                enemy.ReduceMana(mana_burn);
                
                // Deal mana burn as physical damage                
                ApplyDamage(
                {
                    attacker: this.caster,
                    damage: mana_burn,
                    damage_type: this.GetAbilityDamageType(),
                    victim: enemy,
                    ability: this,
                    damage_flags: DamageFlag.NONE
                });
            }
        }
    }

    ReimaginationMagicNullity()
    {
        // Apply magic resistance modifier to caster
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_antimage_blink_magic_nullity.name, {duration: this.magic_nullity_duration!});
    }
}