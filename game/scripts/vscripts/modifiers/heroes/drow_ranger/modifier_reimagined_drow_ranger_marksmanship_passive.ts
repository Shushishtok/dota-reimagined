import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_drow_ranger_marksmanship_agility_buff } from "./modifier_reimagined_drow_ranger_marksmanship_agility_buff"
import { modifier_reimagined_drow_ranger_frost_arrows_handler } from "./modifier_reimagined_drow_ranger_frost_arrows_handler"
import "../../general_mechanics/modifier_reimagined_negate_armor"


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
    projectile_frost: string = "particles/units/heroes/hero_drow/drow_frost_arrow.vpcf";
    marksmanship_enabled: boolean = true;
    proc_attack = false;
    first_time: boolean = true;
    projectile_map: Map<number, boolean> = new Map();

    // Modifier specials
    chance?: number;
    bonus_damage?: number;    
    agility_range?: number;
    split_count_scepter?: number;
    scepter_range?: number;
    damage_reduction_scepter?: number;
    disable_range?: number;    

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
    }

    OnRefresh(): void
    {        
        this.GetAbilitySpecials();
    }

    OnIntervalThink(): void
    {
        // Check for nearby enemies
        const enemies = util.FindUnitsAroundUnit(this.parent,
                                            this.disable_range!,
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
        if (RollPercentage(this.chance!))
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

        // Roll for the next attack
        this.RollForMarksmanship();
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;        

        // Only apply on attacks coming from the parent
        if (event.attacker != this.parent) return;        

        if (this.projectile_map.has(event.record))
        {
            if (this.projectile_map.get(event.record))
            {
                // Ignore armor
                event.target.AddNewModifier(this.caster, this.ability, GenericModifier.IGNORE_ARMOR, {duration: FrameTime()});                
            }
        }

        // TODO: Scepter effect: Splinter: Check if caster has scepter
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
                                             FindOrder.ANY, // CHECK IF THIS IS CORRECT OR IT SHOULD BE CLOSEST
                                             false);

            // If Drow has Frost Arrows set to auto cast, change projectile to Frost Arrows and spend mana
            let projectile_name = this.parent.GetRangedProjectileName();
            if (this.parent.HasModifier("modifier_reimagined_drow_ranger_frost_arrows_handler"))
            {
                const modifier_frost_arrows = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_frost_arrows_handler") as modifier_reimagined_drow_ranger_frost_arrows_handler;
                if (modifier_frost_arrows)
                {
                    if (modifier_frost_arrows.FiresFrostProjectiles())
                    {
                        projectile_name = this.projectile_frost;
                    }
                }
            }

            for (const enemy of enemies)
            {
                // Ignore the main target
                if (enemy == event.target) continue;    

                // If we already found two enemies to fire at, stop
                if (enemies_found >= this.split_count_scepter!)

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
}