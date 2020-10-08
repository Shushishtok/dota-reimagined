import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_enchanted_mango_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTA_Item = this.GetAbility()! as CDOTA_Item; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    hp_regen?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.hp_regen = this.ability.GetSpecialValueFor("hp_regen");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.HEALTH_REGEN_CONSTANT]
    }

    GetModifierConstantHealthRegen(): number
    {
        return this.hp_regen! * this.ability.GetCurrentCharges();
    }
}