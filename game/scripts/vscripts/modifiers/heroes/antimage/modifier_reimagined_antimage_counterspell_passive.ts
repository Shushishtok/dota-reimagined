import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_antimage_counterspell_passive extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();    
    reflected_abilities?: CDOTABaseAbility[];    

    // Modifier specials
    magic_resistance?: number;

    // Reimagined specials
    instinctive_counter_trigger_multiplier?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.magic_resistance = this.ability!.GetSpecialValueFor("magic_resistance");

        // Reimagined specials
        this.instinctive_counter_trigger_multiplier = this.ability!.GetSpecialValueFor("instinctive_counter_trigger_multiplier");

        // Initialize reflection table for Counterspell's active
        this.reflected_abilities = [];

        if (IsServer())
        {
            this.StartIntervalThink(3);
        }
    }

    OnRefresh(): void
    {
        // Modifier specials
        this.magic_resistance = this.ability!.GetSpecialValueFor("magic_resistance");

        // Reimagined specials
        this.instinctive_counter_trigger_multiplier = this.ability!.GetSpecialValueFor("instinctive_counter_trigger_multiplier");
    }

    OnIntervalThink(): void
    {
        let removeable_abilities: CDOTABaseAbility[] = []
        // Check if the parent has reflect abilities that can were done with their effects and can be deleted
        for (const reflected_ability of this.reflected_abilities!)
        {
            // Verify ability is valid
            if (IsValidEntity(reflected_ability) && !reflected_ability.IsNull())
            {
                // Verify ability is a reflected ability so we won't accidentally remove something original 
                if (util.IsReflectedAbility(reflected_ability))
                {
                    // If ability can removed, remove it from the caster
                    if (reflected_ability.NumModifiersUsingAbility() == 0 && !reflected_ability.IsChanneling())
                    {
                        reflected_ability.RemoveSelf();
                        removeable_abilities.push(reflected_ability);                      
                    }
                }
            }
        }

        // After reitrerating the entire table, remove the removeable abilities from the table
        for (const removeable_ability of removeable_abilities)
        {
            if (this.reflected_abilities!.includes(removeable_ability))
            {
                const index = this.reflected_abilities!.indexOf(removeable_ability);
                if (index > -1)                
                {
                    this.reflected_abilities!.splice(index, 1);
                }
            }   
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MAGICAL_RESISTANCE_BONUS,
                ModifierFunction.ON_ABILITY_FULLY_CAST]; // Reimagined
    }

    GetModifierMagicalResistanceBonus(): number
    {
        // If the parent is an illusion or broken, give no bonus
        if (this.parent.IsIllusion()) return 0;
        if (this.parent.PassivesDisabled()) return 0;

        return this.magic_resistance!;
    }

    OnAbilityFullyCast(event: ModifierAbilityEvent): void
    {
        if (!IsServer()) return;

        // Reimagined: Instinctive Counter: Can be set to auto cast, allowing it to trigger automatically whenever an ability is fired towards Anti Mage. However, doing so multiplies the cooldown and the mana cost of Counterspell by a certain multiplier.
        this.ReimaginedInstinctiveCounter(event);
    }

    ReimaginedInstinctiveCounter(event: ModifierAbilityEvent): void
    {
        // Does not trigger if caster is broken
        if (this.parent.PassivesDisabled()) return;

        // Does not trigger on illusions
        if (this.parent.IsIllusion()) return;

        // Only trigger when an ability is aimed at the caster
        if (event.target && event.target == this.parent)
        {
            const manacost: number = this.ability!.GetManaCost((this.ability!.GetLevel()) -1) * this.instinctive_counter_trigger_multiplier!
            const cooldown: number = this.ability!.GetCooldown(this.ability!.GetLevel() -1) * this.instinctive_counter_trigger_multiplier!;                

            // Check if the ability is set to auto cast and it is ready to be used
            if (this.ability!.GetAutoCastState() && this.ability!.IsCooldownReady() && manacost <= this.parent.GetMana())
            {
                // Trigger ability manually and spend mana and cooldown with multiplier
                this.ability!.OnSpellStart();                
                this.parent.SpendMana(manacost, this.ability!);                                
                this.ability!.StartCooldown(cooldown);
            }
        }
    }
}