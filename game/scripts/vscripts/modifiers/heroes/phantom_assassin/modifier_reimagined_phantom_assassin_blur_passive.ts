import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_blur_turned_blade_cd } from "./modifier_reimagined_phantom_assassin_blur_turned_blade_cd";
import "./modifier_reimagined_phantom_assassin_talent_5_debuff";
import "./modifier_reimagined_phantom_assassin_talent_6_cooldown";

@registerModifier()
export class modifier_reimagined_phantom_assassin_blur_passive extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_turned_blade: string = "PhantomAssassin.TurnedBlade.Counter";
    particle_turned_blade: string = "particles/heroes/phantom_assassin/blur_turned_your_blade.vpcf";
    particle_turned_blade_fx?: ParticleID;

    // Modifier specials
    bonus_evasion?: number;

    // Reimagined specials
    turned_blade_internal_cooldown?: number;

    // Reimagined talent specials
    talent_5_evasion_pct?: number;
    talent_5_evasion_duration?: number;
    talent_6_search_radius?: number;
    talent_6_blur_duration?: number;
    talent_6_blur_cooldown?: number;

    IsHidden() {
        return true;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }
    RemoveOnDeath() {
        return false;
    }

    OnCreated(): void {
        // Modifier specials
        this.bonus_evasion = this.ability.GetSpecialValueFor("bonus_evasion");

        // Reimagined specials
        this.turned_blade_internal_cooldown = this.ability.GetSpecialValueFor("turned_blade_internal_cooldown");
    }

    OnRefresh(): void {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.EVASION_CONSTANT,
            ModifierFunction.ON_DEATH,
            // Reimagined: Turned Your Blade: Phantom Assassin instantly attacks any enemy within range that misses her with an attack. Has an internal cooldown of x seconds.
            ModifierFunction.ON_ATTACK_FAIL,
            // // Talent: Soft on the Eye: When disjointing a tracking projectile or evading a ranged attack and there are no enemies in x units, grants active Blur's effects for free for y seconds. This effect can only occur once every z seconds. Does not trigger if Blur is already active.
            ModifierFunction.ON_PROJECTILE_DODGE,
        ];
    }

    GetModifierEvasion_Constant(event: ModifierAttackEvent): number {
        // Does nothing if the caster is broken
        if (this.parent.PassivesDisabled()) return 0;

        let bonus_evasion = this.bonus_evasion;

        // Talent: Immaterial Girl: Upon proccing Turned Your Blade on an enemy, grants x% evasion against that enemy for y second.
        bonus_evasion = this.ReimaginedTalentImmaterialGirlEvasion(event.attacker);
        return bonus_evasion!;
    }

    OnDeath(event: ModifierInstanceEvent): void {
        // Only triggers when the attacker is the parent
        if (this.parent != event.attacker) return;

        // Only triggers if the parent has a scepter
        if (!this.parent.HasScepter()) return;

        // Find all basic abilities and refresh their cooldown
        for (let index = 0; index < 32; index++) {
            const ability = this.parent.GetAbilityByIndex(index);
            if (ability) {
                if (
                    ability.IsTrained() &&
                    !ability.IsCooldownReady() &&
                    ability.GetAbilityType() != AbilityTypes.ULTIMATE
                ) {
                    ability.EndCooldown();
                }
            }
        }
    }

    OnAttackFail(event: ModifierAttackEvent) {
        // Only apply if the target is the parent
        if (event.target != this.parent) return;

        // Reimagined: Turned Your Blade: Phantom Assassin instantly attacks any enemy within range that misses her with an attack. Has an internal cooldown of x seconds.
        this.ReimaginedTurnedYourBlade(event);

        // Talent: Soft on the Eye: When disjointing a tracking projectile or evading a ranged attack and there are no enemies in x units, grants active Blur's effects for free for y seconds. This effect can only occur once every z seconds. Does not trigger if Blur is already active.
        this.ReimaginedTalentSoftOnTheEye();
    }

    OnProjectileDodge(event: ModifierAttackEvent): void {
        // Only apply if the target is the parent
        if (event.target != this.parent) return;

        // Talent: Soft on the Eye: When disjointing a tracking projectile or evading a ranged attack and there are no enemies in x units, grants active Blur's effects for free for y seconds. This effect can only occur once every z seconds. Does not trigger if Blur is already active.
        this.ReimaginedTalentSoftOnTheEye();
    }

    ReimaginedTurnedYourBlade(event: ModifierAttackEvent) {
        if (!IsServer()) return;

        // Only apply on the caster being attacked
        if (this.parent != event.target) return;

        // Only when being attacked by an enemy
        if (this.parent.GetTeamNumber() == event.attacker.GetTeamNumber()) return;

        // Does nothing when parent is broken
        if (this.parent.PassivesDisabled()) return;

        // Not including wards and buildings
        if (event.attacker.IsBuilding() || event.attacker.IsOther()) return;

        // Not including enemies that are out of her attack range. Include hull radius of both attacker and parent since they can reach the edge of their hulls
        const distance = util.CalculateDistanceBetweenEntities(this.parent, event.attacker);
        if (
            distance >
            this.parent.GetHullRadius() + this.parent.Script_GetAttackRange() + event.attacker.GetHullRadius()
        )
            return;

        // Check if the flag is set
        if (!event.attacker.HasModifier(modifier_reimagined_phantom_assassin_blur_turned_blade_cd.name)) {
            // Perform instant attack against the attacker
            this.parent.PerformAttack(event.attacker, true, true, true, false, false, false, false);

            // Play sound
            EmitSoundOn(this.sound_turned_blade, event.attacker);

            // Play particles
            this.particle_turned_blade_fx = ParticleManager.CreateParticle(
                this.particle_turned_blade,
                ParticleAttachment.ABSORIGIN_FOLLOW,
                event.attacker
            );
            ParticleManager.SetParticleControl(this.particle_turned_blade_fx, 0, event.attacker.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(this.particle_turned_blade_fx);

            // Give CD modifier to attacker
            event.attacker.AddNewModifier(
                this.parent,
                this.ability,
                modifier_reimagined_phantom_assassin_blur_turned_blade_cd.name,
                { duration: this.turned_blade_internal_cooldown }
            );

            // Talent: Immaterial Girl: Upon proccing Turned Your Blade on an enemy, grants x% evasion against that enemy for y second.
            this.ReimaginedTalentImmaterialGirlRegister(event.attacker);
        }
    }

    ReimaginedTalentImmaterialGirlEvasion(attacker: CDOTA_BaseNPC): number {
        if (attacker && attacker.HasModifier("modifier_reimagined_phantom_assassin_talent_5_debuff")) {
            if (!this.talent_5_evasion_pct)
                this.talent_5_evasion_pct = util.GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_5,
                    "talent_5_evasion_pct"
                );
            return this.talent_5_evasion_pct;
        }

        return this.bonus_evasion!;
    }

    ReimaginedTalentImmaterialGirlRegister(attacker: CDOTA_BaseNPC) {
        if (util.HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_5)) {
            if (!this.talent_5_evasion_duration)
                this.talent_5_evasion_duration = util.GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_5,
                    "talent_5_evasion_duration"
                );
            attacker.AddNewModifier(this.caster, this.ability, "modifier_reimagined_phantom_assassin_talent_5_debuff", {
                duration: this.talent_5_evasion_duration,
            });
        }
    }

    ReimaginedTalentSoftOnTheEye(): void {
        if (!IsServer()) return;

        if (util.HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_6)) {
            // Initialize variables
            if (!this.talent_6_search_radius)
                this.talent_6_search_radius = util.GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_6,
                    "talent_6_search_radius"
                );
            if (!this.talent_6_blur_duration)
                this.talent_6_blur_duration = util.GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_6,
                    "talent_6_blur_duration"
                );
            if (!this.talent_6_blur_cooldown)
                this.talent_6_blur_cooldown = util.GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_6,
                    "talent_6_blur_cooldown"
                );

            // Does nothing if the Blur active modifier is already in effect
            if (this.caster.HasModifier("modifier_reimagined_phantom_assassin_blur_active")) return;

            // Does nothing if the talent cooldown modifier still exists
            if (this.caster.HasModifier("modifier_reimagined_phantom_assassin_talent_6_cooldown")) return;

            // Check for nearby enemies, including towers
            const enemies = util.FindUnitsAroundUnit(
                this.caster,
                this.caster,
                this.talent_6_search_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC + UnitTargetType.BUILDING,
                UnitTargetFlags.MAGIC_IMMUNE_ENEMIES +
                    UnitTargetFlags.FOW_VISIBLE +
                    UnitTargetFlags.NO_INVIS +
                    UnitTargetFlags.OUT_OF_WORLD +
                    UnitTargetFlags.INVULNERABLE
            );

            let found_enemy: boolean = false;
            for (const enemy of enemies) {
                // Ignore buildings that are not towers
                if (enemy.IsBuilding() && !enemy.IsTower()) continue;

                found_enemy = true;
                break;
            }

            // If we found at least one valid enemy, do nothing
            if (found_enemy) return;

            // Blur!
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_reimagined_phantom_assassin_blur_active", {
                duration: this.talent_6_blur_duration,
            });

            // Give self the cooldown
            this.caster.AddNewModifier(
                this.caster,
                this.ability,
                "modifier_reimagined_phantom_assassin_talent_6_cooldown",
                { duration: this.talent_6_blur_cooldown }
            );
        }
    }
}
