import { PhantomAssassinTalents } from "../../../abilities/heroes/phantom_assassin/reimagined_phantom_assassin_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_phantom_assassin_stifling_dagger_caster extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    base_damage?: number;
    attack_factor?: number;

    // Reimagined talent properties
    talent_2_triggered: boolean = false;

    // Reimagined talent specials
    talent_2_dagger_bonus_damage?: number

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.base_damage = this.ability.GetSpecialValueFor("base_damage");
        this.attack_factor = this.ability.GetSpecialValueFor("attack_factor");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
                ModifierFunction.PREATTACK_BONUS_DAMAGE]
    }

    GetModifierBaseDamageOutgoing_Percentage(): number
    {
        return this.attack_factor! * (-1);
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        let base_damage = this.base_damage!;

        // Talent: From The Shadows: If Phantom Assassin has Blur's active effect when she casts Stifling Dagger, the dagger projectile becomes completely invisible to the enemy, and deals x bonus damage. Fan of Knives projectiles deal y damage instead.
        base_damage += this.ReimaginedTalentFromTheShadowsApplyDamage();
        return base_damage;
    }

    ReimaginedTalentFromTheShadowsApplyDamage(): number
    {
        if (this.talent_2_triggered)
        {
            if (!this.talent_2_dagger_bonus_damage) this.talent_2_dagger_bonus_damage = GetTalentSpecialValueFor(this.caster, PhantomAssassinTalents.PhantomAssassinTalent_2, "talent_2_dagger_bonus_damage");
            return this.talent_2_dagger_bonus_damage;
        }

        return 0;
    }
}
