import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_slowed = "particles/generic_gameplay/generic_slowed_cold.vpcf";
    modifier_snowstorm_buff: string = "modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff";
    modifier_frostbite_debuff: string = "modifier_reimagined_crystal_maiden_frostbite_debuff";

    // Modifier specials
    movespeed_slow?: number;
    attackspeed_slow?: number;

    // Reimagined specials
    snowbite_interval?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.movespeed_slow = this.ability.GetSpecialValueFor("movespeed_slow");
        this.attackspeed_slow = this.ability.GetSpecialValueFor("attackspeed_slow");

        // Reimagined specials
        this.snowbite_interval = this.ability.GetSpecialValueFor("snowbite_interval");

        // Snowbite: When an enemy is under Frostbite's effect while on a Snowstorm Field, Crystal Nova's slow modifier's refreshes itself.
        this.ReimaginedSnowbite();
    }

    ReimaginedSnowbite(): void
    {
        if (IsServer())
        {
            this.StartIntervalThink(this.snowbite_interval!);
        }
    }

    OnIntervalThink(): void
    {
        // Only applies if the parent has both Frostbite's and Snowstorm Field's modifiers
        if (this.parent.HasModifier(this.modifier_snowstorm_buff) && this.parent.HasModifier(this.modifier_frostbite_debuff))
        {
            this.ForceRefresh();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        let movespeed_slow = this.movespeed_slow!
        // Talent: Dense Ice: Crystal Nova's move and attack speed slow scales with the the enemy's distance to the Snowstorm Field, up to x% additional slow when standing in the center. Every y units of distance reduces the slow slightly.
        movespeed_slow += this.ReimaginedTalentDenseIce()
        return movespeed_slow * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        let attackspeed_slow = this.attackspeed_slow!

        // Talent: Dense Ice: Crystal Nova's move and attack speed slow scales with the the enemy's distance to the Snowstorm Field, up to x% additional slow when standing in the center. Every y units of distance reduces the slow slightly.
        attackspeed_slow += this.ReimaginedTalentDenseIce()
        return attackspeed_slow * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_slowed;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    ReimaginedTalentDenseIce(): number
    {
        if (HasTalent(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_2))
        {
            const stacks = this.parent.GetModifierStackCount("modifier_reimagined_crystal_maiden_talent_2_debuff", this.caster);
            if (stacks) return stacks;
        }

        return 0;
    }
}
