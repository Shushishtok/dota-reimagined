import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { CalculateDirectionToPosition, CalculateDistanceBetweenPoints, HasScepterShard } from "../../../lib/util";
import { reimagined_bristleback_quill_spray } from "./reimagined_bristleback_quill_spray";
import { reimagined_bristleback_viscous_nasal_goo } from "./reimagined_bristleback_viscous_nasal_goo";

@registerAbility()
export class reimagined_bristleback_hairball extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Bristleback.Hairball.Cast";
    particle_hairball: string = "particles/units/heroes/hero_bristleback/bristleback_hairball.vpcf";
    particle_hairball_fx?: ParticleID;
    ability_nasal_goo: string = "reimagined_bristleback_viscous_nasal_goo";
    ability_quill: string = "reimagined_bristleback_quill_spray";

    // Ability specials
    projectile_speed?: number;
    radius?: number;
    nasal_goo_count?: number;
    quill_spray_count?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_hairball.vpcf", context);
    }

    OnInventoryContentsChanged(): void
    {
        if (HasScepterShard(this.caster))
        {
            this.SetHidden(false);
            this.SetLevel(1);
        }
        else
        {
            this.SetHidden(true);
        }
    }

    GetAOERadius(): number
    {
        return this.GetSpecialValueFor("radius");
    }

    OnUpgrade(): void
    {
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed");
        this.radius = this.GetSpecialValueFor("radius")
        this.nasal_goo_count = this.GetSpecialValueFor("nasal_goo_count");
        this.quill_spray_count = this.GetSpecialValueFor("quill_spray_count");
    }

    OnSpellStart(): void
    {
        const target_position = this.GetCursorPosition();
        const direction = CalculateDirectionToPosition(this.caster.GetAbsOrigin(), target_position);
        const distance = CalculateDistanceBetweenPoints(this.caster.GetAbsOrigin(), target_position);

        // Play sound
        this.caster.EmitSound(this.sound_cast);

        // Throw Hairball!
        ProjectileManager.CreateLinearProjectile(
        {
            Ability: this,
            EffectName: this.particle_hairball,
            Source: this.caster,
            bDrawsOnMinimap: false,
            bHasFrontalCone: false,
            bIgnoreSource: false,
            bProvidesVision: false,
            bVisibleToEnemies: true,
            fDistance: distance,
            fEndRadius: 0,
            fExpireTime: GameRules.GetGameTime() + 10,
            fMaxSpeed: undefined,
            fStartRadius: 0,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            iUnitTargetTeam: UnitTargetTeam.NONE,
            iUnitTargetType: UnitTargetType.NONE,
            vSpawnOrigin: this.caster.GetAttachmentOrigin(this.caster.ScriptLookupAttachment("attach_hitloc")),
            vVelocity: (direction * this.projectile_speed! * Vector (1,1,0)) as Vector
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector)
    {
        // Ignore targets, though it shouldn't be finding any
        if (target) return;

        if (!target) // Reached max distance
        {
            const original_pos = this.caster.GetAbsOrigin();
            this.caster.SetAbsOrigin(location);

            // Check for Nasal Goo ability
            if (this.caster.HasAbility(this.ability_nasal_goo))
            {
                const ability_nasal_goo = this.caster.FindAbilityByName(this.ability_nasal_goo) as reimagined_bristleback_viscous_nasal_goo;
                if (ability_nasal_goo && ability_nasal_goo.IsTrained())
                {
                    // Find all enemies in radius
                    const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                      location,
                                                      undefined,
                                                      this.radius!,
                                                      UnitTargetTeam.ENEMY,
                                                      UnitTargetType.HERO + UnitTargetType.BASIC,
                                                      UnitTargetFlags.NO_INVIS,
                                                      FindOrder.ANY,
                                                      false);


                    // Fire Nasal Goos at all those enmies enemies
                    for (const enemy of enemies)
                    {
                        for (let index = 0; index < this.nasal_goo_count!; index++)
                        {
                            ability_nasal_goo.FireNasalGoo(this.caster, enemy, false);
                        }
                    }
                }
            }

            // Check for Quill Spray ability
            if (this.caster.HasAbility(this.ability_quill))
            {
                const ability_quill = this.caster.FindAbilityByName(this.ability_quill) as reimagined_bristleback_quill_spray;
                if (ability_quill && ability_quill.IsTrained())
                {
                    // Fire Quill Sprays at all enemies in radius
                    for (let index = 0; index < this.quill_spray_count!; index++)
                    {
                        ability_quill.FireQuillSpray(this.radius!);
                    }
                }
            }

            this.caster.SetAbsOrigin(original_pos);
        }
    }
}
