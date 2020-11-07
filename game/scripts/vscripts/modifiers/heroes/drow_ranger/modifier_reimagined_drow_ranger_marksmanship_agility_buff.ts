import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_agility_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    lock: boolean = false;

    // Modifier specials
    agility_multiplier?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.agility_multiplier = this.ability.GetSpecialValueFor("agility_multiplier")
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.STATS_AGILITY_BONUS]
    }

    GetModifierBonusStats_Agility(): number
    {
        if (this.lock) return 0;

        this.lock = true;

        let bonus_agi;
        if (this.parent == this.caster)
        {
            bonus_agi = (this.caster as CDOTA_BaseNPC_Hero).GetAgility() * this.agility_multiplier! * 0.01;    
        }
        else
        {
            bonus_agi =  (this.caster as CDOTA_BaseNPC_Hero).GetAgility() / (1 + this.agility_multiplier! * 0.01) * this.agility_multiplier! * 0.01;
        }

        this.lock = false;

        return bonus_agi;
    }
}