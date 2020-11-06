import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"
import { modifier_reimagined_drow_ranger_frost_arrows_slow } from "./modifier_reimagined_drow_ranger_frost_arrows_slow"
import { modifier_reimagined_drow_ranger_frost_arrows_brittle } from "./modifier_reimagined_drow_ranger_frost_arrows_brittle"
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "../.././heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_passive"

@registerModifier()
export class modifier_reimagined_drow_ranger_frost_arrows_handler extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_frost: string = "Hero_DrowRanger.FrostArrows";        
    firing_frost_arrows: boolean = false;    
    cast_command: boolean = false;
    projectile_map: Map<number, boolean> = new Map();           

    // Modifier specials
    duration?: number;
    damage?: number;
    
    // Reimagined properties
    sound_cryo: string = "DrowRanger.FrostArrow.CryoArrowhead";
    particle_cryo: string = "particles/heroes/drow_ranger/frost_arrows_cryo_arrowhead.vpcf";
    particle_cryo_fx?: ParticleID;    

    // Reimagined specials
    brittle_cold_duration?: number;
    cryo_arrowhead_chance?: number;
    cryo_arrowhead_radius?: number;
    cryo_arrowhead_damage?: number;
    cryo_arrowhead_duration?: number;
    freezing_offensive_max_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.duration = this.ability.GetSpecialValueFor("duration");
        this.damage = this.ability.GetSpecialValueFor("damage");
        
        // Reimagined specials
        this.brittle_cold_duration = this.ability.GetSpecialValueFor("brittle_cold_duration");
        this.cryo_arrowhead_chance = this.ability.GetSpecialValueFor("cryo_arrowhead_chance");
        this.cryo_arrowhead_radius = this.ability.GetSpecialValueFor("cryo_arrowhead_radius");
        this.cryo_arrowhead_damage = this.ability.GetSpecialValueFor("cryo_arrowhead_damage");
        this.cryo_arrowhead_duration = this.ability.GetSpecialValueFor("cryo_arrowhead_duration");
        this.freezing_offensive_max_duration = this.ability.GetSpecialValueFor("freezing_offensive_max_duration");

        if (IsServer())
        {
            // Check if the caster has the projectile handler modifier: if not, add it
            if (!this.parent.HasModifier("modifier_reimagined_drow_ranger_projectile_handler"))
            {
                this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_drow_ranger_projectile_handler", {});
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_RECORD,
                ModifierFunction.ON_ATTACK,
                ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.ON_ATTACK_RECORD_DESTROY,
                ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL,
                ModifierFunction.ON_ORDER,                
                ModifierFunction.ON_ABILITY_FULLY_CAST]
    }    

    OnAttackRecord(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply on attacks done by the parent
        if (event.attacker != this.parent) return;

        // Does nothing if this attack isn't set as a orb attack
        if (!this.firing_frost_arrows) return;

        // Check if the orb effect can be cast, returns whether the arrow is an orb attack or not
        const orb_data: OrbData = 
        {
            can_proc_from_illusions: false,
            can_proc_on_building: false,
            can_proc_on_magic_immune: false,
            can_proc_on_wards: false,
            can_proc_while_silenced: false
        };
        const frost_arrow = util.CanOrbEffectBeCast(event, this.ability, orb_data);

        // If this was a "cast" command, turn firing arrows state off to prevent continues attacks
        if (this.cast_command)
        {
            if (!this.ability.GetAutoCastState())
            {
                this.firing_frost_arrows = false;
            }
            
            this.cast_command = false;
        }

        // Add activity modifier to change her animation to frost arrows animation
        this.caster.AddActivityModifier("frost_arrow");

        // Record the attack in the map        
        this.projectile_map.set(event.record, frost_arrow);
    }

    OnAttack(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply on the parent attacking
        if (event.attacker != this.parent) return;                

        // Check if this was a frost arrow                        
        if (this.projectile_map.has(event.record))
        {
            if (this.projectile_map.get(event.record))
            {
                // Play frost arrow sound
                EmitSoundOn(this.sound_frost, this.parent);
        
                // Expend mana if this is a Frost Arrow
                this.ability.UseResources(true, false, false);

                // Remove activity modifier
                this.caster.ClearActivityModifiers();
            }
        }
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only applies on attacks of the parent
        if (event.attacker != this.parent) return;

        // If the target became magic immune mid-projectile, do nothing
        if (event.target.IsMagicImmune()) return;

        // Check if this is a frost attack        
        if (this.projectile_map.has(event.record))
        {            
            if (this.projectile_map.get(event.record))
            {                                
                this.ApplyFrostArrows(event.target, this.duration!);
            }
        }
    }

    ApplyFrostArrows(target: CDOTA_BaseNPC, duration: number)
    {
        // If the target doesn't have the slow debuff, add it to him
        if (!target.HasModifier(modifier_reimagined_drow_ranger_frost_arrows_slow.name))
        {
            target.AddNewModifier(this.parent, this.ability, modifier_reimagined_drow_ranger_frost_arrows_slow.name, {duration: duration});                    
        }
        else
        {
            // Reimagined: Freezing Offensive: Each Frost Arrow hitting the enemy extends the current debuff timer instead of refreshing it.
            const modifier = target.FindModifierByName(modifier_reimagined_drow_ranger_frost_arrows_slow.name)!;
            if (modifier)
            {
                // Reimagined: Freezing Offensive: Each Frost Arrow hitting the enemy extends the current debuff timer instead of refreshing it, up to a maximum of x seconds.
                this.ReimaginedFreezingOffensive(modifier, duration);

                // Refresh modifier timer
                modifier.ForceRefresh();
            }
        }
        
        // Reimagined: Cryo Arrowhead: While Marksmanship is active, grants a 25% chance to have Frost Arrows explode on impact, dealing bonus 20/40/60/80 magical damage to all enemies in 300 radius of the target and extending Frost Arrow's debuff by 0.6/0.8/1/1.2 additional seconds to all targets hit. Stacks with Freezing Offensive.
        this.ReimaginedCryoArrowhead(target)

        // Reimagined: Brittle as the Cold: Frost Arrows causes the target to lose x% of its armor and y attack speed for z seconds. Stacks indefinitely. Stacks have independent duration.
        this.ReimaginedBrittleAsTheCold(target);
    }

    OnAttackRecordDestroy(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only applies on records of the parent
        if (event.attacker != this.parent) return;

        // Remove the record from the map
        if (this.projectile_map.has(event.record))
        {
            this.projectile_map.delete(event.record);
        }
    }

    GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number
    {
        // Check if this was a frost attack
        if (this.projectile_map.has(event.record))
        {
            if (this.projectile_map.get(event.record))
            {
                return this.damage!;
            }
        }

        return 0;
    }

    OnOrder(event: ModifierUnitEvent): void
    {
        if (!IsServer()) return;        

        // Only apply if the unit being ordered is the parent
        if (event.unit != this.parent) return;        

        // If this is an attack move/target order, check the auto cast state of the ability
        if (event.order_type == UnitOrder.ATTACK_TARGET || event.order_type == UnitOrder.ATTACK_MOVE)
        {
            if (this.ability.GetAutoCastState())
            {
                // Toggle on the frost attack flag
                this.firing_frost_arrows = true;
            }
        }
        else if (event.order_type == UnitOrder.CAST_TOGGLE_AUTO)
        {
            // It actually takes a frame to detect the change in the auto cast state when ordering it            
            Timers.CreateTimer(FrameTime(), () =>
            {
                if (this.ability.GetAutoCastState())
                {
                // Toggle on the frost attack flag
                this.firing_frost_arrows = true;
                }
                else
                {
                    this.firing_frost_arrows = false;
                }
            });
        }

        // If this was triggerd by Frost Arrow ability, toggle on frost attack
        else if (event.order_type == UnitOrder.CAST_TARGET && event.ability == this.ability)
        {
            this.firing_frost_arrows = true;
            
            // Command the parent to attack the target
            ExecuteOrderFromTable(
                {
                    OrderType: UnitOrder.ATTACK_TARGET,
                    UnitIndex: this.parent.entindex(),
                    TargetIndex: event.target!.entindex()
                }
            );

            this.cast_command = true;
        }
        // Every other order turns the frost arrows off
        else
        {
            this.firing_frost_arrows = false;
        }
    }    

    FiresFrostProjectiles(): boolean
    {
        if (this.firing_frost_arrows) 
        {
            const target = this.parent.GetAttackTarget();
            if (target && util.CanOrbBeCastOnTarget(target, false, false, false) && util.CanUserCastOrb(this.parent, this.ability, false, false))
            {
                return true;
            }
        }

        return false
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent)
    {
        if (!IsServer()) return;

        // Only apply if the caster of the ability is the parent
        if (event.unit != this.parent) return;

        // Only apply if the ability that was used is the Frost Arrows ability
        if (event.ability == this.ability)
        {
            // Refund the parent: mana is taken from the OnAttack event
            this.ability.RefundManaCost();
        }
    }

    ReimaginedFreezingOffensive(modifier: CDOTA_Buff, duration: number): void
    {
        // Target already has the modifier: find it, set its duration and refresh it                
        let new_duration = modifier.GetRemainingTime() + duration
        
        // Cannot exceed maximum duration
        if (new_duration > this.freezing_offensive_max_duration!)
        {
            new_duration = this.freezing_offensive_max_duration!;
        }

        modifier.SetDuration(new_duration, true);                    
    }

    ReimaginedBrittleAsTheCold(target: CDOTA_BaseNPC): void
    {
        let modifier;

        // Add modifier if needed
        if (!target.HasModifier(modifier_reimagined_drow_ranger_frost_arrows_brittle.name))
        {
            modifier = target.AddNewModifier(this.parent, this.ability, modifier_reimagined_drow_ranger_frost_arrows_brittle.name, {duration: this.brittle_cold_duration});
        }
        else
        {
            modifier = target.FindModifierByName(modifier_reimagined_drow_ranger_frost_arrows_brittle.name);
        }

        if (modifier)
        {
            // Increment stack count
            modifier.IncrementStackCount();
        } 
    }

    ReimaginedCryoArrowhead(target: CDOTA_BaseNPC): void
    {
        // Check if Marksmanship is active
        if (this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_passive"))
        {
            const modifier_marksmanship = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_marksmanship_passive") as modifier_reimagined_drow_ranger_marksmanship_passive;
            if (modifier_marksmanship)
            {
                if (modifier_marksmanship.marksmanship_enabled)
                {
                    // Roll for chance to proc the Cryo Arrowhead
                    if (RollPseudoRandomPercentage(this.cryo_arrowhead_chance!, PseudoRandom.CUSTOM_GAME_1, this.parent))
                    {
                        // Find all enemies in the AoE
                        const enemies = FindUnitsInRadius(this.parent.GetTeamNumber(),
                                                        target.GetAbsOrigin(),
                                                        undefined,
                                                        this.cryo_arrowhead_radius!,
                                                        UnitTargetTeam.ENEMY,
                                                        UnitTargetType.HERO + UnitTargetType.BASIC,
                                                        UnitTargetFlags.NONE,
                                                        FindOrder.ANY,
                                                        false);
            
                        for (const enemy of enemies)
                        {
                            // Deal damage to the target
                            ApplyDamage(
                            {
                                attacker: this.parent,
                                damage: this.cryo_arrowhead_damage!,
                                damage_type: DamageTypes.MAGICAL,
                                victim: enemy,
                                ability: this.ability,
                                damage_flags: DamageFlag.NONE
                            });
            
                            // Apply or extend Frost Arrows slow modifier
                            if (!enemy.HasModifier(modifier_reimagined_drow_ranger_frost_arrows_slow.name))
                            {
                                enemy.AddNewModifier(this.parent, this.ability, modifier_reimagined_drow_ranger_frost_arrows_slow.name, {duration: this.cryo_arrowhead_duration});
                            }
                            else
                            {
                                const modifier = enemy.FindModifierByName(modifier_reimagined_drow_ranger_frost_arrows_slow.name);
                                if (modifier)
                                {   
                                    this.ReimaginedFreezingOffensive(modifier, this.cryo_arrowhead_duration!);
                                }
                            }
                        }
            
                        // Play sound
                        EmitSoundOn(this.sound_cryo, target);
            
                        // Play particle effect
                        this.particle_cryo_fx = ParticleManager.CreateParticle(this.particle_cryo, ParticleAttachment.WORLDORIGIN, undefined);
                        ParticleManager.SetParticleControl(this.particle_cryo_fx, 0, target.GetAbsOrigin());
                        ParticleManager.SetParticleControl(this.particle_cryo_fx, 1, target.GetAbsOrigin());
                        ParticleManager.ReleaseParticleIndex(this.particle_cryo_fx);
                    }
                }
            }
        }
    }            
}