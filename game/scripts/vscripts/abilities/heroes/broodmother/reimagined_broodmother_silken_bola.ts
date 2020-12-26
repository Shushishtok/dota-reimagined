import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_charges } from "../../../modifiers/general_mechanics/modifier_reimagined_charges";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_silken_bola_debuff"

@registerAbility()
export class reimagined_broodmother_silken_bola extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Broodmother.SilkenBola.Cast";
    sound_impact: string = "Hero_Broodmother.SilkenBola.Target";
    projectile_bola: string = "particles/units/heroes/hero_broodmother/broodmother_silken_bola_projectile.vpcf";
    particle_fx?: ParticleID;
    ability_spin_web: string = "reimagined_broodmother_spin_web"
    modifier_charges: string = "modifier_reimagined_charges";
    modifier_debuff: string = "modifier_reimagined_broodmother_silken_bola_debuff"

    // Ability specials
    duration?: number;
    projectile_speed?: number;
    spin_web_charges_spend?: number;

    GetAssociatedPrimaryAbilities(): string
    {
        return this.ability_spin_web;
    }

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

    OnUpgrade(): void
    {
        this.duration = this.GetSpecialValueFor("duration");
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed");
        this.spin_web_charges_spend = this.GetSpecialValueFor("spin_web_charges_spend");
    }

    CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult | undefined
    {
        if (!IsServer()) return;

        // Find the Spin Web ability
        if (!this.caster.HasAbility(this.ability_spin_web)) return UnitFilterResult.FAIL_CUSTOM
        const ability_spin_web = this.caster.FindAbilityByName(this.ability_spin_web);

        // Check that it is trained
        if (!ability_spin_web) return UnitFilterResult.FAIL_CUSTOM;
        if (!ability_spin_web.IsTrained()) return UnitFilterResult.FAIL_CUSTOM;

        // Get all modifiers
        const modifiers = this.caster.FindAllModifiersByName(this.modifier_charges);

        // Find modifier charges with the Spin Web ability (if we can't, throw error)
        let spin_web_charges_modifier;
        for (const modifier of modifiers)
        {
            const modifier_ability = modifier.GetAbility()
            if (modifier_ability)
            {
                if (modifier_ability == ability_spin_web)
                {
                    spin_web_charges_modifier = modifier;
                    break;
                }
            }
        }

        if (!spin_web_charges_modifier) return UnitFilterResult.FAIL_CUSTOM;

        // Check that there is at least one charge
        if (spin_web_charges_modifier.GetStackCount() < this.spin_web_charges_spend!) return UnitFilterResult.FAIL_CUSTOM;

        // Verify cast filter results
        return UnitFilter(target, this.GetAbilityTargetTeam(), this.GetAbilityTargetType(), this.GetAbilityTargetFlags(), this.caster.GetTeamNumber());
    }

    GetCustomCastErrorTarget(target: CDOTA_BaseNPC): string | undefined
    {
        if (!IsServer()) return;

        // Find the Spin Web ability
        if (!this.caster.HasAbility(this.ability_spin_web)) return "#DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web";
        const ability_spin_web = this.caster.FindAbilityByName(this.ability_spin_web);

        // Check that it is trained
        if (!ability_spin_web) return "#DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web";
        if (!ability_spin_web.IsTrained()) return "#DOTA_Tooltip_cast_error_broodmother_silken_bola_spin_web_unleveled";

        // Get all modifiers
        const modifiers = this.caster.FindAllModifiersByName(this.modifier_charges);

        // Find modifier charges with the Spin Web ability (if we can't, throw error)
        let spin_web_modifier;
        for (const modifier of modifiers)
        {
            const modifier_ability = modifier.GetAbility()
            if (modifier_ability)
            {
                if (modifier_ability.GetAbilityName() == this.ability_spin_web)
                {
                    spin_web_modifier = modifier;
                    break;
                }
            }
        }

        // Technically, this shouldn't ever happen. But just in case, so it can be reported if needed.
        if (!spin_web_modifier) return "#DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charge_modifier";

        // Check that there is at least one charge
        if (spin_web_modifier.GetStackCount() < this.spin_web_charges_spend!) return "#DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charges";
    }

    OnSpellStart(): void
    {
        // Get target
        const target = this.GetCursorTarget();
        if (!target) return;

        // Play cast sound
        this.caster.EmitSound(this.sound_cast);

        // Get all modifiers of the caster
        let modifier_charges;
        const modifiers = this.caster.FindAllModifiersByName(this.modifier_charges);

        // Find the Spin Web charges modifier
        for (const modifier of modifiers)
        {
            const modifier_ability = modifier.GetAbility();
            if (modifier_ability)
            {
                if (modifier_ability.GetAbilityName() == this.ability_spin_web)
                {
                    modifier_charges = modifier;
                }
            }
        }

        if (!modifier_charges) return;

        // Spend charge(s)
        (modifier_charges as modifier_reimagined_charges).SetCurrentCharges(modifier_charges.GetStackCount() - this.spin_web_charges_spend!);

        // Fire projectile on target
        ProjectileManager.CreateTrackingProjectile(
        {
            Ability: this,
            EffectName: this.projectile_bola,
            Source: this.caster,
            Target: target,
            bDodgeable: true,
            bProvidesVision: false,
            bVisibleToEnemies: true,
            iMoveSpeed: this.projectile_speed,
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            vSourceLoc: this.caster.GetAbsOrigin()
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void
    {
        if (!target) return;

        // Does not if magic immune
        if (target.IsMagicImmune()) return;

        // Play impact sound
        target.EmitSound(this.sound_impact);

        // Trigger Spell Absorb; do nothing else if triggered
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            if (target.TriggerSpellAbsorb(this)) return;
        }

        // Add the debuff
        target.AddNewModifier(this.caster, this, this.modifier_debuff, {duration: this.duration!});
    }
}
