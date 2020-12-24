import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { CalculateDirectionToPosition, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";

@registerModifier()
export class modifier_reimagined_crystal_maiden_freezing_field_aura extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_channel: string = "hero_Crystal.freezingField.wind";
    sound_explosion: string = "hero_Crystal.freezingField.explosion"
    particle_snow_aura: string = "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_snow.vpcf";
    particle_snow_aura_fx?: ParticleID;
    particle_explosion: string = "particles/units/heroes/hero_crystalmaiden/maiden_freezing_field_explosion.vpcf";
    particle_explosion_fx?: ParticleID;
    scepter_enemy_list: Set<CDOTA_BaseNPC> = new Set();
    quadrant: number = 1;
    elapsed_time: number = 0;
    modifier_frostbite_debuff: string = "modifier_reimagined_crystal_maiden_frostbite_debuff";
    modifier_arcane_glacier: string = "modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier";
    modifier_snowstorm_aura: string = "modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_aura";
    ability_crystal_nova: string = "reimagined_crystal_maiden_crystal_nova";

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

    // Reimagined talent properties
    projectile_icy_drill_barrage: string = "particles/heroes/crystal_maiden/freezing_field_talent_projectile.vpcf";
    last_angle: number = 0;

    // Reimagined talent specials
    explosion_distance?: number;
    shard_speed?: number;
    shard_width?: number;
    shard_max_distance?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
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
        // Talent: Whirlwind of Frost: Freezing Field is no longer channeled, and is always centered around Crystal Maiden. If Crystal Maiden is disabled, the effect stops.
        if (this.ReimaginedTalentWhirlwindOfFrost()) return;

        // Reimagination: Arcane Glacier: For every second that Freezing Field is still channeling and active, Crystal Maiden's damage resistance increases by 5%, up to 50% at max duration. Lasts 2 seconds after the channeling of Freezing Field ends.
        this.ReimaginationArcaneGlacier()

        // Talent: Icy Drill Barrage: Freezing Field now can be set to auto cast. While auto cast is on, all explosions hit x units around Crystal Maiden, moving clockwise, then send a shard in that direction as a linear projectile. Shards deals explosion damage to a single unit.
        if (this.ReimaginationTalentIcyDrillBarrage()) return;

        // Calculate direction and position of next explosion
        const caster_position = this.parent.GetAbsOrigin();
        const direction = this.parent.GetForwardVector();
        const explosion_distance = RandomInt(this.explosion_min_dist!, this.explosion_max_dist!);
        const front_position = (caster_position + direction * explosion_distance ) as Vector

        // Calculate qangle based on quadrant
        const qangle = QAngle(0, RandomInt((this.quadrant-1) * 90, this.quadrant * 90), 0);

        // Rotate position and declare final position for the explosion
        let explosion_position = RotatePosition(caster_position, qangle, front_position)

        // Incremenent quadrant
        if (this.quadrant == 4) this.quadrant = 1;
        else this.quadrant++;

        this.FreezingProjectileHitPosition(explosion_position);
    }

    FreezingProjectileHitPosition(explosion_position: Vector)
    {
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
        if (enemy.HasModifier(this.modifier_frostbite_debuff))
        {
            // Apply stun modifier to the target
            enemy.AddNewModifier(this.caster, this.ability, BuiltInModifier.STUN, {duration: 0.1});

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
            if (!this.parent.HasModifier(this.modifier_arcane_glacier))
            {
                this.parent.AddNewModifier(this.parent, this.ability, this.modifier_arcane_glacier, {duration: this.arcane_glacier_linger_duration!});
            }

            const modifier = this.parent.FindModifierByName(this.modifier_arcane_glacier);
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
            const nova_ability = this.parent.FindAbilityByName(this.ability_crystal_nova)
            if (nova_ability && nova_ability.IsTrained())
            {
                // Create thinker on position
                CreateModifierThinker(this.parent, nova_ability, this.modifier_snowstorm_aura, {duration: this.subzero_crystal_duration!}, explosion_position, this.parent.GetTeamNumber(), false);
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
        return [ModifierFunction.PHYSICAL_ARMOR_BONUS,
                ModifierFunction.ON_ORDER]
    }

    GetModifierPhysicalArmorBonus(): number
    {
        return this.bonus_armor!;
    }

    OnOrder(event: ModifierUnitEvent)
    {
        if (!IsServer()) return;

        // Only apply on the parent's orders
        if (event.unit != this.parent) return;

        // Talent: Whirlwind of Frost: Freezing Field is no longer channeled, and is always centered around Crystal Maiden. If Crystal Maiden is disabled, the effect stops.
        this.ReimaginedTalentWhirlwindOfFrostStop(event);
    }

    ReimaginationTalentIcyDrillBarrage(): boolean
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7))
        {
            if (this.ability.GetAutoCastState())
            {
                // Initialize variables
                if (!this.explosion_distance) this.explosion_distance = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7, "explosion_distance");
                if (!this.shard_speed) this.shard_speed = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7, "shard_speed");
                if (!this.shard_width) this.shard_width = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7, "shard_width");
                if (!this.shard_max_distance) this.shard_max_distance = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_7, "shard_max_distance");

                // Get distance in front of the caster using the explosion distance
                const front_position = (this.caster.GetAbsOrigin() + this.caster.GetForwardVector() * this.explosion_distance) as Vector;

                // Get a location around the caster
                const qangle = QAngle(0, this.last_angle, 0);
                const explosion_position = RotatePosition(this.caster.GetAbsOrigin(), qangle, front_position);
                const direction = CalculateDirectionToPosition(this.caster.GetAbsOrigin(), explosion_position);

                // Update the direction
                this.last_angle += 18;
                if (this.last_angle >= 360) this.last_angle = 0;

                // Spawn a projectile!
                this.FreezingProjectileHitPosition(explosion_position);

                // Wait until the projectile hits the ground
                Timers.CreateTimer(0.35, () =>
                {
                    // Create a linear projectile shard from that position
                    ProjectileManager.CreateLinearProjectile(
                    {
                        Ability: this.ability,
                        EffectName: this.projectile_icy_drill_barrage,
                        Source: this.caster,
                        bDrawsOnMinimap: false,
                        bHasFrontalCone: false,
                        bIgnoreSource: false,
                        bProvidesVision: false,
                        bVisibleToEnemies: true,
                        fDistance: this.shard_max_distance,
                        fEndRadius: this.shard_width,
                        fExpireTime: GameRules.GetGameTime() + 10,
                        fMaxSpeed: undefined,
                        fStartRadius: this.shard_width,
                        iUnitTargetFlags: UnitTargetFlags.NONE,
                        iUnitTargetTeam: UnitTargetTeam.ENEMY,
                        iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                        vSpawnOrigin: this.caster.GetAttachmentOrigin(this.caster.ScriptLookupAttachment("attach_hitloc")),
                        vVelocity: (direction * this.shard_speed!) as Vector
                    });
                })

                return true;
            }
        }

        return false;
    }

    ReimaginedTalentWhirlwindOfFrost(): boolean
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_8))
        {
            // Check if caster is disabled (prevented from)
            if (this.caster.IsStunned() || this.caster.IsHexed() || this.caster.IsSilenced() || this.caster.IsOutOfGame() || this.caster.IsNightmared() || this.caster.IsFrozen() || this.caster.IsCommandRestricted() || !this.caster.IsAlive() || this.caster.GetForceAttackTarget() != undefined)
            {
                // Stop casting this
                this.ReimaginedTalentWhirlwindOfFrostEnd();
                return true;
            }
        }

        return false;
    }

    ReimaginedTalentWhirlwindOfFrostStop(event: ModifierUnitEvent)
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_8))
        {
            // If the order was a stop order, remove this modifier
            if (event.order_type == UnitOrder.HOLD_POSITION)
            {
                this.ReimaginedTalentWhirlwindOfFrostEnd();
            }
        }
    }

    ReimaginedTalentWhirlwindOfFrostEnd()
    {
        // Manual destruction of the modifier
        StopSoundOn(this.sound_channel, this.caster)
        this.caster.Stop();
        this.Destroy();
    }
}
