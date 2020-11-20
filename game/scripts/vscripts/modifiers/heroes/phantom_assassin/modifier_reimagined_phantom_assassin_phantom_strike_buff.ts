import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_phantom_assassin_phantom_strike_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    main_target?: CDOTA_BaseNPC;

    // Modifier specials
    bonus_attack_speed?: number;

    // Reimagined talent specials
    talent_3_bonus_damage_per_stack_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.bonus_attack_speed = this.ability.GetSpecialValueFor("bonus_attack_speed");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                // Reimagined: Relentless Assassin: The attack speed buff refreshes itself when Phantom Assassin attacks the main target.
                ModifierFunction.ON_ATTACK_LANDED,
                // Talent: Strikin' Out: Each attack done while Phantom Assassin has the attack speed buff from Phantom Strike increases her damage by x% until the buff ends.
                ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE
            ]
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.bonus_attack_speed!;
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        if (this.parent != event.attacker) return;

        if (this.main_target && event.target == this.main_target)
        {
            this.ForceRefresh();

            // Talent: Strikin' Out: Each attack done while Phantom Assassin has the attack speed buff from Phantom Strike increases her damage by x% until the buff ends.
            this.ReimaginedTalentStrikinOutCounter();
        }
    }

    GetModifierBaseDamageOutgoing_Percentage(): number
    {
        // Talent: Strikin' Out: Each attack done while Phantom Assassin has the attack speed buff from Phantom Strike increases her damage by x% until the buff ends.
        return this.ReimaginedTalentStrikinOutDamage();
    }

    ReimaginedTalentStrikinOutCounter(): void
    {
        if (HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_3))
        {
            this.IncrementStackCount();
        }
    }

    ReimaginedTalentStrikinOutDamage(): number
    {
        if (HasTalent(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_3))
        {
            if (!this.talent_3_bonus_damage_per_stack_pct) this.talent_3_bonus_damage_per_stack_pct = GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_3, "talent_3_bonus_damage_per_stack_pct");
            return this.talent_3_bonus_damage_per_stack_pct * this.GetStackCount();
        }

        return 0;
    }
}
