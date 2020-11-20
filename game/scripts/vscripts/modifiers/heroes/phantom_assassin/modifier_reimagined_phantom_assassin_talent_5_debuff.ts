import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_phantom_assassin_talent_5_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    talent_5_evasion_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        if (!this.talent_5_evasion_pct) this.talent_5_evasion_pct = GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_5, "talent_5_evasion_pct");
        return this.talent_5_evasion_pct;
    }
}
