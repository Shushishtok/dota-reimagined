import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

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
                ModifierFunction.ON_ATTACK_LANDED]            
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
        }
    }
}