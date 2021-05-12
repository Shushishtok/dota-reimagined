import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_night_stalker_dark_ascension_active } from "./modifier_reimagined_night_stalker_dark_ascension_active";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "./modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night";
import { modifier_reimagined_night_stalker_hunter_in_the_night_passive } from "./modifier_reimagined_night_stalker_hunter_in_the_night_passive";

@registerModifier()
export class modifier_reimagined_night_stalker_dark_ascension_wings_out extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    bonus_damage?: number;
    wings_out_stack_threshold?: number;
    wings_out_damage_pct?: number;

    // Reimagined talent specials
    talent_stacks_threshold?: number;
    dark_ascension_bonus_ms_pct?: number;

    IsHidden(): boolean {
        // We return the opposite as we want to show (not hide) when it should be active.
        if (this.ShouldModifierBeActive()) {
            return false;
        }

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
        this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");
        this.wings_out_stack_threshold = this.ability.GetSpecialValueFor("wings_out_stack_threshold");
        this.wings_out_damage_pct = this.ability.GetSpecialValueFor("wings_out_damage_pct");

        if (IsServer()) this.StartIntervalThink(FrameTime());
    }

    OnIntervalThink() {
        if (this.ShouldModifierBeActive()) {
            // Unobstructed vision
            AddFOWViewer(
                this.parent.GetTeamNumber(),
                this.parent.GetAbsOrigin(),
                this.parent.GetCurrentVisionRange(),
                FrameTime(),
                false
            );
        }
    }

    OnRefresh(): void {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PREATTACK_BONUS_DAMAGE,
            ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
        ];
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return { [ModifierState.FLYING]: this.ShouldModifierBeActive() };
    }

    GetPriority(): ModifierPriority {
        return ModifierPriority.LOW;
    }

    GetModifierPreAttack_BonusDamage(): number {
        if (this.ShouldModifierBeActive()) {
            return this.bonus_damage! * this.wings_out_damage_pct! * 0.01;
        }

        return 0;
    }

    GetActivityTranslationModifiers(): string | undefined {
        if (this.ShouldModifierBeActive()) {
            return "hunter_night";
        }

        return;
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        // Talent: Wings Out's is applied when Night Stalker has at least x Dead of Night stacks. While Dark Ascension is active, his move speed also increases by an additional y%.
        return this.ReimaginedTalentFlightMusclesMoveSpeed();
    }

    ShouldModifierBeActive(): boolean {
        // Modifier is inactive and hidden when the parent has the active component
        if (this.parent.HasModifier(modifier_reimagined_night_stalker_dark_ascension_active.name)) {
            return false;
        }

        // Check if this is currently day (e.g. Phoenix's Supernova; return false if this is the case
        if (this.parent.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_passive.name)) {
            if (
                this.parent.GetModifierStackCount(
                    modifier_reimagined_night_stalker_hunter_in_the_night_passive.name,
                    this.parent
                ) == 0
            ) {
                return false;
            }
        }

        // Modifier is active and and is shown when the parent has more than the threshold for Dead of Night stacks
        if (
            this.wings_out_stack_threshold &&
            this.parent.GetModifierStackCount(
                modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name,
                this.parent
            ) >= this.wings_out_stack_threshold
        ) {
            return true;
        }

        // Talent: Wings Out's is applied when Night Stalker has at least x Dead of Night stacks. While Dark Ascension is active, his move speed also increases by an additional y%.
        if (this.ReimaginedTalentFlightMuscles()) return true;

        // Otherwise, it should not trigger and be hidden.
        return false;
    }

    ReimaginedTalentFlightMuscles(): boolean {
        if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_7)) {
            if (!this.talent_stacks_threshold)
                this.talent_stacks_threshold = GetTalentSpecialValueFor(
                    this.caster,
                    NightStalkerTalents.NightStalkerTalents_7,
                    "talent_stacks_threshold"
                );

            if (
                this.parent.GetModifierStackCount(
                    modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name,
                    this.parent
                ) >= this.talent_stacks_threshold
            ) {
                return true;
            }
        }

        return false;
    }

    ReimaginedTalentFlightMusclesMoveSpeed(): number {
        if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_7)) {
            if (!this.dark_ascension_bonus_ms_pct)
                this.dark_ascension_bonus_ms_pct = GetTalentSpecialValueFor(
                    this.caster,
                    NightStalkerTalents.NightStalkerTalents_7,
                    "dark_ascension_bonus_ms_pct"
                );

            if (this.parent.HasModifier(modifier_reimagined_night_stalker_dark_ascension_active.name)) {
                return this.dark_ascension_bonus_ms_pct;
            }
        }

        return 0;
    }
}
