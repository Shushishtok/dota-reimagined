import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"
import { modifier_reimagined_sven_great_cleave_epic_cleave } from "./modifier_reimagined_sven_great_cleave_epic_cleave_counter";
import { modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction } from "./modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction";

@registerModifier()
export class modifier_reimagined_sven_great_cleave_passive extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_cleave: string = "particles/units/heroes/hero_sven/sven_spell_great_cleave.vpcf";    
    particle_cleave_fx?: ParticleID;
    particle_epic_cleave: string = "particles/heroes/sven/great_cleave_epic_cleave.vpcf";
    particle_epic_cleave_fx?: ParticleID;
    sound_epic_cleave_normal: string = "Sven.GreatCleave.EpicCleave.Normal";
    sound_epic_cleave_gods_strength: string = "Sven.GreatCleave.EpicCleave.GodsStrength";

    // Modifier specials
    cleave_starting_width?: number;
    cleave_ending_width?: number;
    cleave_distance?: number;
    great_cleave_damage?: number;
    
    // Reimagined specials
    epic_cleave_counter_duration?: number;
    epic_cleave_attacks?: number;
    epic_cleave_distance_multiplier?: number;
    epic_cleave_damage_pct?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.cleave_starting_width = this.ability!.GetSpecialValueFor("cleave_starting_width");
        this.cleave_ending_width = this.ability!.GetSpecialValueFor("cleave_ending_width");
        this.cleave_distance = this.ability!.GetSpecialValueFor("cleave_distance");
        this.great_cleave_damage = this.ability!.GetSpecialValueFor("great_cleave_damage");        

        // Reimagined specials
        this.epic_cleave_counter_duration = this.ability!.GetSpecialValueFor("epic_cleave_counter_duration");
        this.epic_cleave_attacks = this.ability!.GetSpecialValueFor("epic_cleave_attacks");
        this.epic_cleave_distance_multiplier = this.ability!.GetSpecialValueFor("epic_cleave_distance_multiplier");
        this.epic_cleave_damage_pct = this.ability!.GetSpecialValueFor("epic_cleave_damage_pct");
    }

    OnRefresh()
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED,                
                ModifierFunction.ON_ATTACK_RECORD_DESTROY]        
    }        

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only trigger when attacker is the caster
        if (event.attacker != this.parent) return;

        // Does not trigger against buildings, wards or allied units
        if (event.target.IsBuilding() || event.target.IsOther() || event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Does nothing if the parent is broken
        if (this.parent.PassivesDisabled()) return;

        // Does nothing if the parent is an illusion
        if (this.parent.IsIllusion()) return;

        // Reimagined: Epic Cleave: Every few attacks, Sven's next attack becomes an Epic Cleave which doubles the cleave's radius and distance, deals 100% cleave damage, and ignores a portion of the main target's armor. The counter resets if no attacks are done in a few seconds.
        // This replaces Great Cleave if it procs
        if (this.ReimaginedEpicCleave(event)) return;

        // Great Cleave
        const numOfEnemiesHit = util.CustomCleaveAttack(this.parent,
                                this.parent.GetAbsOrigin(),
                                this.cleave_starting_width!,
                                this.cleave_ending_width!,
                                this.cleave_distance!,
                                UnitTargetTeam.ENEMY,
                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NOT_ATTACK_IMMUNE,
                                event.target,
                                this.great_cleave_damage!,                                
                                this.ability!);

                                
        // Play Cleave particle if damage is > 0 and amount of enemies is > 1
        if (numOfEnemiesHit > 1 && (this.parent.GetAverageTrueAttackDamage(event.target) * this.great_cleave_damage! * 0.01) > 0)
        {            
            this.particle_cleave_fx = ParticleManager.CreateParticle(this.particle_cleave, ParticleAttachment.CUSTOMORIGIN, this.parent);
            ParticleManager.SetParticleControlForward(this.particle_cleave_fx, 0, this.parent.GetForwardVector());            
            ParticleManager.SetParticleControl(this.particle_cleave_fx, 0, this.parent.GetAbsOrigin());
            ParticleManager.SetParticleControl(this.particle_cleave_fx, 2, event.target.GetAbsOrigin());                
            ParticleManager.ReleaseParticleIndex(this.particle_cleave_fx);            
        }
    }

    OnAttackRecordDestroy(event: ModifierAttackEvent)    
    {
        if (!IsServer) return;

        // Removes the armor reduction done by Epic Cleave, if any
        if (event.target && event.attacker == this.parent)
        {
            if (event.target.HasModifier(modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction.name))
            {
                event.target.RemoveModifierByName(modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction.name);
            }
        }
    }

    ReimaginedEpicCleave(event: ModifierAttackEvent): boolean
    {
        let procs_epic_cleave = false;

        // If the parent doesn't have the modifier, add it to him
        let modifier: CDOTA_Buff;
        if (!this.parent.HasModifier(modifier_reimagined_sven_great_cleave_epic_cleave.name))
        {
            modifier = this.parent.AddNewModifier(this.parent, this.ability!, modifier_reimagined_sven_great_cleave_epic_cleave.name, {duration: this.epic_cleave_counter_duration});
        }
        else
        {
            // If it does, refresh it
            modifier = this.parent.FindModifierByName(modifier_reimagined_sven_great_cleave_epic_cleave.name)!;            
            modifier.ForceRefresh();                            
        }

        // Check if the stack count is at the threshold
        if (modifier)
        {            
            // If the attack was done by instant attacks, increment only if not in the threshold yet 
            if (event.no_attack_cooldown)
            {
                if (modifier.GetStackCount() < this.epic_cleave_attacks! -1)
                {
                    modifier.IncrementStackCount();
                }
                return false;
            }                

            // EPIC CLEAVE!
            if (modifier.GetStackCount() == this.epic_cleave_attacks! -1)
            {
                // Set flag to true
                procs_epic_cleave = true;
                
                // Reset the stack count
                modifier.Destroy();

                // Define cleave properties
                const starting_width = this.cleave_starting_width! * this.epic_cleave_distance_multiplier!;
                const ending_width = this.cleave_ending_width! * this.epic_cleave_distance_multiplier!;
                const cleave_distance = this.cleave_distance! * this.epic_cleave_distance_multiplier!;

                // Reduce the main target's armor!
                event.target.AddNewModifier(this.parent, this.ability!, modifier_reimagined_sven_great_cleave_epic_cleave_armor_reduction.name, {duration: 0.1});

                // Epic Cleave!
                util.CustomCleaveAttack(this.parent,
                                        this.parent.GetAbsOrigin(),
                                        starting_width,
                                        ending_width,
                                        cleave_distance,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.HERO + UnitTargetType.BASIC,
                                        UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NOT_ATTACK_IMMUNE,
                                        event.target,
                                        this.epic_cleave_damage_pct!,
                                        this.ability!);

                // Play sound effects based on God's Strength modifier presence
                if (this.parent.HasModifier("modifier_reimagined_sven_gods_strength")) 
                {
                    EmitSoundOn(this.sound_epic_cleave_gods_strength, this.parent);
                } 
                else 
                {
                    EmitSoundOn(this.sound_epic_cleave_normal, this.parent);
                }

                // Play particle effect
                this.particle_epic_cleave_fx = ParticleManager.CreateParticle(this.particle_epic_cleave, ParticleAttachment.CUSTOMORIGIN, this.parent);
                ParticleManager.SetParticleControl(this.particle_epic_cleave_fx, 0, this.parent.GetAbsOrigin());
                ParticleManager.SetParticleControlForward(this.particle_epic_cleave_fx, 0, this.parent.GetForwardVector());
                ParticleManager.ReleaseParticleIndex(this.particle_epic_cleave_fx);
            }
            else
            {
                // Increment stack count
                modifier.IncrementStackCount();
            }
        }
        
        return procs_epic_cleave;
    }
}