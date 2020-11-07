import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_void_stalking } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_void_stalking"
import { modifier_reimagined_night_stalker_void_debuff } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_void_debuff";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
import "../../../modifiers/heroes/night_stalker/modifier_reimagined_night_stalker_void_stalked"

@registerAbility()
export class reimagined_night_stalker_void extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Nightstalker.Void";
    rare_cast_response: string = "night_stalker_nstalk_ability_dark_08";
    cast_response: string[] = ["night_stalker_nstalk_ability_void_01", "night_stalker_nstalk_ability_void_02", "night_stalker_nstalk_ability_void_03", "night_stalker_nstalk_ability_void_04"];    
    particle_hit: string = "particles/units/heroes/hero_night_stalker/nightstalker_void_hit.vpcf";
    particle_hit_fx?: ParticleID

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_void_hit.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_night_stalker/nightstalker_void.vpcf", context);        
    }

    // Ability specials
    damage?: number;
    duration_day?: number;
    duration_night?: number;    
    ministun_duration?: number;
    radius_scepter?: number;
    scepter_ministun?: number;

    // Reimagined passive: Stalking: Night Stalker gains 15%/20%/25%/30% bonus movespeed while facing towards enemies affected by Void
    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_night_stalker_void_stalking.name;
    }

    GetBehavior(): AbilityBehavior
    {
        if (this.caster.HasScepter())
        {
            return AbilityBehavior.NO_TARGET;
        }

        return AbilityBehavior.UNIT_TARGET;
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget();        

        // Ability specials
        this.damage = this.GetSpecialValueFor("damage");
        this.duration_day = this.GetSpecialValueFor("duration_day");
        this.duration_night = this.GetSpecialValueFor("duration_night");
        this.ministun_duration = this.GetSpecialValueFor("ministun_duration");
        this.radius_scepter = this.GetSpecialValueFor("radius_scepter");
        this.scepter_ministun = this.GetSpecialValueFor("scepter_ministun");

        // Cast responses
        // Roll for rare response
        if (RollPercentage(5))
        {
            EmitSoundOn(this.rare_cast_response, this.caster);            
        }
        // Roll for standard response
        else if (RollPercentage(25))
        {
            EmitSoundOn(this.cast_response[RandomInt(0, this.cast_response.length -1)], this.caster);
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Standard cast        
        if (!this.caster.HasScepter())
        {
            // If the target has Linken's Sphere, trigger it and exit
            if (target!.GetTeamNumber() != this.caster.GetTeamNumber())
            {
                if (target!.TriggerSpellAbsorb(this))
                {
                    return;
                }
            }

            // Apply Void on target
            this.ApplyVoidOnEnemy(target!);
        }
        // Scepter cast: finds visible enemies in AoE around the caster and applies Void on them
        else
        {
            const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                              this.caster.GetAbsOrigin(),
                                              undefined,
                                              this.radius_scepter,
                                              this.GetAbilityTargetTeam(),                                              
                                              this.GetAbilityTargetType(),
                                              UnitTargetFlags.NO_INVIS + UnitTargetFlags.FOW_VISIBLE,
                                              FindOrder.ANY,
                                              false);

            // Apply Void on all targets                                              
            for (const enemy of enemies)
            {                
                this.ApplyVoidOnEnemy(enemy);
            }
        }
    }

    ApplyVoidOnEnemy(enemy: CDOTA_BaseNPC)
    {
        // Check if this is day or night
        const isDayTime = GameRules.IsDaytime();

        let should_ministun: boolean;
        let slow_duration: number;
        let stun_duration: number = 0;

        // Adjust values accordingly
        if (isDayTime)
        {
            should_ministun = false;
            slow_duration = this.duration_day!;
        }
        else
        {
            should_ministun = true;
            slow_duration = this.duration_night!;
            if (this.caster.HasScepter())
            {
                stun_duration = this.scepter_ministun!;
            }
            else
            {
                stun_duration = this.ministun_duration!;
            }
        }

        // Reimagination: Dead of Night: Increases Void's duration (among other things) during natural nights, based on distance from nighttime peak
        slow_duration = slow_duration + this.ReimaginationDeadOfNightVoid();

        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: this.damage!,
            damage_type: this.GetAbilityDamageType(),
            victim: enemy,
            ability: this,
            damage_flags: DamageFlag.NONE
        });
        
        // Play hit particle effect on target
        this.particle_hit_fx = ParticleManager.CreateParticle(this.particle_hit, ParticleAttachment.ABSORIGIN_FOLLOW, enemy);
        ParticleManager.SetParticleControl(this.particle_hit_fx, 0, enemy.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_hit_fx);

        // Apply stun, if feasible
        if (should_ministun)
        {
            enemy.AddNewModifier(this.caster, this, BuiltInModifier.STUN, {duration: stun_duration});            
        }

        // Apply Void on target
        enemy.AddNewModifier(this.caster, this, modifier_reimagined_night_stalker_void_debuff.name, {duration: slow_duration});
    }

    ReimaginationDeadOfNightVoid(): number
    {
        let bonus = 0;        
        // Check if the caster has any Dead of Night modifier
        if (this.caster.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name))
        {
            const modifier = this.caster.FindModifierByName(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name)
            if (modifier)
            {
                // Calculate bonuses from the modifier
                const supposed_bonus = (modifier as modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night).CalculateDurationBonuses();
                if (supposed_bonus && supposed_bonus > 0)
                {
                    bonus = supposed_bonus;
                }
            }
        }

        return bonus;
    }
}