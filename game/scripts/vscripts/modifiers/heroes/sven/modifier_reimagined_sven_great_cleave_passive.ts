import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"

@registerModifier()
export class modifier_reimagined_sven_great_cleave_passive extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_cleave: string = "particles/units/heroes/hero_sven/sven_spell_great_cleave.vpcf";    
    particle_cleave_fx?: ParticleID;

    // Modifier specials
    cleave_starting_width?: number;
    cleave_ending_width?: number;
    cleave_distance?: number;
    great_cleave_damage?: number;

    // Reimagined specials
    adjudicator_armor_ignore_pct?: number;

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
        this.adjudicator_armor_ignore_pct = this.ability!.GetSpecialValueFor("adjudicator_armor_ignore_pct");
    }

    OnRefresh()
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED,                
                ModifierFunction.IGNORE_PHYSICAL_ARMOR // Reimagination: Adjudicator's Blade: While God's Strength is active, ignores 38/46/54/62% of the main target's armor.
                ]        
    }    

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only trigger when attacker is the caster
        if (event.attacker != this.parent) return;

        // Do not trigger against buildings, wards or allied units
        if (event.target.IsBuilding() || event.target.IsOther() || event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Does nothing if the parent is broken
        if (this.parent.PassivesDisabled()) return;

        // Does nothing if the parent is an illusion
        if (this.parent.IsIllusion()) return;

        // Cleave!
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
            // this.particle_cleave_fx = ParticleManager.CreateParticle(this.particle_cleave, ParticleAttachment.CUSTOMORIGIN, this.parent);
            // ParticleManager.SetParticleControlForward(this.particle_cleave_fx, 0, this.parent.GetForwardVector());            
            // ParticleManager.SetParticleControl(this.particle_cleave_fx, 0, this.parent.GetAbsOrigin());
            // ParticleManager.SetParticleControl(this.particle_cleave_fx, 2, event.target.GetAbsOrigin());                
            // ParticleManager.ReleaseParticleIndex(this.particle_cleave_fx);

            const particle_fx = ParticleManager.CreateParticle("particles/heroes/sven/great_cleave_epic_cleave.vpcf", ParticleAttachment.CUSTOMORIGIN, this.parent);
            ParticleManager.SetParticleControl(particle_fx, 0, this.parent.GetAbsOrigin());
            ParticleManager.SetParticleControlForward(particle_fx, 0, this.parent.GetForwardVector());
            ParticleManager.ReleaseParticleIndex(particle_fx);
        }
    }
}