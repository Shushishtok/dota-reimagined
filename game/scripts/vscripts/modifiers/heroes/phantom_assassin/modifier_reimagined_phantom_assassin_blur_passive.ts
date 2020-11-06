import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"
import { modifier_reimagind_phantom_assassin_blur_turned_blade_cd } from "./modifier_reimagind_phantom_assassin_blur_turned_blade_cd"

@registerModifier()
export class modifier_reimagined_phantom_assassin_blur_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_turned_blade: string = "PhantomAssassin.TurnedBlade.Counter";
    particle_turned_blade: string = "particles/heroes/phantom_assassin/blur_turned_your_blade.vpcf";
    particle_turned_blade_fx?: ParticleID;    

    // Modifier specials
    bonus_evasion?: number;

    // Reimagined specials
    turned_blade_internal_cooldown?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.bonus_evasion = this.ability.GetSpecialValueFor("bonus_evasion");

        // Reimagined specials
        this.turned_blade_internal_cooldown = this.ability.GetSpecialValueFor("turned_blade_internal_cooldown");
    }

    OnRefresh(): void
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.EVASION_CONSTANT,
                ModifierFunction.ON_DEATH,
                // Reimagined: Turned Your Blade: Phantom Assassin instantly attacks any enemy within range that misses her with an attack. Has an internal cooldown of x seconds.
                ModifierFunction.ON_ATTACK_FAIL]
    }

    GetModifierEvasion_Constant(): number
    {
        // Does nothing if the caster is broken
        if (this.parent.PassivesDisabled()) return 0;

        return this.bonus_evasion!;
    }

    OnDeath(event: ModifierAttackEvent): void    
    {        
        // Only triggers when the attacker is the parent
        if (this.parent != event.attacker) return;

        // Only triggers if the parent has a scepter
        if (!this.parent.HasScepter()) return;

        // Find all basic abilities and refresh their cooldown
        for (let index = 0; index < 32; index++) 
        {
            const ability = this.parent.GetAbilityByIndex(index);
            if (ability)
            {
                if (ability.IsTrained() && !ability.IsCooldownReady() && ability.GetAbilityType() != AbilityTypes.ULTIMATE)
                {
                    ability.EndCooldown();
                }
            }
        }
    }

    OnAttackFail(event: ModifierAttackEvent)
    {        
        this.ReimaginedTurnedYourBlade(event);
    }

    ReimaginedTurnedYourBlade(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Only apply on the caster being attacked
        if (this.parent != event.target) return;

        // Only when being attacked by an enemy
        if (this.parent.GetTeamNumber() == event.attacker.GetTeamNumber()) return;

        // Does nothing when parent is broken
        if (this.parent.PassivesDisabled()) return;

        // Not including wards and buildings
        if (event.attacker.IsBuilding() || event.attacker.IsOther()) return;

        // Not including enemies that are out of her attack range. Include hull radius of both attacker and parent since they can reach the edge of their hulls
        const distance = (util.CalculateDistanceBetweenEntities(this.parent, event.attacker));        
        if (distance > (this.parent.GetHullRadius() + this.parent.Script_GetAttackRange() + event.attacker.GetHullRadius())) return;

        // Check if the flag is set
        if (!event.attacker.HasModifier(modifier_reimagind_phantom_assassin_blur_turned_blade_cd.name))
        {
            // Perform instant attack against the attacker
            this.parent.PerformAttack(event.attacker, true, true, true, false, false, false, false);

            // Play sound
            EmitSoundOn(this.sound_turned_blade, event.attacker);

            // Play particles
            this.particle_turned_blade_fx = ParticleManager.CreateParticle(this.particle_turned_blade, ParticleAttachment.ABSORIGIN_FOLLOW, event.attacker);
            ParticleManager.SetParticleControl(this.particle_turned_blade_fx, 0, event.attacker.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_turned_blade_fx);
            
            // Give CD modifier to attacker
            event.attacker.AddNewModifier(this.parent, this.ability, modifier_reimagind_phantom_assassin_blur_turned_blade_cd.name, {duration: this.turned_blade_internal_cooldown});
        }
    }
}