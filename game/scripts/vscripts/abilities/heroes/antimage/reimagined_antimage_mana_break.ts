import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_antimage_mana_break } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_mana_break";
import { modifier_reimagined_antimage_mana_break_disable } from "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_mana_break_disable";
import "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_mana_break_mana_convergence_counter"
import "../../../modifiers/heroes/antimage/modifier_reimagined_antimage_mana_convergence_debuff"
import { AntiMageTalents } from "./reimagined_antimage_talents";

@registerAbility()
export class reimagined_antimage_mana_break extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();    
    sound_blast: string = "AntiMage.ManaBreak.EnergyBlast.Cast";
    sound_blast_hit: string = "AntiMage.ManaBreak.EnergyBlast.Hit";
    particle_blast: string = "particles/heroes/anti_mage/antimage_energy_blast.vpcf";
    particle_blast_fx?: ParticleID;
    particle_blast_mana_burn: string = "particles/heroes/anti_mage/antimage_mana_burn_hit_energy_blast.vpcf";
    particle_blast_mana_burn_fx?: ParticleID;

    // Ability specials
    energy_blast_radius?: number;
    energy_blast_max_mana_burn?: number;
    energy_blast_passive_disable_duration?: number;      
    
    // Talent specials
    mana_burn_reduction_talent?: number;

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_antimage_mana_break.name;
    }

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/anti_mage/antimage_energy_blast.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/anti_mage/antimage_mana_burn_hit_energy_blast.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/generic_gameplay/generic_manaburn.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/anti_mage/antimage_mana_cleave.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/anti_mage/antimage_mana_burn_hit.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/anti_mage/antimage_mana_convergence_debuff.vpcf", context);
    }

    OnAbilityPhaseStart(): boolean
    {
        // Play sound 
        EmitSoundOn(this.sound_blast, this.caster);
        return true;
    }

    OnAbilityPhaseInterrupted(): void
    {
        StopSoundOn(this.sound_blast, this.caster);
    }

    OnSpellStart(): void
    {
        // Reimagined: Energy Blast. Can be cast to apply a blast that burns mana for all enemies in radius and deals it as damage. Disables Mana Break for a few seconds afterwards
        this.ReimaginedEnergyBlast();
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number
    {
        return this.GetSpecialValueFor("energy_blast_radius");
    }    

    ReimaginedEnergyBlast(): void
    {
        // Ability specials
        this.energy_blast_radius = this.GetSpecialValueFor("energy_blast_radius");
        this.energy_blast_max_mana_burn = this.GetSpecialValueFor("energy_blast_max_mana_burn");
        this.energy_blast_passive_disable_duration = this.GetSpecialValueFor("energy_blast_passive_disable_duration");        

        // Apply disable mana break modifier to self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_antimage_mana_break_disable.name, {duration: this.energy_blast_passive_disable_duration});        

        // Apply a pulse!
        this.ReimaginedEnergyBlastPulse(false);

        // Feedback Pulse: Energy Blast now triggers a total of x quick waves y seconds one after another. All waves after the initial wave only deal and burns z the amount.
        if (HasTalent(this.caster, AntiMageTalents.AntiMageTalents_1))
        {
            const additional_waves = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_1, "total_waves") - 1
            const wave_interval = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_1, "wave_interval");
            this.mana_burn_reduction_talent = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_1, "mana_burn_pct_wave");
            
            let additional_waves_fired = 0;
            Timers.CreateTimer(wave_interval, () => 
            {
                additional_waves_fired++;
                this.ReimaginedEnergyBlastPulse(true);
                
                if (additional_waves_fired >= additional_waves)
                {
                    return undefined;
                }
                else
                {
                    return wave_interval;
                }
            })
        }
    }

    ReimaginedEnergyBlastPulse(isTalentProc: boolean): void
    {
        // Play particle
        this.particle_blast_fx = ParticleManager.CreateParticle(this.particle_blast, ParticleAttachment.ABSORIGIN, this.caster);
        ParticleManager.SetParticleControl(this.particle_blast_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_blast_fx);

        // Find all enemies in area
        const enemies = FindUnitsAroundUnit(this.caster,
                                            this.caster,                                            
                                            this.energy_blast_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO + UnitTargetType.BASIC,
                                            UnitTargetFlags.MANA_ONLY);        
                                            
        if (enemies.length >= 1)
        {
            EmitSoundOn(this.sound_blast_hit, this.caster);
        }

        // Cycle through all enemies
        for (const enemy of enemies)
        {
            //Burns up to max mana, deal that damage as magical damage
            let mana_burn = this.energy_blast_max_mana_burn!;

            // If this a talent proc, reduce the mana burn
            if (isTalentProc)
            {
                mana_burn = mana_burn * this.mana_burn_reduction_talent! * 0.01;
            }

            if (enemy.GetMana() < mana_burn)
            {
                mana_burn = enemy.GetMana();
            }

            enemy.ReduceMana(mana_burn);

            // Deal damage to the target
            ApplyDamage(
            {
                attacker: this.caster,
                damage: mana_burn!,
                damage_type: this.GetAbilityDamageType(),
                victim: enemy,
                ability: this,
                damage_flags: DamageFlag.NONE
            });

            // Play particle effect
            this.particle_blast_mana_burn_fx = ParticleManager.CreateParticle(this.particle_blast_mana_burn, ParticleAttachment.ABSORIGIN, enemy);
            ParticleManager.SetParticleControl(this.particle_blast_mana_burn_fx, 0, enemy.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_blast_mana_burn_fx);
        }
    }
}