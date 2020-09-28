import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_frostbite_debuff extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_frostbite: string = "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf";
    damage_per_tick: number = 0;
    first_tick: boolean = true;

    // Modifier specials
    total_damage?: number;
    tick_interval?: number;
    duration?: number;

    // Reimagined specials    
    frost_emanation_search_radius?: number;
    frost_emanation_duration?: number;    
    eternal_cold_fixed_damage?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.total_damage = this.ability!.GetSpecialValueFor("total_damage");
        this.tick_interval = this.ability!.GetSpecialValueFor("tick_interval");
        this.duration = this.ability!.GetSpecialValueFor("duration")

        // Reimagined specials
        this.frost_emanation_search_radius = this.ability!.GetSpecialValueFor("frost_emanation_search_radius");
        this.frost_emanation_duration = this.ability!.GetSpecialValueFor("frost_emanation_duration");
        this.eternal_cold_fixed_damage = this.ability!.GetSpecialValueFor("eternal_cold_fixed_damage");

        // If duration is infinite due to Eternal Cold, use fixed damage
        if (this.GetDuration() == -1)
        {
            this.damage_per_tick = this.eternal_cold_fixed_damage!;
        }
        else
        {
            // Calculate damage per tick
            const ticks = Math.round(this.duration / this.tick_interval!);
            this.damage_per_tick = this.total_damage / ticks;
        }

        if (IsServer())
        {
            // Start thinking
            this.StartIntervalThink(this.tick_interval!);
            
            // Immediately trigger the first think
            this.OnIntervalThink();
        }
    }

    OnIntervalThink(): void
    {
        // Deal damage to the parent
        ApplyDamage(
        {
            attacker: this.caster!,
            damage: this.damage_per_tick!,
            damage_type: this.ability!.GetAbilityDamageType(),
            victim: this.parent,
            ability: this.ability!,
            damage_flags: DamageFlag.NONE
        });

        // Reimagined: Frost Emanation: When a Frostbitten target is touching another enemy, it will periodically afflict it with minor duration Frostbites as well.
        this.ReimaginedFrostEmanation()
    }

    ReimaginedFrostEmanation()
    {
        // Ignore first tick for looping purposes
        if (this.first_tick)
        {
            this.first_tick = false;
            return;
        }

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
            if (enemy != this.parent)
            {
                // Only apply on the first (closest) enemy
                enemy.AddNewModifier(this.caster!, this.ability!, this.GetName(), {duration: this.frost_emanation_duration!});
                break;
            }            
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP,
                ModifierFunction.TOOLTIP2]
    }

    OnTooltip(event: ModifierTooltip): number
    {        
        return this.damage_per_tick!;
        
    }

    OnTooltip2(event: ModifierTooltip): number
    {
        return this.tick_interval!;
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
                [ModifierState.INVISIBLE]: false,
                [ModifierState.DISARMED]: true}
    }

    GetPriority(): ModifierPriority
    {
        return ModifierPriority.NORMAL;
    }
}