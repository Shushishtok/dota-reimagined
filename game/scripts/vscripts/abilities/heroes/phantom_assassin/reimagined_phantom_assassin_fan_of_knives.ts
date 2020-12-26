import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_fan_of_knives_debuff";

@registerAbility()
export class reimagined_phantom_assassin_fan_of_knives extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_PhantomAssassin.FanOfKnives.Cast";
    sound_impact: string = "Hero_PhantomAssassin.PreAttack";
    particle_knives: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_shard_fan_of_knives.vpcf";
    particle_knives_fx?: ParticleID;
    modifier_knives_debuff: string = "modifier_reimagined_phantom_assassin_fan_of_knives_debuff";
    hit_targets: Map<number, Set<CDOTA_BaseNPC>> = new Map();

    // Ability specials
    pct_health_damage?: number;
    duration?: number;
    radius?: number;
    projectile_speed?: number;

    OnInventoryContentsChanged(): void
    {
        if (util.HasScepterShard(this.caster))
        {
            this.SetHidden(false);
            this.SetLevel(1);
        }
        else
        {
            this.SetHidden(true);
        }
    }

    OnUpgrade()
    {
        this.pct_health_damage = this.GetSpecialValueFor("pct_health_damage");
        this.duration = this.GetSpecialValueFor("duration");
        this.radius = this.GetSpecialValueFor("radius");
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed");
    }

    OnSpellStart(): void
    {
        // Play cast sound
        this.caster.EmitSound(this.sound_cast);

        // Play particle
        this.particle_knives_fx = ParticleManager.CreateParticle(this.particle_knives, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControl(this.particle_knives_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_knives_fx, 3, this.caster.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_knives_fx);

        // Initialize radius and map based on gametime
        let current_radius = 0;
        let gametime = GameRules.GetGameTime();
        this.hit_targets.set(gametime, new Set());

        // Start thinking every frame
        Timers.CreateTimer(FrameTime(), () =>
        {
            // Increase radius by projectile speed, up to the maximum radius
            current_radius = math.min(current_radius + this.projectile_speed! * FrameTime(), this.radius!);

            // Find all enemies in current radius
            let enemies = util.FindUnitsAroundUnit(this.caster,
                                                   this.caster,
                                                   current_radius,
                                                   UnitTargetTeam.ENEMY,
                                                   UnitTargetType.HERO + UnitTargetType.BASIC,
                                                   UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS + UnitTargetFlags.MAGIC_IMMUNE_ENEMIES);

            // Ignore Roshan and any enemies that are in hit targets map
            enemies = enemies.filter(enemy =>
            {
                if (util.IsRoshan(enemy)) return false;
                if (this.hit_targets.has(gametime))
                {
                    return !this.hit_targets.get(gametime)!.has(enemy);
                }

                return false;
            });

            for (const enemy of enemies)
            {
                // Play cast sound
                enemy.EmitSound(this.sound_impact);

                // Add them to hit targets
                this.hit_targets.get(gametime)!.add(enemy);

                // Calculate damage based on their max health
                const damage = enemy.GetMaxHealth() * this.pct_health_damage! * 0.01;

                // Send Overhead alert magic damage
                SendOverheadEventMessage(undefined, OverheadAlert.BONUS_SPELL_DAMAGE, enemy, damage, undefined);

                // Deal damage
                ApplyDamage(
                {
                    attacker: this.caster,
                    damage: damage,
                    damage_type: this.GetAbilityDamageType(),
                    victim: enemy,
                    ability: this,
                    damage_flags: DamageFlag.NONE
                });

                // Apply break modifier
                enemy.AddNewModifier(this.caster, this, this.modifier_knives_debuff, {duration: this.duration});
            }

            // Check if maximum radius has been reached - otherwise, repeat
            if (current_radius >= this.radius!) return undefined;
            else return FrameTime();
        });
    }
}
