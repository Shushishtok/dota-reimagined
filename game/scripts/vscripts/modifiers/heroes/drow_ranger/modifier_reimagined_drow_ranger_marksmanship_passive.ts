import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_drow_ranger_marksmanship_agility_buff } from "./modifier_reimagined_drow_ranger_marksmanship_agility_buff";
import { modifier_reimagined_drow_ranger_frost_arrows_handler } from "./modifier_reimagined_drow_ranger_frost_arrows_handler";
import "./modifier_reimagined_drow_ranger_marksmanship_pride_drow";
import "./modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost"
import "../../general_mechanics/modifier_reimagined_negate_armor";

@registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_hit_target: string = "Hero_DrowRanger.Marksmanship.Target";
    particle_start: string = "particles/units/heroes/hero_drow/drow_marksmanship_start.vpcf";
    particle_start_fx?: ParticleID;
    particle_marksmanship: string = "particles/units/heroes/hero_drow/drow_marksmanship.vpcf"
    particle_marksmanship_fx?: ParticleID;    
    base_projectile: string = "particles/units/heroes/hero_drow/drow_base_attack.vpcf"
    projectile_frost: string = "particles/units/heroes/hero_drow/drow_frost_arrow.vpcf";
    marksmanship_enabled: boolean = true;
    proc_attack = false;
    first_time: boolean = true;
    projectile_map: Map<number, boolean> = new Map();

    // Reimagined properties    
    last_attack_time: number = 0;    
    ambush_forest_guaranteed_proc: boolean = false;

    // Modifier specials
    chance?: number;
    bonus_damage?: number;    
    agility_range?: number;
    split_count_scepter?: number;
    scepter_range?: number;
    damage_reduction_scepter?: number;
    disable_range?: number;    

    // Reimagined specials
    ambush_forest_no_attack_period?: number;
    ranger_frost_disable_distance_decrease?: number;
    ranger_frost_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        this.GetAbilitySpecials();

        if (!IsServer()) return;

        // Check if the caster has the projectile handler modifier: if not, add it
        if (!this.parent.HasModifier("modifier_reimagined_drow_ranger_projectile_handler"))
        {
            this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_drow_ranger_projectile_handler", {});
        }

        // Reimagined: Ambush from the Forests: While Marksmanship is active and Drow Ranger did not attack for x seconds, Drow Ranger's next arrow is guaranteed to proc.
        this.ReimaginedAmbushFromTheForestInitialize();

        // Start thinking, enable Marksmanship, and roll for proc
        this.StartIntervalThink(0.1);
        this.EnableMarksmanship();
        this.RollForMarksmanship();        
    }

    GetAbilitySpecials()
    {
        // Modifier specials
        this.chance = this.ability.GetSpecialValueFor("chance")
        this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage")        
        this.agility_range = this.ability.GetSpecialValueFor("agility_range")
        this.split_count_scepter = this.ability.GetSpecialValueFor("split_count_scepter")
        this.scepter_range = this.ability.GetSpecialValueFor("scepter_range")
        this.damage_reduction_scepter = this.ability.GetSpecialValueFor("damage_reduction_scepter")
        this.disable_range = this.ability.GetSpecialValueFor("disable_range")

        // Reimagined specials
        this.ambush_forest_no_attack_period = this.ability.GetSpecialValueFor("ambush_forest_no_attack_period");
        this.ranger_frost_disable_distance_decrease = this.ability.GetSpecialValueFor("ranger_frost_disable_distance_decrease");
        this.ranger_frost_duration = this.ability.GetSpecialValueFor("ranger_frost_duration");
    }

    OnRefresh(): void
    {        
        this.GetAbilitySpecials();
    }

    OnIntervalThink(): void
    {
        // Reimagined: Ambush from the Forests: While Marksmanship is active and Drow Ranger did not attack for x seconds, Drow Ranger's next arrow is guaranteed to proc.
        this.ReimaginedAmbushFromTheForest();

        // Reimagined: Pride of the Drow!: Can be activated to prevent Marksmanship being disabled by nearby enemies for x seconds. Has a cooldown of y seconds.
        if (this.ReimaginedPrideOfTheDrow()) return;

        let disable_distance = this.disable_range!;
        // Ranger of Frost: Hitting targets with Marksmanship that are afflicted with Frost Arrows grants Drow Ranger's stacks to Ranger of Frost. Each stack increases Drow Ranger's attack speed by x, her projectile speed by y, and decreases the distance where Marksmanship is disabled by z. Stacks infinitely and refreshes itself. Lasts v seconds.
        disable_distance -= this.ReimaginedRangerOfFrostRangeDecrease();

        // Check for nearby enemies
        const enemies = util.FindUnitsAroundUnit(this.parent,
                                            disable_distance,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO,
                                            UnitTargetFlags.NOT_ILLUSIONS + UnitTargetFlags.INVULNERABLE + UnitTargetFlags.OUT_OF_WORLD + UnitTargetFlags.NOT_CREEP_HERO + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES)

        // If there is an enemy and Marksmanship is enabled, disable Marksmanship
        if (enemies.length > 0)
        {
            if (this.marksmanship_enabled)
            {
                this.DisableMarksmanship();
            }
        }
        else
        {            
            // Otherwise, if Marksmanship is disabled, enable it.
            if (!this.marksmanship_enabled)
            {                                
                this.EnableMarksmanship();
            }
        }
    }    

    DisableMarksmanship(): void
    {
        this.marksmanship_enabled = false;

        // Remove particles
        ParticleManager.DestroyParticle(this.particle_marksmanship_fx!, false);
        ParticleManager.ReleaseParticleIndex(this.particle_marksmanship_fx!)
        this.particle_marksmanship_fx = undefined;
    }

    EnableMarksmanship(): void
    {
        this.marksmanship_enabled = true;

        // Apply particles
        this.particle_start_fx = ParticleManager.CreateParticle(this.particle_start, ParticleAttachment.ABSORIGIN, this.parent);
        ParticleManager.SetParticleControl(this.particle_start_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_start_fx);

        this.particle_marksmanship_fx = ParticleManager.CreateParticle(this.particle_marksmanship, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_marksmanship_fx, 0, this.parent.GetAbsOrigin())
        ParticleManager.SetParticleControl(this.particle_marksmanship_fx, 2, Vector(2,0,0));
        ParticleManager.SetParticleControl(this.particle_marksmanship_fx, 3, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_marksmanship_fx, 5, this.parent.GetAbsOrigin());
    }

    IsAura(): boolean
    {
        if (!this.marksmanship_enabled || this.parent.PassivesDisabled()) return false;

        return true
    }

    IsAuraActiveOnDeath() {return false}
    GetAuraDuration() {return 0.5}
    GetAuraRadius() {return this.agility_range!}
    GetAuraSearchFlags() {return UnitTargetFlags.INVULNERABLE}
    GetAuraSearchTeam() {return UnitTargetTeam.FRIENDLY}
    GetAuraSearchType() {return UnitTargetType.HERO}
    GetModifierAura() {return modifier_reimagined_drow_ranger_marksmanship_agility_buff.name}    
    GetAuraEntityReject(target: CDOTA_BaseNPC): boolean
    {
        if (target.IsRangedAttacker()) return false;
        return true;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_START,
                ModifierFunction.ON_ATTACK_RECORD,                  
                ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.ON_ATTACK_RECORD_DESTROY,                
                ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL,                
                ModifierFunction.IGNORE_PHYSICAL_ARMOR]
    }

    RollForMarksmanship(): void
    {
        // Roll chance to fire a Marksmanship proc on the next attack       
        if (this.ambush_forest_guaranteed_proc || RollPercentage(this.chance!))
        {            
            this.proc_attack = true;
        }
        else
        {                        
            this.proc_attack = false;
        }
    }    

    OnAttackRecord(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;        

        // Only apply on attacks coming from the parent
        if (event.attacker != this.parent) return;

        // Does nothing if the parent is either broken or the ability isn't active
        if (!this.marksmanship_enabled || this.parent.PassivesDisabled()) return;

        // Record the attack with the proc in it        
        this.projectile_map.set(event.record, this.proc_attack);     

        // Reimagined: Ambush from the Forests: While Marksmanship is active and Drow Ranger did not attack for x seconds, Drow Ranger's next arrow is guaranteed to proc.
        // Reset values from the reimagination
        this.ReimaginedAmbushFromTheForestReset();

        // Roll for the next attack
        this.RollForMarksmanship();
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;        

        // Only apply on attacks coming from the parent
        if (event.attacker != this.parent) return;        

        // Only apply on actual attacks: performed attacks are not counted
        if (event.no_attack_cooldown) return;

        if (this.projectile_map.has(event.record))
        {
            if (this.projectile_map.get(event.record))
            {
                // Play hit sound
                EmitSoundOn(this.sound_hit_target, event.target);

                // Ignore armor
                event.target.AddNewModifier(this.caster, this.ability, GenericModifier.IGNORE_ARMOR, {duration: FrameTime()});
            }

            // Ranger of Frost: Hitting targets with Marksmanship that are afflicted with Frost Arrows grants Drow Ranger's stacks to Ranger of Frost. Each stack increases Drow Ranger's attack speed by x, her projectile speed by y, and decreases the distance where Marksmanship is disabled by z. Stacks infinitely and refreshes itself. Lasts v seconds.
            this.ReimaginedRangerOfFrost(event.target);
        }

        // Scepter effect: Splinter: Check if caster has scepter
        if (this.parent.HasScepter())
        {            
            let enemies_found = 0;
            // Find two enemies that aren't the main target
            const enemies = FindUnitsInRadius(this.parent.GetTeamNumber(),
                                             event.target.GetAbsOrigin(),
                                             undefined,
                                             this.scepter_range!,
                                             UnitTargetTeam.ENEMY,
                                             UnitTargetType.HERO + UnitTargetType.BASIC,
                                             UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                             FindOrder.ANY, 
                                             false);

            // If Drow has Frost Arrows set to auto cast, change projectile to Frost Arrows and spend mana
            let projectile_name = this.base_projectile;
            if (this.parent.HasModifier("modifier_reimagined_drow_ranger_frost_arrows_handler"))
            {
                const modifier_frost_arrows = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_frost_arrows_handler") as modifier_reimagined_drow_ranger_frost_arrows_handler;
                if (modifier_frost_arrows)
                {
                    if (modifier_frost_arrows.FiresFrostProjectiles())
                    {                        
                        projectile_name = this.projectile_frost;
                        modifier_frost_arrows.GetAbility()!.UseResources(true, false, false);
                    }
                }
            }            

            for (const enemy of enemies)
            {
                // Ignore the main target
                if (enemy == event.target) continue;    

                // If we already found two enemies to fire at, stop
                if (enemies_found >= this.split_count_scepter!) return;                
                
                // Create tracking projectile using Drow's base/frost projectile
                ProjectileManager.CreateTrackingProjectile(
                    {
                        Ability: this.ability,
                        EffectName: projectile_name,
                        ExtraData: {},
                        Source: event.target,
                        Target: enemy,
                        bDodgeable: true,
                        bDrawsOnMinimap: false,
                        bIsAttack: false,
                        bProvidesVision: false,
                        bReplaceExisting: false,
                        bVisibleToEnemies: true,
                        flExpireTime: GameRules.GetGameTime() + 10,
                        iMoveSpeed: this.parent.GetProjectileSpeed(),
                        iSourceAttachment: event.target.ScriptLookupAttachment(AttachLocation.HITLOC),
                        vSourceLoc: event.target.GetAbsOrigin()
                    }
                );

                enemies_found++;
            }                            
        }                
    }

    OnAttackRecordDestroy(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply on attacks coming from the parent
        if (event.attacker != this.parent) return;        

        // Delete the record
        if (this.projectile_map.has(event.record))
        {            
            this.projectile_map.delete(event.record);
        }
    }

    GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number
    {        
        if (this.projectile_map.has(event.record))
        {            
            if (this.projectile_map.get(event.record))
            {                
                return this.bonus_damage!;
            }
        }        

        return 0;
    }    

    FiresMarksmanshipArrow(): boolean
    {
        // Check if this is going to be a Marksmanship arrow
        if (this.proc_attack && this.marksmanship_enabled && !this.parent.PassivesDisabled())
        {                       
            return true;
        }
        
        return false;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> | undefined
    {
        if (this.proc_attack)
        {
            return {[ModifierState.CANNOT_MISS]: true}
        }
    }

    ReimaginedPrideOfTheDrow(): boolean
    {
        // Check if the parent has the Pride of the Drow modifier
        if (this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_pride_drow"))
        {
            // If so, check if Marksmanship is currently enabled
            if (!this.marksmanship_enabled)
            {
                // If not, enable it
                this.EnableMarksmanship();
            }    
    
            // Either way, return true to ignore the rest of the interval check
            return true;
        }

        return false;
    }   

    ReimaginedAmbushFromTheForestInitialize(): void
    {
        this.last_attack_time = GameRules.GetGameTime();
    }

    ReimaginedAmbushFromTheForest(): void
    {
        // If we're already guaranteed a proc, no need to do anything else
        if (this.ambush_forest_guaranteed_proc) return;

        // Check the time elapsed between last attack time and current time
        const current_time = GameRules.GetGameTime();        
        if (current_time - this.last_attack_time > this.ambush_forest_no_attack_period!)
        {
            this.ambush_forest_guaranteed_proc = true;

            // Reroll the proc to guarantee it, if it's not already proccing
            if (!this.proc_attack) this.RollForMarksmanship();
        }
    }

    ReimaginedAmbushFromTheForestReset(): void
    {
        // Reset both variables
        this.last_attack_time = GameRules.GetGameTime();
        this.ambush_forest_guaranteed_proc = false;
    }

    ReimaginedRangerOfFrost(target: CDOTA_BaseNPC): void
    {
        // Check if the target is afflicted with Frost Arrrows' slow after a frame
        Timers.CreateTimer(FrameTime(), () =>
        {

            if (target.HasModifier("modifier_reimagined_drow_ranger_frost_arrows_slow"))
            {            
                // Add Ranger of Frost if target doesn't have it already
                if (!this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost"))   
                {                
                    this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost", {duration: this.ranger_frost_duration});
                }
                
                // Grant a stack of Ranger of Frost and refresh
                const modifier_ranger = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost");
                if (modifier_ranger)
                {
                    modifier_ranger.IncrementStackCount();
                    modifier_ranger.ForceRefresh();
                }
            }
        })
    }

    ReimaginedRangerOfFrostRangeDecrease(): number
    {
        let distance_decrease = 0;
        if (this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost"))
        {
            const modifier_frost = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost");
            if (modifier_frost)
            {
                const stacks = modifier_frost.GetStackCount();
                distance_decrease = this.ranger_frost_disable_distance_decrease! * stacks;
            }
        }

        return distance_decrease;
    }
}