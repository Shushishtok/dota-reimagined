import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentAbilityFromNumber, GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_cast: string = "PhantomAssassin.DecisiveStrike.Cast";

    // Reimagined properties
    decisive_strike_attacks_remaining: number = 0;

    // Reimagined specials
    decisive_strike_as_reduction?: number;
    decisive_strike_crits_to_remove?: number;
    decisive_strike_crit_chance_increase?: number;

    // Reimagined talent properties
    attacking_stunned_target: boolean = false;

    // Reimagined talent specials
    talent_8_attack_penalty_reduction_pct?: number

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Reimagined specials
        this.decisive_strike_as_reduction = this.ability.GetSpecialValueFor("decisive_strike_as_reduction")!;
        this.decisive_strike_crits_to_remove = this.ability.GetSpecialValueFor("decisive_strike_crits_to_remove")!;
        this.decisive_strike_crit_chance_increase = this.ability.GetSpecialValueFor("decisive_strike_crit_chance_increase")!;

        // Set number of attacks remaining accordingly
        this.decisive_strike_attacks_remaining = this.decisive_strike_crits_to_remove!;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_START,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.decisive_strike_crit_chance_increase!;
    }

    OnAttackStart(event: ModifierAttackEvent): void
    {
        // Only apply on attacks that come from the parent
        if (event.attacker != this.parent) return;

        // Talent: Clean Streak: While Decisive Strike is active, if Phantom Assassin's target is stunned when she begins the attack, the attack speed penalty is reduced by x% and Coup De Grace's critical damage increases by y%.
        this.ReimaginedTalentCleanStreakThink(event);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        let decisive_strike_as_reduction = this.decisive_strike_as_reduction!;

        // Talent: Clean Streak: While Decisive Strike is active, if Phantom Assassin's target is stunned when she begins the attack, the attack speed penalty is reduced by x% and Coup De Grace's critical damage increases by y%.
        decisive_strike_as_reduction = this.ReimaginedTalentCleanStreak(decisive_strike_as_reduction);
        return decisive_strike_as_reduction! * (-1);
    }

    OnDestroy()
    {
        StopSoundOn(this.sound_cast, this.parent);
    }

    ReimaginedTalentCleanStreak(decisive_strike_as_reduction: number): number
    {
        if (HasTalent(this.parent, PhantomAssassinTalents.PhantomAssassinTalent_8))
        {
            // Initialize variables
            if (!this.talent_8_attack_penalty_reduction_pct) this.talent_8_attack_penalty_reduction_pct = GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_8, "talent_8_attack_penalty_reduction_pct");

            // Check if currently attacking a stunned target
            if (this.attacking_stunned_target)
            {
                // Reduce the attack speed penalty
                return decisive_strike_as_reduction * (1 - this.talent_8_attack_penalty_reduction_pct * 0.01);
            }
        }

        return decisive_strike_as_reduction!;
    }

    ReimaginedTalentCleanStreakThink(event: ModifierAttackEvent)
    {
        if (HasTalent(this.parent, PhantomAssassinTalents.PhantomAssassinTalent_8))
        {
            if (event.target && event.target.IsStunned())
            {
                this.attacking_stunned_target = true;
            }
            else
            {
                this.attacking_stunned_target = false;
            }
        }
    }
}
