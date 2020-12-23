import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_nasal_goo_debuff"
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_nasal_goo_passive"
import { BristlebackTalents } from "./reimagined_bristleback_talents";

@registerAbility()
export class reimagined_bristleback_viscous_nasal_goo extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Bristleback.ViscousGoo.Cast";
    sound_impact: string = "Hero_Bristleback.ViscousGoo.Target";
    cast_responses = ["bristleback_bristle_nasal_goo_01", "bristleback_bristle_nasal_goo_02", "bristleback_bristle_nasal_goo_03", "bristleback_bristle_nasal_goo_04", "bristleback_bristle_nasal_goo_05", "bristleback_bristle_nasal_goo_06", "bristleback_bristle_nasal_goo_07"];
    projectile_goo: string = "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_goo.vpcf";
    modifier_goo = "modifier_reimagined_bristleback_nasal_goo_debuff";
    modifier_passive = "modifier_reimagined_bristleback_nasal_goo_passive";
    modifier_warpath = "modifier_reimagined_bristleback_warpath";

    // Ability specials
    goo_speed?: number;
    goo_duration?: number;
    goo_duration_creep?: number;
    radius_scepter?: number;
    stack_limit?: number;
    stack_limit_scepter?: number;

    // Reimagined properties
    raging_snot_active: boolean = true;

    // Reimagined specials
    raging_snot_warpath_stacks?: number;
    raging_snot_internal_cooldown?: number;

    // Reimagined talent properties
    modifier_quill_spray = "modifier_reimagined_bristleback_quill_spray_stacks";
    ability_quill_spray = "reimagined_bristleback_quill_spray";

    // Reimagined talent specials
    talent_1_stacks?: number;
    talent_2_cast_range_bonus_per_stack?: number;

    // Reimagination: Sneezer Pound: When attacking an enemy unit, grants a chance to automatically cast Nasal Goo on it, regardless of cooldown and mana. Doesn't trigger cooldown.
    GetIntrinsicModifierName(): string
    {
        return this.modifier_passive;
    }

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_goo.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_goo_debuff.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_goo.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_viscous_nasal_stack.vpcf", context);
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number
    {
        let cast_range;
        if (this.caster.HasScepter())
        {
            cast_range = this.GetSpecialValueFor("radius_scepter");
        }
        else
        {
            cast_range = super.GetCastRange(location, target);
        }

        // Talent: Snot Artillery: Increases Viscous Nasal Goo's cast range (or search range) by x per Warpath stack.
        cast_range += this.ReimaginedTalentSnotArtillery();
        return cast_range;
    }

    GetBehavior(): Uint64 | AbilityBehavior
    {
        let behaviors = AbilityBehavior.IGNORE_BACKSWING;
        if (this.caster.HasScepter()) behaviors += AbilityBehavior.NO_TARGET;
        else behaviors += AbilityBehavior.UNIT_TARGET;

        return behaviors;
    }

    OnUpgrade(): void
    {
        // Ability specials
        this.goo_speed = this.GetSpecialValueFor("goo_speed");
        this.goo_duration = this.GetSpecialValueFor("goo_duration");
        this.goo_duration_creep = this.GetSpecialValueFor("goo_duration_creep");
        this.radius_scepter = this.GetSpecialValueFor("radius_scepter");
        this.stack_limit = this.GetSpecialValueFor("stack_limit");
        this.stack_limit_scepter = this.GetSpecialValueFor("stack_limit_scepter");

        // Reimagined specials
        this.raging_snot_warpath_stacks = this.GetSpecialValueFor("raging_snot_warpath_stacks");
        this.raging_snot_internal_cooldown = this.GetSpecialValueFor("raging_snot_internal_cooldown");
    }

    OnSpellStart(): void
    {
        // Roll cast response
        if (this.caster.GetName() == "npc_dota_hero_bristleback" && RollPercentage(40))
        {
            this.caster.EmitSound(this.cast_responses[RandomInt(0, this.cast_responses.length - 1)])
        }

        // Play cast sound
        this.caster.EmitSound(this.sound_cast);

        // Non-scepter: get target and fire towards it
        if (!this.caster.HasScepter())
        {
            const target = this.GetCursorTarget();
            if (target)
            {
                this.FireNasalGoo(this.caster, target, true);
            }
        }
        // Scepter mode: Find all enemies in range and fire Nasal Goo on all of them!
        else
        {
            let scepter_radius = this.radius_scepter!;

            // Talent: Snot Artillery: Increases Viscous Nasal Goo's cast range (or search range) by x per Warpath stack.
            scepter_radius += this.ReimaginedTalentSnotArtillery();

            const enemies = util.FindUnitsAroundUnit(this.caster,
                                                     this.caster,
                                                     scepter_radius,
                                                     UnitTargetTeam.ENEMY,
                                                     UnitTargetType.HERO + UnitTargetType.BASIC,
                                                     UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS);

            // Fire Nasal Goo
            for (const enemy of enemies)
            {
                this.FireNasalGoo(this.caster, enemy, false);
            }
        }

        // Reimagined: Raging Snot: If Bristleback has at least 5 Warpath stacks, Nasal Goo refreshes its cooldown immediately upon cast. Has an internal cooldown of 5 seconds.
        this.ReimaginedRagingSnot();
    }

    FireNasalGoo(source: CDOTA_BaseNPC, target: CDOTA_BaseNPC, single_target: boolean)
    {
        let projectile_attachment: ProjectileAttachment;
        if (source.GetUnitName() == "npc_dota_hero_bristleback")
        {
            projectile_attachment = ProjectileAttachment.ATTACK_3;
        }
        else
        {
            projectile_attachment = ProjectileAttachment.HITLOCATION;
        }

        ProjectileManager.CreateTrackingProjectile({
            Ability: this,
            EffectName: this.projectile_goo,
            Source: source,
            Target: target,
            bDodgeable: true,
            flExpireTime: GameRules.GetGameTime() + 10,
            ExtraData: {single_target: single_target},
            bProvidesVision: false,
            iMoveSpeed: this.goo_speed,
            bVisibleToEnemies: true,
            vSourceLoc: source.GetAbsOrigin(),
            iSourceAttachment: projectile_attachment,
        });
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: {single_target: 0 | 1}): boolean | void
    {
        if (!target) return;

        // If target is magic immune, do nothing
        if (target.IsMagicImmune()) return;

        // If this was a single target Nasal Goo, check for Linken's Sphere
        if (extraData.single_target)
        {
            if (extraData.single_target == 1)
            {
                if (target.TriggerSpellAbsorb(this)) return;
            }
        }

        // Play impact sound
        target.EmitSound(this.sound_impact);

        // Adjust duration. Creep heroes are considered heroes
        let duration: number;
        if (target.IsHero() || target.IsConsideredHero()) duration = this.goo_duration!;
        else duration = this.goo_duration_creep!;

        // Apply modifier and add a stack
        if (!target.HasModifier(this.modifier_goo))
        {
            const modifier = target.AddNewModifier(this.caster, this, this.modifier_goo, {duration: duration});
            modifier.IncrementStackCount();
        }
        else
        {
            const modifier = target.FindModifierByName(this.modifier_goo);
            if (modifier)
            {
                modifier.ForceRefresh();

                // Define max stacks
                let stack_limit = this.stack_limit!;

                // Scepter: increases max stacks
                if (this.caster.HasScepter())
                {
                    stack_limit = this.stack_limit_scepter!;
                }

                if (modifier.GetStackCount() < stack_limit!)
                {
                    modifier.IncrementStackCount();
                }
            }
        }

        // Talent: Mucus Goo: Each Viscous Nasal Goo projectile that hits its target increases the stack count of its Quill Spray's debuff by x. Adds the debuff if it does not exist yet on the target.
        this.ReimaginedTalentMucusGoo(target);
    }

    ReimaginedRagingSnot()
    {
        // If Raging Snot is currently inactive, do nothing
        if (!this.raging_snot_active) return;

        // Check for warpath stacks
        if (this.caster.HasModifier(this.modifier_warpath))
        {
            // Check that stacks are at least at the threshold
            if (this.caster.GetModifierStackCount(this.modifier_warpath, this.caster) >= this.raging_snot_warpath_stacks!)
            {
                this.EndCooldown();

                // Set Raging Snot to inactive
                this.raging_snot_active = false;

                // Start a timer to wait for internal cooldown to come off
                Timers.CreateTimer(this.raging_snot_internal_cooldown!, () =>
                {
                    if (IsValidEntity(this) && !this.IsNull())
                    {
                        this.raging_snot_active = true;
                    }
                })
            }
        }
    }

    ReimaginedTalentMucusGoo(target: CDOTA_BaseNPC)
    {
        if (util.HasTalent(this.caster, BristlebackTalents.BristlebackTalent_1))
        {
            // Initialize variables
            if (!this.talent_1_stacks) this.talent_1_stacks = util.GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_1, "stacks");

            // If the target has the Quill Spray modifier, increment it
            if (target.HasModifier(this.modifier_quill_spray))
            {
                const modifier = target.FindModifierByName(this.modifier_quill_spray);
                if (modifier)
                {
                    modifier.SetStackCount(modifier.GetStackCount() + this.talent_1_stacks);
                }
            }
            else // Add the modifier to the target and add stacks to it
            {
                // Only apply if the caster has the Quill Spray ability
                if (this.caster.HasAbility(this.ability_quill_spray))
                {
                    const ability_handle = this.caster.FindAbilityByName(this.ability_quill_spray);
                    if (ability_handle)
                    {
                        const duration = ability_handle.GetSpecialValueFor("quill_stack_duration");
                        if (duration > 0)
                        {
                            const modifier = target.AddNewModifier(this.caster, ability_handle, this.modifier_quill_spray, {duration: duration});
                            if (modifier)
                            {
                                modifier.SetStackCount(modifier.GetStackCount() + this.talent_1_stacks);
                            }
                        }
                    }
                }
            }
        }
    }

    ReimaginedTalentSnotArtillery(): number
    {
        let bonus_cast_range = 0;
        if (util.HasTalent(this.caster, BristlebackTalents.BristlebackTalent_2))
        {
            // Initialize variables
            if (!this.talent_2_cast_range_bonus_per_stack) this.talent_2_cast_range_bonus_per_stack = util.GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_2, "cast_range_bonus_per_stack");

            // Calculate cast range bonus depending on Warpath stacks
            if (this.caster.HasModifier(this.modifier_warpath))
            {
                const stacks = this.caster.GetModifierStackCount(this.modifier_warpath, this.caster);
                if (stacks && stacks > 0)
                {
                    bonus_cast_range = stacks * this.talent_2_cast_range_bonus_per_stack;
                }
            }
        }

        return bonus_cast_range;
    }
}
