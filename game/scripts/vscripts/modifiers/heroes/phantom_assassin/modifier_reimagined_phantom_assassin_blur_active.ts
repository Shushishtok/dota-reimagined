import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"
import { modifier_reimagined_phantom_assassin_blur_quick_and_quiet } from "./modifier_reimagined_phantom_assassin_blur_quick_and_quiet"

@registerModifier()
export class modifier_reimagined_phantom_assassin_blur_active extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_start: string = "Hero_PhantomAssassin.Blur";
    sound_end: string = "Hero_PhantomAssassin.Blur.Break";
    particle_effect: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_active_blur.vpcf";
    particle_status_fx: string = "particles/status_fx/status_effect_phantom_assassin_active_blur.vpcf";

    // Modifier specials
    radius?: number;
    fade_duration?: number;    

    // Reimagined specials        
    quick_quiet_linger_duration?: number;    
    from_veils_pure_damage_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.radius = this.ability.GetSpecialValueFor("radius");
        this.quick_quiet_linger_duration = this.ability.GetSpecialValueFor("quick_quiet_linger_duration");
        this.fade_duration = this.ability.GetSpecialValueFor("fade_duration");

        // Reimagined specials        
        this.from_veils_pure_damage_pct = this.ability.GetSpecialValueFor("from_veils_pure_damage_pct");        

        // Reimagined: Quick and Quiet: While Blur is active, grants x% damage bonus to the Phantom Assassin's next damage instance every second. The bonus is lost if Phantom Assassin does not attack within y seconds after losing the Blur modifier.        
        this.ReimaginedQuickAndQuiet(false);        

        // Play start sound
        EmitSoundOn(this.sound_start, this.caster);

        // Start thinking
        if (IsServer()) this.StartIntervalThink(0.1);
    }

    OnRefresh(): void
    {
        // Reimagined: Quick and Quiet: While Blur is active, grants x% damage bonus to the Phantom Assassin's next damage instance every second. The bonus is lost if Phantom Assassin does not attack within y seconds after losing the Blur modifier.
        this.ReimaginedQuickAndQuiet(false);
    }

    OnIntervalThink(): void
    {
        // Find nearby enemies
        const enemies = FindUnitsInRadius(this.parent.GetTeamNumber(),
                                          this.parent.GetAbsOrigin(),
                                          undefined,
                                          this.radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BUILDING,
                                          UnitTargetFlags.NOT_ILLUSIONS + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NOT_CREEP_HERO,
                                          FindOrder.ANY,
                                          false);

        // If an enemy was found, trigger the timer and stop thinking
        if (enemies.length > 0)
        {
            this.DispelModifier();
            this.StartIntervalThink(-1);
        }
    }

    DispelModifier(): void
    {
        // Wait for the fade duration and then destroy it if it still exists
        Timers.CreateTimer(this.fade_duration!, () => 
        {
            if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && !CBaseEntity.IsNull.call(this as any))
            {
                // Destroy self
                this.Destroy();
            }
        });
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.INVISIBILITY_LEVEL,                
                // Reimagined: From the Veils: Attacking while Blur is active grants Phantom Assassin an additional 5% of her total damage as pure damage.
                ModifierFunction.PROCATTACK_BONUS_DAMAGE_PURE]
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the attacker is the parent
        if (this.parent != event.attacker) return;

        // If the target is Roshan, dispel the modifier
        if (util.IsRoshan(event.target))
        {
            this.DispelModifier();
        }
    }

    GetModifierInvisibilityLevel() {return 1;}

    GetModifierProcAttack_BonusDamage_Pure(event: ModifierAttackEvent): number
    {
        return this.ReimaginedFromTheVeils(event);
    }

    ReimaginedQuickAndQuiet(destroy: boolean): void
    {
        if (!IsServer()) return;
        
        // Check if this is a call to add or remove the modifier
        if (!destroy)
        {            
            if (!this.parent.HasModifier(modifier_reimagined_phantom_assassin_blur_quick_and_quiet.name))
            {                
                this.parent.AddNewModifier(this.parent, this.ability, modifier_reimagined_phantom_assassin_blur_quick_and_quiet.name, {duration: this.GetDuration() + this.quick_quiet_linger_duration!});
            }
            else
            {
                const modifier_quick = this.parent.FindModifierByName(modifier_reimagined_phantom_assassin_blur_quick_and_quiet.name);
                if (modifier_quick)
                {
                    modifier_quick.SetDuration(this.GetDuration() + this.quick_quiet_linger_duration!, true);
                    modifier_quick.SetStackCount(0);
                    modifier_quick.ForceRefresh();
                }
            }
        }
        else
        {
            const modifier_quick = this.parent.FindModifierByName(modifier_reimagined_phantom_assassin_blur_quick_and_quiet.name) as modifier_reimagined_phantom_assassin_blur_quick_and_quiet;
            if (modifier_quick)
            {
                modifier_quick.LingerAndDispel();
            }
        }
    }

    ReimaginedFromTheVeils(event: ModifierAttackEvent): number
    {
        const damage = this.parent.GetAttackDamage() * this.from_veils_pure_damage_pct! * 0.01;
        SendOverheadEventMessage(undefined, OverheadAlert.DAMAGE, event.target, damage, undefined);
        return damage;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.INVISIBLE]: true,
                [ModifierState.TRUESIGHT_IMMUNE]: true}
    }

    GetPriority(): ModifierPriority
    {
        return ModifierPriority.NORMAL;
    }

    GetEffectName(): string
    {
        return this.particle_effect;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    GetStatusEffectName(): string
    {
        return this.particle_status_fx;
    }

    OnDestroy(): void
    {
        EmitSoundOn(this.sound_end, this.caster);

        // Reimagined: Quick and Quiet: While Blur is active, grants x% move speed for every second it is on. Lingers for y additional seconds after Blur is dispelled or expires.
        // Apply linger duration
        this.ReimaginedQuickAndQuiet(true);
    }
}