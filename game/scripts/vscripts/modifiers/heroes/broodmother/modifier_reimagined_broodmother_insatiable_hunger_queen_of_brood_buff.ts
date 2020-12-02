import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_insatiable_hunger_queen_of_brood_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    queen_brood_damage_bonus?: number;
    queen_brood_lifesteal_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    // Reimagined: Queen of the Brood: While Insatiable Hunger is active, Broodmother emits an aura that increases the damage of nearby spider units under her control in x range by y, and grants them z% lifesteal.
    OnCreated(): void
    {
        // Modifier specials
        this.queen_brood_damage_bonus = this.ability.GetSpecialValueFor("queen_brood_damage_bonus");
        this.queen_brood_lifesteal_pct = this.ability.GetSpecialValueFor("queen_brood_lifesteal_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PREATTACK_BONUS_DAMAGE,
                ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.queen_brood_lifesteal_pct!;
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        return this.queen_brood_damage_bonus!;
    }

    GetModifierLifeStealStacking(): number
    {
        return this.queen_brood_lifesteal_pct!;
    }
}
