import { BroodmotherTalents } from "../../../abilities/heroes/broodmother/reimagined_broodmother_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_talent_8_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    attack_speed_bonus?: number;
    lifesteal_amp?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.attack_speed_bonus = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_8, "attack_speed_bonus");
        this.lifesteal_amp = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_8, "lifesteal_amp");

        if (IsServer()) this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void
    {
        // Check if the parent is now fully healed
        if (this.parent.GetHealthPercent() == 100)
        {
            this.Destroy();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
                ModifierFunction.LIFESTEAL_AMPLIFY_PERCENTAGE,
                ]
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.attack_speed_bonus!;
    }

    GetModifierLifestealRegenAmplify_Percentage(): number
    {
        return this.lifesteal_amp!;
    }
}
