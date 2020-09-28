import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_crystal_nova_slow } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_crystal_nova_slow";
import { modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura"
 
@registerAbility()
export class reimagined_crystal_maiden_crystal_nova extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_precast: string = "hero_Crystal.CrystalNovaCast";
    sound_cast: string = "Hero_Crystal.CrystalNova";
    particle_crystal_nova: string = "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf";
    particle_crystal_nova_fx?: ParticleID;

    // Ability specials
    radius?: number;
    duration?: number
    vision_duration?: number;
    vision_radius?: number;
    nova_damage?: number;

    // Reimagined specials
    snowstorm_duration?: number;

    OnAbilityPhaseStart()
    {
        this.EmitSound(this.sound_precast);
        return true;
    }

    OnAbilityPhaseInterrupted()
    {
        this.StopSound(this.sound_precast);
    }

    GetAOERadius(): number
    {
        return this.GetSpecialValueFor("radius");
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target_position = this.GetCursorPosition();

        // Ability specials
        this.radius = this.GetSpecialValueFor("radius");
        this.duration = this.GetSpecialValueFor("duration");
        this.vision_duration = this.GetSpecialValueFor("vision_duration");
        this.vision_radius = this.GetSpecialValueFor("vision_radius");
        this.nova_damage = this.GetSpecialValueFor("nova_damage");        

        // Reimagined specials
        this.snowstorm_duration = this.GetSpecialValueFor("snowstorm_duration");        

        // Play cast sound
        EmitSoundOnLocationWithCaster(target_position, this.sound_cast, this.caster);

        // Apply FoW visibility around the target
        this.CreateVisibilityNode(target_position, this.vision_radius, this.vision_duration);

        // Play particle effect        
        this.particle_crystal_nova_fx = ParticleManager.CreateParticle(this.particle_crystal_nova, ParticleAttachment.CUSTOMORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_crystal_nova_fx, 0, target_position);
        ParticleManager.SetParticleControl(this.particle_crystal_nova_fx, 1, Vector(this.radius, this.duration, this.radius));
        ParticleManager.SetParticleControl(this.particle_crystal_nova_fx, 2, target_position);
        ParticleManager.ReleaseParticleIndex(this.particle_crystal_nova_fx);

        // Find all enemies in range        
        const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                          target_position,
                                          undefined,
                                          this.radius,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.ANY,
                                          false);

        for (const enemy of enemies)
        {            
            // Deal damage to each enemy            
            ApplyDamage(
            {
                attacker: this.caster,
                damage: this.nova_damage,
                damage_type: this.GetAbilityDamageType(),
                victim: enemy,
                ability: this,
                damage_flags: DamageFlag.NONE
            });
            
            // Apply slow modifier to each enemy
            enemy.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_crystal_nova_slow.name, {duration: this.duration});
        }                                        

        // Snowstorm Field: Leaves a snowstorm field on the ground where Crystal Nova was cast for 5 seconds. Has various effects for allies and enemies affected by it.
        this.ReimaginedSnowstormField(target_position)        
    }

    ReimaginedSnowstormField(target_position: Vector)
    {
        // Apply Snowstorm Field modifier thinker on cast position
        const thinker = CreateModifierThinker(this.caster, this, modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura.name, {duration: this.snowstorm_duration}, target_position, this.caster.GetTeamNumber(), false);        
    }
}