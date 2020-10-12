import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_frostbite_debuff } from "./modifier_reimagined_crystal_maiden_frostbite_debuff"


@registerModifier()
export class modifier_reimagined_crystal_maiden_frostbite_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_cast: string = "Hero_Crystal.Frostbite";
    particle_frostbite: string = "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf";        

    // Modifier specials    
    tick_interval?: number;

    // Reimagined specials    
    frost_emanation_search_radius?: number;
    frost_emanation_duration?: number;    
    igloo_frosting_arcane_aura_multiplier?: number;
    
    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials        
        this.tick_interval = this.ability.GetSpecialValueFor("tick_interval");

        // Reimagined specials
        this.frost_emanation_search_radius = this.ability.GetSpecialValueFor("frost_emanation_search_radius");
        this.frost_emanation_duration = this.ability.GetSpecialValueFor("frost_emanation_duration");                
        this.igloo_frosting_arcane_aura_multiplier = this.ability.GetSpecialValueFor("igloo_frosting_arcane_aura_multiplier");

        if (IsServer())
        {
            // Start thinking
            this.StartIntervalThink(this.tick_interval!);
        }
    }

    OnIntervalThink(): void
    {
        // Reimagined: Frost Emanation: When a Frostbitten target is touching another enemy, it will periodically afflict it with minor duration Frostbites as well.
        this.ReimaginedFrostEmanation()
    }

    ReimaginedFrostEmanation()
    {
        // Search for nearby allies (of the enemy)
        const enemies = FindUnitsInRadius(this.caster!.GetTeamNumber(),
                                          this.parent.GetAbsOrigin(),
                                          undefined,
                                          this.frost_emanation_search_radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO | UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.CLOSEST,
                                          false
                                          )

        for (const enemy of enemies)
        {
            // Only apply on the first (closest) enemy
            enemy.AddNewModifier(this.caster!, this.ability, modifier_reimagined_crystal_maiden_frostbite_debuff.name , {duration: this.frost_emanation_duration!});
            break;
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.igloo_frosting_arcane_aura_multiplier!
    }

    GetEffectName(): string
    {
        return this.particle_frostbite;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.ROOTED]: true,                
                [ModifierState.DISARMED]: true}
    }    

    OnDestroy(): void
    {
        StopSoundOn(this.sound_cast, this.parent)
    }
}