import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_avenger";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_spawn_spiderling_debuff";

@registerAbility()
export class reimagined_broodmother_spawn_spiderlings extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Broodmother.SpawnSpiderlingsCast";
    sound_impact: string = "Hero_Broodmother.SpawnSpiderlingsImpact";
    projectile_cast: string = "particles/units/heroes/hero_broodmother/broodmother_web_cast.vpcf";
    modifier_spideringlings_debuff: string = "modifier_reimagined_broodmother_spawn_spiderling_debuff";
    modifier_avenger: string = "modifier_reimagined_broodmother_avenger";

    // Ability specials
    buff_duration?: number;
    damage?: number;
    projectile_speed?: number;

    // Reimagined specials
    spiderlings_academy_damage_per_level?: number;
    spiderlings_academy_health_per_level?: number;
    spiderlings_academy_armor_per_level?: number;
    spiderlings_academy_magic_res_per_level?: number;
    spiderlings_academy_spiderites_pct?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_broodmother/broodmother_web_cast.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_broodmother/broodmother_spiderlings_debuff.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_broodmother/broodmother_spiderlings_spawn.vpcf", context);
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_avenger;
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget()!;

        // Ability specials
        this.buff_duration = this.GetSpecialValueFor("buff_duration");
        this.damage = this.GetSpecialValueFor("damage");
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed");

        // Reimagined specials
        this.spiderlings_academy_damage_per_level = this.GetSpecialValueFor("spiderlings_academy_damage_per_level");
        this.spiderlings_academy_health_per_level = this.GetSpecialValueFor("spiderlings_academy_health_per_level");
        this.spiderlings_academy_armor_per_level = this.GetSpecialValueFor("spiderlings_academy_armor_per_level");
        this.spiderlings_academy_magic_res_per_level = this.GetSpecialValueFor("spiderlings_academy_magic_res_per_level");
        this.spiderlings_academy_spiderites_pct = this.GetSpecialValueFor("spiderlings_academy_spiderites_pct");

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Fire projectile!
        ProjectileManager.CreateTrackingProjectile(
        {
            Ability: this,
            EffectName: this.projectile_cast,
            ExtraData: {},
            Source: this.caster,
            Target: target,
            bDodgeable: true,
            bDrawsOnMinimap: false,
            bIsAttack: false,
            bProvidesVision: false,
            bReplaceExisting: false,
            bVisibleToEnemies: true,
            iMoveSpeed: this.projectile_speed,
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            vSourceLoc: this.caster.GetAbsOrigin()
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): void
    {
        if (!target) return;

        // Check for Spell Absorb
        if (target.TriggerSpellAbsorb(this)) return;

        // If the target became magic immune during the projectile, ignore it
        if (target.IsMagicImmune()) return;

        // Play hit sound
        EmitSoundOn(this.sound_impact, target);

        // Add the spawn spiderling modifier to the target
        target.AddNewModifier(this.caster, this, this.modifier_spideringlings_debuff, {duration: this.buff_duration});

        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: this.damage!,
            damage_type: this.GetAbilityDamageType(),
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE
        });
    }

    ReimaginedSpiderlingAcademy(unit: CDOTA_BaseNPC, isSpiderite: boolean)
    {
        // Get the caster's current level
        const level = this.caster.GetLevel();

        // Calculate bonus damage, health, armor and magic resistance
        let bonus_damage = this.spiderlings_academy_damage_per_level! * level;
        let bonus_health = this.spiderlings_academy_health_per_level! * level;
        let bonus_armor = this.spiderlings_academy_armor_per_level! * level;
        let bonus_magic_resistance = this.spiderlings_academy_magic_res_per_level! * level;

        // Spiderites reduce the potency of Spiderlings Academy
        if (isSpiderite)
        {
            bonus_damage *= this.spiderlings_academy_spiderites_pct! * 0.01;
            bonus_health *= this.spiderlings_academy_spiderites_pct! * 0.01;
            bonus_armor *= this.spiderlings_academy_spiderites_pct! * 0.01;
            bonus_magic_resistance *= this.spiderlings_academy_spiderites_pct! * 0.01;
        }

        // Increase stats for the Spiderling
        unit.SetBaseDamageMin(unit.GetBaseDamageMin() + bonus_damage);
        unit.SetBaseDamageMax(unit.GetBaseDamageMax() + bonus_damage);
        unit.SetBaseMaxHealth(unit.GetBaseMaxHealth() + bonus_health);
        unit.SetHealth(unit.GetBaseMaxHealth());
        unit.SetPhysicalArmorBaseValue(unit.GetPhysicalArmorBaseValue() + bonus_armor);
        unit.SetBaseMagicalResistanceValue(unit.GetBaseMagicalResistanceValue() + bonus_magic_resistance);
        unit.CalculateGenericBonuses();
    }

}
