import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    snowstorm_damage_reduction?: number;
    snowstorm_status_reduction?: number;

    // Reimagined talent specials
    bonus_spell_amp?: number;
    spell_amp_reduction?: number;

    IsHidden()
    {
        // Shown for allies, not shown for enemies
        if (this.caster!.GetTeamNumber() == this.parent.GetTeamNumber())
        {
            return false;
        }

        return true;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.snowstorm_damage_reduction = this.ability.GetSpecialValueFor("snowstorm_damage_reduction");
        this.snowstorm_status_reduction = this.ability.GetSpecialValueFor("snowstorm_status_reduction");

        // Talent: Charmed Snow: Snowstorm Field now provides bonus x% spell amp to allies and y% spell amp reduction to enemies that stand in its radius.
        // Modifier is for showing the debuff on enemies
        if (IsServer()) this.ReimaginedTalentCharmedSnowModifier(true);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        // Allies standing on the field are granted damage reduction and status resistance.
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
                ModifierFunction.STATUS_RESISTANCE_STACKING,
                // Talent: Charmed Snow: Snowstorm Field now provides bonus x% spell amp to allies and y% spell amp reduction to enemies that stand in its radius.
                ModifierFunction.SPELL_AMPLIFY_PERCENTAGE
                ]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        // Activated for allies, does nothing for enemies
        if (this.parent.GetTeamNumber() == this.caster!.GetTeamNumber())
        {
            return this.snowstorm_damage_reduction! * (-1);
        }

        return 0;
    }

    GetModifierStatusResistanceStacking(): number
    {
        // Activated for allies, does nothing for enemies
        if (this.parent.GetTeamNumber() == this.caster?.GetTeamNumber())
        {
            return this.snowstorm_status_reduction!;
        }

        return 0;
    }

    GetModifierSpellAmplify_Percentage(): number
    {
        return this.ReimaginedTalentCharmedSnow();
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // Talent: Charmed Snow: Snowstorm Field now provides bonus x% spell amp to allies and y% spell amp reduction to enemies that stand in its radius.
        this.ReimaginedTalentCharmedSnowModifier(false);
    }

    ReimaginedTalentCharmedSnow(): number
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_1))
        {
            if (this.parent.GetTeamNumber() == this.caster.GetTeamNumber())
            {
                if (!this.bonus_spell_amp) this.bonus_spell_amp = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_1, "bonus_spell_amp");
                return this.bonus_spell_amp;
            }
            else
            {
                if (!this.spell_amp_reduction) this.spell_amp_reduction = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_1, "spell_amp_reduction");
                return this.spell_amp_reduction * (-1);
            }
        }

        return 0;
    }

    ReimaginedTalentCharmedSnowModifier(oncreated: boolean)
    {
        // This modifier should only be applied on enemies to show the -x% spell amp debuff
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_1))
        {
            if (this.parent.GetTeamNumber() != this.caster.GetTeamNumber())
            {
                if (oncreated)
                {
                    this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_crystal_maiden_talent_1_debuff", {});
                }
                else
                {
                    this.parent.RemoveModifierByName("modifier_reimagined_crystal_maiden_talent_1_debuff");
                }
            }
        }
    }
}
