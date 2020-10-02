import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_stifling_dagger_caster extends BaseModifier
{
    // // Modifier properties
    // caster: CDOTA_BaseNPC = this.GetCaster()!;
    // ability: CDOTABaseAbility = this.GetAbility()!; 
    // parent: CDOTA_BaseNPC = this.GetParent();

    // // Modifier specials
    // base_damage?: number;
    // attack_factor?: number;    

    // IsHidden() {return true}
    // IsDebuff() {return false}
    // IsPurgable() {return false}

    OnCreated(): void
    {
        // // Modifier specials
        // this.base_damage = this.ability.GetSpecialValueFor("base_damage");
        // this.attack_factor = this.ability.GetSpecialValueFor("attack_factor");        
    }

    // DeclareFunctions(): ModifierFunction[]
    // {
    //     return [ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
    //             ModifierFunction.PREATTACK_BONUS_DAMAGE]
    // }

    // GetModifierBaseDamageOutgoing_Percentage(): number
    // {
    //     return this.attack_factor! * (-1);
    // }

    // GetModifierPreAttack_BonusDamage(): number
    // {
    //     return this.base_damage!;
    // }
}