import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff } from "./modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff";
import { modifier_reimagined_crystal_maiden_crystal_nova_hailwind_slow } from "./modifier_reimagined_crystal_maiden_crystal_nova_hailwind_slow"

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();    
    particle_snowstorm: string = "particles/heroes/crystal_maiden/snowstorm_field.vpcf";
    particle_snowstorm_fx?: ParticleID;
    particle_hailwinds: string = "particles/heroes/crystal_maiden/hailwind_shards.vpcf";
    particle_hailwinds_fx?: ParticleID;

    // Modifier specials
    radius?: number;

    // Reimagined specials
    hailwind_radius?: number;
    hailwind_interval?: number;
    hailwind_damage?: number;
    hailwind_duration?: number;    

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.radius = this.ability!.GetSpecialValueFor("radius");

        // Reimagined specials
        this.hailwind_radius = this.ability!.GetSpecialValueFor("hailwind_radius");
        this.hailwind_interval = this.ability!.GetSpecialValueFor("hailwind_interval");
        this.hailwind_damage = this.ability!.GetSpecialValueFor("hailwind_damage");
        this.hailwind_duration = this.ability!.GetSpecialValueFor("hailwind_duration");

        // Play particle effect
        if (IsServer())
        {
            const ground_position = GetGroundPosition(this.parent.GetAbsOrigin(), undefined);
            this.particle_snowstorm_fx = ParticleManager.CreateParticle(this.particle_snowstorm, ParticleAttachment.WORLDORIGIN, undefined);
            ParticleManager.SetParticleControl(this.particle_snowstorm_fx, 0, ground_position);
            ParticleManager.SetParticleControl(this.particle_snowstorm_fx, 1, Vector(this.radius!, 0, 0));                
            this.AddParticle(this.particle_snowstorm_fx, false, false, -1, false, false);
        }

        // Reimagined: Hail Winds: While the field where Crystal Nova was cast is up, it periodically releases chilly winds that extend to 1200 range around the center, dealing additional minor damage and slowing enemies in range.
        this.ReimaginedHailWinds();        
    }

    ReimaginedHailWinds(): void
    {
        if (IsServer())
        {
            this.StartIntervalThink(this.hailwind_interval!);
        }
    }    

    OnIntervalThink(): void
    {
        // Calculate speed for the particle
        const lifetime = 0.5;
        const speed = this.hailwind_radius! / lifetime;

        // Play particle effect
        this.particle_hailwinds_fx = ParticleManager.CreateParticle(this.particle_hailwinds, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_hailwinds_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_hailwinds_fx, 1, Vector(speed, lifetime, 0));
        ParticleManager.ReleaseParticleIndex(this.particle_hailwinds_fx);

        // Find all enemies in range
        const enemies = FindUnitsInRadius(this.caster!.GetTeamNumber(),
                                          this.parent.GetAbsOrigin(),
                                          undefined,
                                          this.hailwind_radius!,
                                          UnitTargetTeam.ENEMY,
                                          UnitTargetType.HERO + UnitTargetType.BASIC,
                                          UnitTargetFlags.NONE,
                                          FindOrder.ANY,
                                          false);

        for (const enemy of enemies)
        {
            // Deal damage            
            ApplyDamage(
            {
                attacker: this.caster!,
                damage: this.hailwind_damage!,
                damage_type: this.ability!.GetAbilityDamageType(),
                victim: enemy,
                ability: this.ability!,
                damage_flags: DamageFlag.NONE
            });

            // Apply Hailwind slow modifier
            enemy.AddNewModifier(this.caster!, this.ability!, modifier_reimagined_crystal_maiden_crystal_nova_hailwind_slow.name, {duration: this.hailwind_duration!});
        }
    }

    IsAura() {return true}
    GetAuraDuration() {return 0.5}
    GetAuraRadius() {return this.radius!}
    GetAuraSearchFlags() {return UnitTargetFlags.NONE}
    GetAuraSearchTeam() {return UnitTargetTeam.BOTH}
    GetAuraSearchType() {return UnitTargetType.HERO + UnitTargetType.BASIC}
    GetModifierAura() {return modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff.name}
}