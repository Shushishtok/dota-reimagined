import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike } from "./modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike";
import { modifier_reimagined_phantom_assassin_stifling_dagger_caster } from "./modifier_reimagined_phantom_assassin_stifling_dagger_caster";
import "./modifier_reimagined_phantom_assassin_talent_7_cooldown";

@registerModifier()
export class modifier_reimagined_phantom_assassin_coup_de_grace_passive extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_crit: string = "Hero_PhantomAssassin.CoupDeGrace";
    sound_decisive_crit: string = "PhantomAssassin.DecisiveStrike.Hit";
    particle_crit: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_crit_impact.vpcf";
    particle_crit_fx?: ParticleID;
    crit_record_map: Map<number, boolean> = new Map();

    // Modifier specials
    crit_chance?: number;
    crit_bonus?: number;

    // Reimagined properties
    marked_for_death_bonus: number = 0;

    // Reimagined specials
    kiss_of_death_health_threshold?: number;
    kiss_of_death_kill_chance?: number;
    marked_for_death_damage_increase?: number;
    decisive_strike_crit_chance_increase?: number;
    decisive_strike_crits_to_remove?: number;

    // Reimagined talent specials
    talent_7_health_threshold?: number;
    talent_7_proc_cooldown?: number;
    talent_8_crit_damage_bonus?: number;

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
        // Modifier properties

        this.ability = this.GetAbility()!;

        // Modifier specials
        this.crit_chance = this.ability.GetSpecialValueFor("crit_chance");
        this.crit_bonus = this.ability.GetSpecialValueFor("crit_bonus");

        // Reimagined specials
        this.kiss_of_death_health_threshold = this.ability.GetSpecialValueFor("kiss_of_death_health_threshold");
        this.kiss_of_death_kill_chance = this.ability.GetSpecialValueFor("kiss_of_death_kill_chance");
        this.marked_for_death_damage_increase = this.ability.GetSpecialValueFor("marked_for_death_damage_increase");
        this.decisive_strike_crit_chance_increase = this.ability.GetSpecialValueFor(
            "decisive_strike_crit_chance_increase"
        );
        this.decisive_strike_crits_to_remove = this.ability.GetSpecialValueFor("decisive_strike_crits_to_remove");
    }

    OnRefresh(): void {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.PREATTACK_CRITICALSTRIKE, ModifierFunction.ON_ATTACK_RECORD_DESTROY];
    }

    GetModifierPreAttack_CriticalStrike(event: ModifierAttackEvent): number | undefined {
        // Does not apply on allies, buildings or wards
        if (
            event.target.GetTeamNumber() == this.parent.GetTeamNumber() ||
            event.target.IsBuilding() ||
            event.target.IsOther()
        )
            return;

        // Does not apply if the parent is disabled
        if (this.parent.PassivesDisabled()) return;

        let crit_chance = this.crit_chance!;

        // Reimagined: Decisive Strike: Coup de Grace can be no-target cast. Doing so reduces Phantom Assassin's attack speed by x, but increases the chance to proc Coup de Grace by y%. Lasts for z seconds, or until Phantom Assassin crits v times.
        crit_chance += this.ReimaginedDecisiveStrike(false);

        // Reimagined: Sharp and Quiet: Stifling Dagger's chance to proc Coup de Grace's increases by x% chance for every y% health that the enemy unit has. Does not include 100% health.
        crit_chance += this.ReimaginedStiflingDagger_SharpAndQuiet(event);

        // Talent: Mercy Killing: When Phantom Assassin's current attack target has less than x% health, her next attack on it will guarantee a Coup de Grace proc. This effect can trigger only once every y seconds.
        crit_chance = this.ReimaginedTalentMercyKillingCritical(crit_chance, event.target);

        // Roll for a standard crit
        if (RollPseudoRandomPercentage(crit_chance, PseudoRandom.CUSTOM_GAME_1, this.parent)) {
            // Crit: Enter crit-attack into the map
            this.crit_record_map.set(event.record, true);

            let crit_damage = this.crit_bonus!;

            // Reimagined: Marked For Death: Each attack that doesn't proc Coup De Grace increases its crit damage by x%. Resets when Coup de Grace is triggered.
            crit_damage += this.ReimaginedMarkedForDeath(true);

            // Talent: Clean Streak: While Decisive Strike is active, if Phantom Assassin's target is stunned when she begins the attack, the attack speed penalty is reduced by x% and Coup De Grace's critical damage increases by y%.
            crit_damage += this.ReimaginedTalentCleanStreak(crit_damage, event.target);

            // Reimagined: Kiss of Death: When Phantom Assassin delivers a critical strike from Coup de Grace to a target with less than x% health, there is a y% chance that the critical damage will deal fatal damage. However, it doesn't guarantees a kill.
            crit_damage = this.ReimaginedKissOfDeath(event, crit_damage);

            return crit_damage;
        }

        // Reimagined: Marked For Death: Each attack that doesn't proc Coup De Grace increases its crit damage by x%. Resets when Coup de Grace is triggered.
        this.ReimaginedMarkedForDeath(false);

        // No crit: Enter none-crit attack into the map
        this.crit_record_map.set(event.record, false);
    }

    OnAttackRecordDestroy(event: ModifierAttackEvent) {
        if (!IsServer()) return;

        // Ignore all attacks that did not come from the parent
        if (event.attacker != this.parent) return;

        // Make sure the record of the attack exists in the map; otherwise, do nothing
        if (!this.crit_record_map.has(event.record)) return;

        // Check if the record was mapped as a crit
        const crit = this.crit_record_map.get(event.record);

        // Remove record from map to not allow the map to become huuuuuuge and potentially destroy the world
        this.crit_record_map.delete(event.record);

        if (crit) {
            // Reimagined: Decisive Strike: Coup de Grace can be no-target cast. Doing so reduces Phantom Assassin's attack speed by x, but increases the chance to proc Coup de Grace by y%. Lasts for z seconds, or until Phantom Assassin crits v times.
            // Reduce remaining crits and remove modifier if no more attacks left
            this.ReimaginedDecisiveStrike(true);

            // Play crit sound
            EmitSoundOn(this.sound_crit, event.target);

            // Play crit particle
            this.particle_crit_fx = ParticleManager.CreateParticle(
                this.particle_crit,
                ParticleAttachment.ABSORIGIN_FOLLOW,
                event.target
            );
            ParticleManager.SetParticleControlEnt(
                this.particle_crit_fx,
                0,
                event.target,
                ParticleAttachment.POINT_FOLLOW,
                "attach_hitloc",
                event.target.GetAbsOrigin(),
                true
            );
            ParticleManager.SetParticleControl(this.particle_crit_fx, 1, event.target.GetAbsOrigin());
            ParticleManager.SetParticleControlOrientation(
                this.particle_crit_fx,
                1,
                (this.parent.GetForwardVector() * -1) as Vector,
                this.parent.GetRightVector(),
                this.parent.GetUpVector()
            );
            ParticleManager.ReleaseParticleIndex(this.particle_crit_fx);
        }
    }

    ReimaginedKissOfDeath(event: ModifierAttackEvent, crit_bonus: number): number {
        if (event.target.GetHealthPercent() <= this.kiss_of_death_health_threshold!) {
            if (RollPseudoRandomPercentage(this.kiss_of_death_kill_chance!, PseudoRandom.CUSTOM_GAME_1, this.parent)) {
                crit_bonus = 9999;
            }
        }

        return crit_bonus;
    }

    ReimaginedMarkedForDeath(crit: boolean): number {
        if (crit) {
            // Reset the crit bonus
            const bonus = this.marked_for_death_bonus;
            this.marked_for_death_bonus = 0;

            // Return bonus
            return bonus;
        } else {
            // Increase value for Marked For Death crit bonus
            this.marked_for_death_bonus += this.marked_for_death_damage_increase!;
            return 0;
        }
    }

    ReimaginedDecisiveStrike(crit: boolean): number {
        // Determine if the parent has the Decisive Strike modifier. Do nothing otherwise
        let has_modifier = this.parent.HasModifier(
            modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike.name
        );
        let modifier: modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike;
        if (has_modifier) {
            modifier = this.parent.FindModifierByName(
                modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike.name
            ) as modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike;
        } else {
            return 0;
        }

        if (crit) {
            // Reduce number of crits left in the modifier
            modifier.decisive_strike_attacks_remaining--;

            // Stop previous iteration and play crit sound
            StopSoundOn(this.sound_decisive_crit, this.caster);
            EmitSoundOn(this.sound_decisive_crit, this.caster);

            // Check if modifier needs to be destroyed
            if (modifier.decisive_strike_attacks_remaining == 0) {
                modifier.Destroy();
            }

            return 0;
        } else {
            return this.decisive_strike_crit_chance_increase!;
        }
    }

    ReimaginedStiflingDagger_SharpAndQuiet(event: ModifierAttackEvent): number {
        let bonus_crit = 0;

        if (this.caster.HasModifier(modifier_reimagined_phantom_assassin_stifling_dagger_caster.name)) {
            if (this.caster.HasAbility("reimagined_phantom_assassin_stifling_dagger")) {
                const stifling_dagger_ability = this.caster.FindAbilityByName(
                    "reimagined_phantom_assassin_stifling_dagger"
                );
                if (stifling_dagger_ability) {
                    // Ability properties
                    const sharp_and_quite_crit_per_stack = stifling_dagger_ability.GetSpecialValueFor(
                        "sharp_and_quite_crit_per_stack"
                    );
                    const sharp_and_quite_hp_threshold_per_stack = stifling_dagger_ability.GetSpecialValueFor(
                        "sharp_and_quite_hp_threshold_per_stack"
                    );

                    // Get health percentage
                    let health_percentage = event.target.GetHealthPercent();

                    // Find how many instances of bonus damage needs to be given
                    const instances = Math.floor(health_percentage / sharp_and_quite_hp_threshold_per_stack);
                    if (instances > 0) {
                        bonus_crit += instances * sharp_and_quite_crit_per_stack;
                    }
                }
            }
        }
        return bonus_crit;
    }

    ReimaginedTalentMercyKillingCritical(crit_chance: number, target: CDOTA_BaseNPC): number {
        if (HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_7)) {
            if (!this.talent_7_health_threshold)
                this.talent_7_health_threshold = GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_7,
                    "talent_7_health_threshold"
                );
            if (!this.talent_7_proc_cooldown)
                this.talent_7_proc_cooldown = GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_7,
                    "talent_7_proc_cooldown"
                );

            // If the parent has the cooldown modifier, return the regular crit chance
            if (this.parent.HasModifier("modifier_reimagined_phantom_assassin_talent_7_cooldown")) return crit_chance;

            // Check if the target has health below the threshold
            if (target.GetHealthPercent() <= this.talent_7_health_threshold) {
                // Add the cooldown modifier
                this.parent.AddNewModifier(
                    this.caster,
                    this.ability,
                    "modifier_reimagined_phantom_assassin_talent_7_cooldown",
                    { duration: this.talent_7_proc_cooldown }
                );

                // Guarantee a critical
                return 100;
            }
        }

        return crit_chance;
    }

    ReimaginedTalentCleanStreak(crit_damage: number, target: CDOTA_BaseNPC): number {
        if (HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_8)) {
            // Initialize variables
            if (!this.talent_8_crit_damage_bonus)
                this.talent_8_crit_damage_bonus = GetTalentSpecialValueFor(
                    this.caster,
                    PhantomAssassinTalents.PhantomAssassinTalent_8,
                    "talent_8_crit_damage_bonus"
                );

            // Only apply if the caster has Decisive Strike active
            if (this.parent.HasModifier(modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike.name)) {
                let modifier = this.parent.FindModifierByName(
                    modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike.name
                ) as modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike;
                if (modifier) {
                    // Only apply if the target is stunned
                    if (target.IsStunned()) {
                        // Trigger the modifier's attack speed penalty reduction
                        modifier.attacking_stunned_target = true;
                        // Increase crit damage
                        return crit_damage * (1 + this.talent_8_crit_damage_bonus * 0.01);
                    } else {
                        // Remove the attack speed penalty reduction
                        modifier.attacking_stunned_target = true;

                        // Return original crit damage
                        return crit_damage;
                    }
                }
            }
        }

        return crit_damage;
    }
}
