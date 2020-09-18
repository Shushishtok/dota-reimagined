import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_antimage_mana_break_mana_convergence_counter } from "./modifier_reimagined_antimage_mana_break_mana_convergence_counter";
import { modifier_reimagined_antimage_mana_break_disable } from "./modifier_reimagined_antimage_mana_break_disable"
import * as util  from "../../../lib/util"

@registerModifier()
export class modifier_reimagined_antimage_mana_break extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_mana_break: string = "Hero_Antimage.ManaBreak";
    particle_mana_break: string = "particles/generic_gameplay/generic_manaburn.vpcf";
    particle_mana_break_fx?: ParticleID;
    particle_mana_cleave: string = "particles/heroes/anti_mage/antimage_mana_cleave.vpcf";
    particle_mana_cleave_fx?: ParticleID;
    particle_mana_cleave_burn: string = "particles/heroes/anti_mage/antimage_mana_burn_hit.vpcf";
    particle_mana_cleave_burn_fx?: ParticleID;

    // Modifier specials
    percent_damage_per_burn?: number;
    mana_per_hit?: number;
    mana_per_hit_pct?: number;
    illusion_percentage?: number;

    // Reimagined specials
    mana_cleave_distance?: number;
    mana_cleave_starting_width?: number;
    mana_cleave_end_width?: number;
    mana_cleave_mana_burn?: number;    
    mana_convergence_hit_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}    

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.percent_damage_per_burn = this.ability?.GetSpecialValueFor("percent_damage_per_burn");
        this.mana_per_hit = this.ability?.GetSpecialValueFor("mana_per_hit");
        this.mana_per_hit_pct = this.ability?.GetSpecialValueFor("mana_per_hit_pct");
        this.illusion_percentage = this.ability?.GetSpecialValueFor("illusion_percentage");

        // Reimagined specials
        this.mana_cleave_distance = this.ability?.GetSpecialValueFor("mana_cleave_distance");
        this.mana_cleave_starting_width = this.ability?.GetSpecialValueFor("mana_cleave_starting_width");
        this.mana_cleave_end_width = this.ability?.GetSpecialValueFor("mana_cleave_end_width");
        this.mana_cleave_mana_burn = this.ability?.GetSpecialValueFor("mana_cleave_mana_burn");        
        this.mana_convergence_hit_duration = this.ability?.GetSpecialValueFor("mana_convergence_hit_duration");
    }

    OnRefresh(): void
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL,
                ModifierFunction.ON_ATTACK_LANDED]
    }

    GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number
    {
        // Do nothing if the caster is broken
        if (this.parent.PassivesDisabled()) return 0;

        // Do nothing if the target is spell immune
        if (event.target.IsMagicImmune()) return 0;

        // Do nothing if the target is an ally
        if (event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return 0;

        // Do nothing if the passive Mana Break is disabled by Energy Blast
        if (this.parent.HasModifier(modifier_reimagined_antimage_mana_break_disable.name)) return 0;        

        // Do nothing if the target is a building
        if (event.target.IsBuilding()) return 0;

        // Do nothing if the target has no mana
        if (event.target.GetMaxMana() == 0) return 0;

        let damage: number;

        // Calculate the mana burn amount for that target
        let mana_burn_amount = this.mana_per_hit! + this.mana_per_hit_pct! * event.target.GetMaxMana() * 0.01;

        // Check if parent is an illusion; if so, calculate damage percentage of illusion reduction
        if (this.parent.IsIllusion())
        {
            mana_burn_amount = mana_burn_amount * this.illusion_percentage! * 0.01;
        }
        
        // Check if target has enough mana to burn; otherwise, burn all its mana and adjust damage accordingly
        let actual_mana_burned;
        if (event.target.GetMana() <= mana_burn_amount)
        {
            actual_mana_burned = event.target.GetMana();        
        }
        else
        {
            actual_mana_burned = mana_burn_amount;
        }        

        // Burn mana for the target
        event.target.ReduceMana(actual_mana_burned);

        // Calculate damage percentage of mana burned
        damage = actual_mana_burned * this.percent_damage_per_burn! * 0.01;        

        // Play sound
        EmitSoundOn(this.sound_mana_break, event.target);

        // Add hit particle effects
        this.particle_mana_break_fx = ParticleManager.CreateParticle(this.particle_mana_break, ParticleAttachment.ABSORIGIN_FOLLOW, event.target);
        ParticleManager.SetParticleControl(this.particle_mana_break_fx, 0, event.target.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_mana_break_fx);

        return damage;
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        // Ignore client
        if (!IsServer()) return;

        // Only apply if the attacker is the caster
        if (this.parent == event.attacker)
        {
            // If the caster's passives are disabled, do nothing
            if (this.parent.PassivesDisabled()) return;
            
            // If the target is an ally, do nothing
            if (this.parent.GetTeamNumber() == event.target.GetTeamNumber()) return;

            // Do nothing if the passive Mana Break is disabled by Energy Blast
            if (this.parent.HasModifier(modifier_reimagined_antimage_mana_break_disable.name)) return;        

            // Reimagined: Mana Cleave. Causes Anti Mage's attacks to burn mana in a cleave-like pattern
            this.ReimaginedManaCleave(event);

            // Do nothing if the target is a building
            if (event.target.IsBuilding()) return;

            // Do nothing if the target has no mana
            if (event.target.GetMaxMana() == 0) return;            

            // Reimagined: Mana Convergence. After a few attacks on an enemy unit, trigger Mana Convergence on the enemy for a few seconds, which reduces mana loss reduction
            this.ReimaginedManaConvergence(event);
        }        
    }

    ReimaginedManaCleave(event: ModifierAttackEvent): void
    {
        // Find units in a cone in front of the parent
        const enemies = util.FindUnitsInCone(this.parent.GetTeamNumber(),
        this.parent.GetForwardVector(),
        this.parent.GetAbsOrigin(),
        this.mana_cleave_starting_width!,
        this.mana_cleave_end_width!,
        this.mana_cleave_distance!,
        undefined,
        UnitTargetTeam.ENEMY,
        UnitTargetType.HERO + UnitTargetType.BASIC, 
        UnitTargetFlags.NONE,
        FindOrder.ANY,
        false);

        if (enemies.length > 1)
        {
            // Create mana cleave particle
            this.particle_mana_cleave_fx = ParticleManager.CreateParticle(this.particle_mana_cleave, ParticleAttachment.WORLDORIGIN, undefined);
            const direction = util.CalculateDirectionToPosition(this.parent.GetAbsOrigin(), event.target.GetAbsOrigin());
            ParticleManager.SetParticleControlForward(this.particle_mana_cleave_fx, 0, direction);
            ParticleManager.SetParticleControl(this.particle_mana_cleave_fx, 0, this.parent.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_mana_cleave_fx);
        }

        // Cycle enemies
        for (const enemy of enemies)
        {
            let mana_burn = this.mana_cleave_mana_burn!;

            // Ignore main target of the attack
            if (enemy == event.target)
            {
                continue;
            }

            // Ignore targets that have no mana
            if (enemy.GetMaxMana() == 0)
            {
                continue;
            }

            // If the attacker is an illusion, reduce mana burn potency
            if (this.parent.IsIllusion())
            {
                mana_burn = mana_burn * this.illusion_percentage! * 0.01;
            }

            // Check if enemy has enough mana to burn
            if (enemy.GetMana() < mana_burn!)
            {
                mana_burn = enemy.GetMana();
            }

            // Burn mana. This will not deal damage to the enemy.
            enemy.ReduceMana(mana_burn);

            // Play mana cleave burn particle
            this.particle_mana_cleave_burn_fx = ParticleManager.CreateParticle(this.particle_mana_cleave_burn, ParticleAttachment.ABSORIGIN, enemy);
            ParticleManager.SetParticleControl(this.particle_mana_cleave_burn_fx, 0, enemy.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_mana_cleave_burn_fx);
        }
    }

    ReimaginedManaConvergence(event: ModifierAttackEvent)
    {
        let modifier_mana_convergence;
        
        // If target already has the mana convergence modifier, fetch it
        if (event.target.HasModifier(modifier_reimagined_antimage_mana_break_mana_convergence_counter.name))
        {
            modifier_mana_convergence = event.target.FindModifierByName(modifier_reimagined_antimage_mana_break_mana_convergence_counter.name);
        }
        else
        {
            modifier_mana_convergence = event.target.AddNewModifier(this.parent, this.ability!, modifier_reimagined_antimage_mana_break_mana_convergence_counter.name, {duration: this.mana_convergence_hit_duration})
        }

        // Verify modifier
        if (modifier_mana_convergence)
        {
            // Increase stack count of the modifier
            modifier_mana_convergence.IncrementStackCount();
            modifier_mana_convergence.ForceRefresh();
        }
    }
}