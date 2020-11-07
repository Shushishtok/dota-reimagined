import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { reimagined_drow_ranger_frost_arrows } from "./reimagined_drow_ranger_frost_arrows"
import { modifier_reimagined_drow_ranger_frost_arrows_handler } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_handler"
import { modifier_reimagined_drow_ranger_multishot_endless_barrage } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_multishot_endless_barrage";
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_passive"
import { reimagined_drow_ranger_marksmanship } from "./reimagined_drow_ranger_marksmanship"

@registerAbility()
export class reimagined_drow_ranger_multishot extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();        
    sound_multishot: string = "Hero_DrowRanger.Multishot.Channel";
    sound_multishot_attack: string = "Hero_DrowRanger.Multishot.Attack";
    particle_multishot: string = "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf";    
    projectile_marksmanship_attack: string = "particles/heroes/drow_ranger/multishot_marksmanship_arrows.vpcf";
    initial_delay: number = 0.1;    
    arrows_fired_this_wave: number = 0;
    total_arrows_fired: number = 0;    
    cone_length: number = 0;
    time_to_release_wave: number = 0;
    waves: number = 0;
    current_wave: number = 1;    
    enemy_set: Set<CDOTA_BaseNPC> = new Set();        

    // Reimagined properties
    barrage_mode: boolean = false;    
    projectile_speed_bonus: number = 0;

    // Ability specials
    arrow_count?: number;
    arrow_damage_pct?: number;
    arrow_slow_duration?: number;
    arrow_width?: number;
    arrow_speed?: number;
    arrow_range_multiplier?: number;
    arrow_angle?: number;
    arrows_per_wave?: number;
    delay_between_waves?: number;

    // Reimagined specials
    quick_quiver_aspd?: number;
    quick_quiver_bonus_arrows?: number;
    endless_barrage_channel_time?: number;
    endless_barrage_delay_between_waves?: number;
    endless_barrage_mana_per_wave?: number;    
    thrilling_hunt_projectile_speed?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/multishot_marksmanship_arrows.vpcf", context);
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_drow_ranger_multishot_endless_barrage.name;
    }

    GetChannelTime(): number
    {
        // Reimagined: Endless Barrage: Can be set to auto cast to increase the max channel time to x seconds, firing a wave of arrows every y seconds. However, each wave drains z mana. Lasts until no mana is left to fire an additional wave, the channeling is interrupted, or the duration elapses.
        if (this.ReimaginedEndlessBarrage()) return this.GetSpecialValueFor("endless_barrage_channel_time");
        return super.GetChannelTime();
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.arrow_count = this.GetSpecialValueFor("arrow_count")
        this.arrow_damage_pct = this.GetSpecialValueFor("arrow_damage_pct")
        this.arrow_slow_duration = this.GetSpecialValueFor("arrow_slow_duration")
        this.arrow_width = this.GetSpecialValueFor("arrow_width")
        this.arrow_speed = this.GetSpecialValueFor("arrow_speed")
        this.arrow_range_multiplier = this.GetSpecialValueFor("arrow_range_multiplier")
        this.arrow_angle = this.GetSpecialValueFor("arrow_angle")
        this.arrows_per_wave = this.GetSpecialValueFor("arrows_per_wave")
        this.delay_between_waves = this.GetSpecialValueFor("delay_between_waves");

        // Reimagined specials
        this.quick_quiver_aspd = this.GetSpecialValueFor("quick_quiver_aspd");
        this.quick_quiver_bonus_arrows = this.GetSpecialValueFor("quick_quiver_bonus_arrows");
        this.endless_barrage_channel_time = this.GetSpecialValueFor("endless_barrage_channel_time");
        this.endless_barrage_delay_between_waves = this.GetSpecialValueFor("endless_barrage_delay_between_waves");
        this.endless_barrage_mana_per_wave = this.GetSpecialValueFor("endless_barrage_mana_per_wave");        
        this.thrilling_hunt_projectile_speed = this.GetSpecialValueFor("thrilling_hunt_projectile_speed");

        // Calculate waves
        this.waves = this.arrow_count! / this.arrows_per_wave;

        // Quick Quiver: For every x attack speed that Drow Ranger has, increases the amount of arrows fired in each wave by y.
        this.ReimaginedQuickQuiver();

        // Reimagined: Endless Barrage: Can be set to auto cast to increase the max channel time to x seconds, firing a wave of arrows every y seconds. However, each wave drains z mana. Lasts until no mana is left to fire an additional wave, the channeling is interrupted, or the duration elapses.
        this.ReimaginedEndlessBarrageAdjustValues();

        // Play multishot sound
        EmitSoundOn(this.sound_multishot, this.caster);        

        // Calculate cone length
        this.cone_length = this.arrow_angle * this.arrows_per_wave

        // Reset values
        this.arrows_fired_this_wave = 0;
        this.total_arrows_fired = 0;        
        this.time_to_release_wave = this.initial_delay;
        this.current_wave = 1;        
        this.projectile_speed_bonus = 0;
    }

    ReimaginedQuickQuiver(): void
    {
        // Calculate bonus arrows per wave
        const instances = Math.floor(this.caster.GetAttackSpeed() * 100 / this.quick_quiver_aspd!);        
        const bonus_arrows = instances * this.quick_quiver_bonus_arrows!;

        // Update the amount of arrows                
        this.arrows_per_wave! += bonus_arrows;
        this.arrow_count! += bonus_arrows * this.waves;

        // Adjust the delay to be shorter per wave to match the amount of arrows that need to come out
        this.delay_between_waves! -= (bonus_arrows * this.waves * FrameTime());        
    }

    ReimaginedEndlessBarrage(): boolean
    {
        if (this.caster.GetModifierStackCount(modifier_reimagined_drow_ranger_multishot_endless_barrage.name, this.caster) == 0)
        {
            return false;
        }

        return true;
    }

    ReimaginedEndlessBarrageAdjustValues(): void
    {
        // Check if we're in the Endless Barrage mode
        if (this.ReimaginedEndlessBarrage())
        {
            // Set the barrage mode flag on
            this.barrage_mode = true;

            // Increase the total amount of arrows to be fired
            this.arrow_count = 1000;
            this.waves = this.arrow_count / this.arrows_per_wave!;
            
            // Reduce delay
            this.delay_between_waves = this.endless_barrage_delay_between_waves;            

            // Reduce mana once
            this.ReimaginedEndlessBarrageManaSpend();
        }
        else
        {
            // Set barrage mode off
            this.barrage_mode = false;
        }
    }

    ReimaginedEndlessBarrageManaSpend(): void
    {        
        // Check if we're currently in Endless Barrage mode, ignore otherwise
        if (this.barrage_mode)
        {
            // Check if there's enough mana to spend; otherwise, stop the channel
            if (this.caster.GetMana() < this.endless_barrage_mana_per_wave!)
            {
                this.caster.InterruptChannel();
            }

            // Spend mana
            this.caster.SpendMana(this.endless_barrage_mana_per_wave!, this);
        }
    }   

    ReimaginedThrillingHunt(target: CDOTA_BaseNPC, extraData: {thrilling_hunt: boolean}): {bonus_damage: number, damage_flag: DamageFlag}
    {
        let bonus_damage = 0;
        let damage_flag = DamageFlag.NONE;

        // Increase projectile speed of arrows launched
        this.projectile_speed_bonus += this.thrilling_hunt_projectile_speed!;        

        // Check if this hit was a Marksmanship hit        
        if (extraData && extraData.thrilling_hunt)
        {
            // Find ability handle
            if (this.caster.HasAbility("reimagined_drow_ranger_marksmanship"))
            {
                const ability_handle = this.caster.FindAbilityByName("reimagined_drow_ranger_marksmanship") as reimagined_drow_ranger_marksmanship;
                if (ability_handle)
                {
                    // Add bonus damage 
                    bonus_damage = ability_handle.GetSpecialValueFor("bonus_damage");

                    // Add armor negation flag
                    damage_flag = DamageFlag.IGNORES_BASE_PHYSICAL_ARMOR;
                }
            }
        }

        // Return an object that includes the bonus damage and the damage flag
        return {bonus_damage: bonus_damage, damage_flag: damage_flag};
    }

    ReimaginedThrillingHuntMarksmanship(wave: number): boolean
    {        
        // Check if this is the first wave        
        if (wave != 1) return false;                

        // Check if Marksmanship is learned
        if (this.caster.HasModifier("modifier_reimagined_drow_ranger_marksmanship_passive"))
        {
            // Get the handle modifier for Marksmanship and check that it is enabled
            const modifier_handle = this.caster.FindModifierByName("modifier_reimagined_drow_ranger_marksmanship_passive") as modifier_reimagined_drow_ranger_marksmanship_passive;
            if (modifier_handle)
            {
                if (modifier_handle.marksmanship_enabled)
                {
                    return true;
                }
            }
        }

        return false;
    }

    GetChannelAnimation(): GameActivity
    {
        return GameActivity.DOTA_CHANNEL_ABILITY_3;
    }

    OnChannelFinish(interrupted: boolean): void
    {
        // Stop the multishot sound
        StopSoundOn(this.sound_multishot, this.caster);        
    }

    OnChannelThink(interval: number): void
    {                
        // Increment time
        this.time_to_release_wave -= interval;

        // If we still did not pass the initial delay, do nothing
        if (this.time_to_release_wave >= 0) return;

        // If all arrows were fired, do nothing        
        if (this.total_arrows_fired >= this.arrow_count!) return;

        // Increment values
        this.arrows_fired_this_wave++;
        this.total_arrows_fired++;

        // Reimagined: Thrilling Hunt: The first wave's arrows proc Marksmanship in addition to Frost Arrows slow. Hitting an enemy with an arrow increases the projectile speed of all remaining arrows by x.
        let projectile_effect = this.particle_multishot
        let extraData = {};        
        if (this.ReimaginedThrillingHuntMarksmanship(this.current_wave))
        {
            projectile_effect = this.projectile_marksmanship_attack;            
            extraData = {thrilling_hunt: true}
        }

        // Check if we're starting a new wave
        if (this.arrows_fired_this_wave == this.arrows_per_wave!)
        {            
            // Start a new wave
            this.current_wave++;
            this.enemy_set.clear();
            this.arrows_fired_this_wave = 0;
            this.time_to_release_wave = this.delay_between_waves!;

            // Reimagined: Endless Barrage: Can be set to auto cast to increase the max channel time to x seconds, firing a wave of arrows every y seconds. However, each wave drains z mana. Lasts until no mana is left to fire an additional wave, the channeling is interrupted, or the duration elapses.            
            this.ReimaginedEndlessBarrageManaSpend();
        }

        // Play attack sound
        EmitSoundOn(this.sound_multishot_attack, this.caster);        
        
        // Get direction
        const direction = this.caster.GetForwardVector();        
         
        // Calculate angle
        const current_angle = (this.cone_length / 2) + (this.arrow_angle! * (1 - this.arrows_fired_this_wave));        
        const qangle = QAngle(0, current_angle, 0);        

        // Calculate firing position
        const firing_direction = RotatePosition(Vector(0,0,0), qangle, direction);

        // Calculate distance and speed
        let distance = this.caster.Script_GetAttackRange() * this.arrow_range_multiplier! 
        let speed = this.arrow_speed! + this.projectile_speed_bonus;        

        ProjectileManager.CreateLinearProjectile(
        {
            Ability: this,
            EffectName: projectile_effect,
            ExtraData: extraData,
            Source: this.caster,
            bDrawsOnMinimap: false,
            bHasFrontalCone: false,
            bIgnoreSource: false,
            bProvidesVision: true,
            bVisibleToEnemies: true,
            fDistance: distance,
            fEndRadius: this.arrow_width!,
            fExpireTime: GameRules.GetGameTime() + 10,
            fMaxSpeed: undefined,
            fStartRadius: this.arrow_width!,
            iUnitTargetFlags: UnitTargetFlags.MAGIC_IMMUNE_ENEMIES,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iVisionRadius: 100,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vAcceleration: undefined,
            vSpawnOrigin: this.caster.GetAttachmentOrigin(this.caster.ScriptLookupAttachment(AttachLocation.ATTACK1)),
            vVelocity: (firing_direction * speed) as Vector
        });        
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: {thrilling_hunt: boolean}): void
    {
        // Does nothing if no target was hit
        if (!target) return;

        // Check if the target is already part of the set
        if (this.enemy_set.has(target)) return;

        // Add enemy to set
        this.enemy_set.add(target);

        // Calculate damage based on attack damage
        let damage = this.caster.GetAttackDamage() * this.arrow_damage_pct! * 0.01;
        let damage_flags = DamageFlag.NONE

        // Reimagined: Thrilling Hunt: The first wave's arrows proc Marksmanship in addition to Frost Arrows slow. Hitting an enemy with an arrow increases the projectile speed of all remaining arrows by x.
        const thrilling_hunt_object = this.ReimaginedThrillingHunt(target, extraData);
        if (thrilling_hunt_object && thrilling_hunt_object.bonus_damage && thrilling_hunt_object.damage_flag)
        {
            damage += thrilling_hunt_object.bonus_damage;
            damage_flags = thrilling_hunt_object.damage_flag;
        }

        // Deal physical damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            victim: target,
            ability: this,
            damage_flags: damage_flags
        });

        // Check magic immunity
        if (!target.IsMagicImmune())
        {
            // Check if Frost Arrows is learned
            if (this.caster.HasAbility(reimagined_drow_ranger_frost_arrows.name))
            {
                const frost_arrows_ability = this.caster.FindAbilityByName(reimagined_drow_ranger_frost_arrows.name);
                if (frost_arrows_ability && frost_arrows_ability.IsTrained())
                {
                    // Get the handle modifier attached to the Frost Arrows ability
                    if (this.caster.HasModifier(modifier_reimagined_drow_ranger_frost_arrows_handler.name))
                    {
                        const modifier_handler = this.caster.FindModifierByName(modifier_reimagined_drow_ranger_frost_arrows_handler.name) as modifier_reimagined_drow_ranger_frost_arrows_handler;
                        if (modifier_handler)
                        {
                            // Apply a Frost Arrow impact on the target
                            modifier_handler.ApplyFrostArrows(target, this.arrow_slow_duration!);
                        }
                    }
                }
            }
        }        
    }
}