import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Reimagined properties
    decisive_strike_attacks_remaining: number = 0;

    // Reimagined specials
    decisive_strike_as_reduction?: number;
    decisive_strike_crits_to_remove?: number;
    decisive_strike_crit_chance_increase?: number;    

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
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.decisive_strike_crit_chance_increase!;
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.decisive_strike_as_reduction! * (-1);
    }
}