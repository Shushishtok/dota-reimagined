import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery } from "./modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery";
import { modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane } from "./modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane";
import { modifier_reimagined_crystal_maiden_frostbite_buff } from "./modifier_reimagined_crystal_maiden_frostbite_buff"

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_buff extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    mana_regen?: number;
    self_factor?: number;

    // Reimagined specials
    igloo_frosting_arcane_aura_multiplier?: number;
    focused_arcane_magic_res?: number;
    focused_arcane_spell_amp?: number;
    blueheart_mastery_mana_regen?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.mana_regen = this.ability!.GetSpecialValueFor("mana_regen");
        this.self_factor = this.ability!.GetSpecialValueFor("self_factor");

        // Reimagined specials
        this.igloo_frosting_arcane_aura_multiplier = this.ability!.GetSpecialValueFor("igloo_frosting_arcane_aura_multiplier");
        this.focused_arcane_magic_res = this.ability!.GetSpecialValueFor("focused_arcane_magic_res");
        this.focused_arcane_spell_amp = this.ability!.GetSpecialValueFor("focused_arcane_spell_amp");
        this.blueheart_mastery_mana_regen = this.ability!.GetSpecialValueFor("blueheart_mastery_mana_regen");        
    }

    OnRefresh(): void
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MANA_REGEN_CONSTANT,
                ModifierFunction.MAGICAL_RESISTANCE_BONUS, // Reimagined: Focused Arcane
                ModifierFunction.SPELL_AMPLIFY_PERCENTAGE, // Reimagined: Focused Arcane
                ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.focused_arcane_magic_res!;
    }

    GetModifierConstantManaRegen(): number
    {
        // Basic mana regen rate
        let mana_regen = this.mana_regen!;        

        // If this is the caster, multiply rate by self factor
        if (this.parent == this.caster)
        {
            mana_regen = mana_regen * this.self_factor!;
        }
        
        // Reimagination: Blueheart Mastery: Dealing damage to enemy units improves Crystal Maiden's aura's mana regeneration for each damage instance she inflicts. Stacks infinitely, independent stacks. Each stack lasts a few seconds.
        mana_regen += this.ReimaginationBlueheartMastery();

        // Reimagination: Frostbite's Igloo Frosting: Frostbite can be cast on an ally, rooting it and increasing Arcane's Auras effect on that ally by a multiplier.
        mana_regen = mana_regen * this.ReimaginationIglooFrosting()
        
        return mana_regen;
    }

    ReimaginationIglooFrosting(): number
    {
        let multiplier = 1;
        // If parent has the allied Frostbite modifier, increase by the multiplier
        if (this.parent.HasModifier(modifier_reimagined_crystal_maiden_frostbite_buff.name))
        {
            multiplier = this.igloo_frosting_arcane_aura_multiplier!;
        }
        
        return multiplier;
    }

    ReimaginationBlueheartMastery(): number
    {
        let bonus = 0;

        if (this.caster!.HasModifier(modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery.name))
        {
            const stacks = this.caster!.GetModifierStackCount(modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery.name, this.caster!);
            if (stacks && stacks > 0)
            {
                bonus = stacks * this.blueheart_mastery_mana_regen!;
            }
        }

        return bonus;
    }

    GetModifierMagicalResistanceBonus(): number
    {
        // Only applies if the parent has Focused Arcane
        if (this.caster!.HasModifier(modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane.name))
        {
            let focused_arcane_magic_res = this.focused_arcane_magic_res!
            focused_arcane_magic_res = focused_arcane_magic_res * this.ReimaginationIglooFrosting();
            return focused_arcane_magic_res!;
        }

        return 0;
    }

    GetModifierSpellAmplify_Percentage(): number
    {
        if (this.caster!.HasModifier(modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane.name))
        {
            let focused_arcane_spell_amp = this.focused_arcane_spell_amp!;
            focused_arcane_spell_amp = focused_arcane_spell_amp * this.ReimaginationIglooFrosting();
            return focused_arcane_spell_amp!;
        }

        return 0;
    }
}