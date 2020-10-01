import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_frostbite_debuff } from "./modifier_reimagined_crystal_maiden_frostbite_debuff"
import { modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier } from "./modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier"
import { modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura } from "./modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura"
import { reimagined_crystal_maiden_crystal_nova } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_crystal_nova"

@registerModifier()
export class modifier_reimagined_crystal_maiden_freezing_field_aura extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_explosion: string = "hero_Crystal.freezingField.explosion"
    particle_snow_aura: string = "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_snow.vpcf";
    particle_snow_aura_fx?: ParticleID;
    particle_explosion: string = "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_explosion.vpcf";
    particle_explosion_fx?: ParticleID;
    scepter_enemy_list: Set<CDOTA_BaseNPC> = new Set();
    quadrant: number = 1;    
    elapsed_time: number = 0;

    // Modifier specials
    radius?: number;
    explosion_radius?: number;
    bonus_armor?: number;
    explosion_interval?: number;
    slow_duration?: number;
    explosion_min_dist?: number;
    explosion_max_dist?: number;
    damage?: number;

    // Reimagined specials    
    arcane_glacier_interval?: number;
    arcane_glacier_linger_duration?: number;
    subzero_crystal_chance?: number;
    subzero_crystal_duration?: number;
    numbing_cold_bonus_dmg_pct?: number;    

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.radius = this.ability.GetSpecialValueFor("radius");
        this.explosion_radius = this.ability.GetSpecialValueFor("explosion_radius");
        this.bonus_armor = this.ability.GetSpecialValueFor("bonus_armor");
        this.explosion_interval = this.ability.GetSpecialValueFor("explosion_interval");
        this.slow_duration = this.ability.GetSpecialValueFor("slow_duration");
        this.explosion_min_dist = this.ability.GetSpecialValueFor("explosion_min_dist");
        this.explosion_max_dist = this.ability.GetSpecialValueFor("explosion_max_dist");
        this.damage = this.ability.GetSpecialValueFor("damage");

        // Reimagined specials        
        this.arcane_glacier_interval = this.ability.GetSpecialValueFor("arcane_glacier_interval");
        this.arcane_glacier_linger_duration = this.ability.GetSpecialValueFor("arcane_glacier_linger_duration");
        this.subzero_crystal_chance = this.ability.GetSpecialValueFor("subzero_crystal_chance");
        this.subzero_crystal_duration = this.ability.GetSpecialValueFor("subzero_crystal_duration");
        this.numbing_cold_bonus_dmg_pct = this.ability.GetSpecialValueFor("numbing_cold_bonus_dmg_pct");        
        
        // Play snow particle
        this.particle_snow_aura_fx = ParticleManager.CreateParticle(this.particle_snow_aura, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_snow_aura_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_snow_aura_fx, 1, Vector (this.radius, 0, 0))                
        this.AddParticle(this.particle_snow_aura_fx, false, false, -1, false, false);

        // Start thinking
        if (IsServer()) this.StartIntervalThink(this.explosion_interval);        
    }

    OnIntervalThink()
    {        
        // Reimagination: Arcane Glacier: For every second that Freezing Field is still channeling and active, Crystal Maiden's damage resistance increases by 5%, up to 50% at max duration. Lasts 2 seconds after the channeling of Freezing Field ends.
        this.ReimaginationArcaneGlacier()

        // Calculate direction and position of next explosion
        const caster_position = this.parent.GetAbsOrigin();
        const direction = this.parent.GetForwardVector();
        const explosion_distance = RandomInt(this.explosion_min_dist!, this.explosion_max_dist!);
        const front_position = (caster_position + direction * explosion_distance ) as Vector

        // Calculate qangle based on quadrant
        const qangle = QAngle(0, RandomInt((this.quadrant-1) * 90, this.quadrant * 90), 0);
        
        // Rotate position and declare final position for the explosion
        const explosion_position = RotatePosition(caster_position, qangle, front_position)

        // Incremenent quadrant
        if (this.quadrant == 4) this.quadrant = 1;
        else this.quadrant++;

        // Play sound
        EmitSoundOnLocationWithCaster(explosion_position, this.sound_explosion, this.parent);

        // Play particle
        this.particle_explosion_fx = ParticleManager.CreateParticle(this.particle_explosion, ParticleAttachment.CUSTOMORIGIN, this.parent);
        ParticleManager.SetParticleControl(this.particle_explosion_fx, 0, explosion_position);
        ParticleManager.ReleaseParticleIndex(this.particle_explosion_fx);

        // Reimagination: Subzero Crystal: Freezing Field's explosions has a chance to leave a Snowstorm Field on the impact location, applying the reimaginations of Crystal Nova.
        this.ReimaginationSubzeroCrystal(explosion_position);
        
        // Find all enemies in range
        const enemies = FindUnitsInRadius(this.parent.GetTeamNumber(),
                                          explosion_position,
                                          undefined,
                                          this.explosion_radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.ANY,
                                          false);

        for (const enemy of enemies)
        {
            let damage = this.damage!;

            // Reimagination: Numbing Cold: Frostbitten enemies in the Freezing Field AoE take 20% increased damage from Freezing Field explosions and become ministunned.
            damage = this.ReimaginationNumbingCold(enemy, damage)

            // Deal damage to enemies            
            ApplyDamage(
            {
                attacker: this.caster!,
                damage: damage,
                damage_type: this.ability.GetAbilityDamageType(),
                victim: enemy,
                ability: this.ability,
                damage_flags: DamageFlag.NONE
            });
        }                                        
    }

    ReimaginationNumbingCold(enemy: CDOTA_BaseNPC, damage: number): number
    {
        if (enemy.HasModifier(modifier_reimagined_crystal_maiden_frostbite_debuff.name))
        {
            // Apply stun modifier to the target
            enemy.AddNewModifier(this.caster, this.ability, "modifier_stunned", {duration: 0.1});

            // Return increased damage
            return damage + damage * this.numbing_cold_bonus_dmg_pct! * 0.01
        }

        return damage;
    }

    ReimaginationArcaneGlacier()
    {
        // Increase elapsed time
        this.elapsed_time += this.explosion_interval!;

        // If enough time elapsed to go through an interval, reset and proc
        if (this.elapsed_time >= this.arcane_glacier_interval!)
        {
            this.elapsed_time = 0;

            // Add the damage resistance modifier if caster doesn't have it already
            if (!this.parent.HasModifier(modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier.name))
            {
                this.parent.AddNewModifier(this.parent, this.ability, modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier.name, {duration: this.arcane_glacier_linger_duration!});
            }
            
            const modifier = this.parent.FindModifierByName(modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier.name);
            if (modifier)
            {
                // Increment a stack
                modifier.IncrementStackCount();
                modifier.ForceRefresh();
            }
        }
    }

    ReimaginationSubzeroCrystal(explosion_position: Vector)
    {
        // Roll psuedo chance
        if (RollPseudoRandomPercentage(this.subzero_crystal_chance!, PseudoRandom.CUSTOM_GAME_1, this.parent))
        {
            // Find ability
            const nova_ability = this.parent.FindAbilityByName(reimagined_crystal_maiden_crystal_nova.name)
            if (nova_ability && nova_ability.IsTrained())
            {
                // Create thinker on position
                CreateModifierThinker(this.parent, nova_ability, modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura.name, {duration: this.subzero_crystal_duration!}, explosion_position, this.parent.GetTeamNumber(), false);
            }
        }
    }

    IsAura() {return true}    
    GetAuraDuration() {return 1}    
    GetAuraRadius() {return 900}
    GetAuraSearchFlags() {return UnitTargetFlags.NONE}
    GetAuraSearchTeam() {return UnitTargetTeam.ENEMY}
    GetAuraSearchType() {return UnitTargetType.HERO + UnitTargetType.BASIC}
    GetModifierAura() {return "modifier_reimagined_crystal_maiden_freezing_field_slow"}

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PHYSICAL_ARMOR_BONUS]
    }

    GetModifierPhysicalArmorBonus(): number
    {
        return this.bonus_armor!;
    }
}