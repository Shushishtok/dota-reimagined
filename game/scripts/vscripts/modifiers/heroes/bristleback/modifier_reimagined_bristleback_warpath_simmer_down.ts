import { BristlebackTalents } from "../../../abilities/heroes/bristleback/reimagined_bristleback_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_bristleback_warpath_simmer_down extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff: string = "particles/heroes/bristleback/bristleback_warpath_simmer_down.vpcf";

    // Modifier specials
    simmer_down_damage_resistance_bonus_per_stack?: number;

    // Reimagined talent specials
    talent_8_cooldown_reduction_per_stack?: number;
    talent_8_max_cooldown_reduction?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        this.simmer_down_damage_resistance_bonus_per_stack = this.ability.GetSpecialValueFor("simmer_down_damage_resistance_bonus_per_stack");
    }

    GetEffectName(): string
    {
        return this.particle_buff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
                // Talent: Persistent Brawler: Simmer Down now also grants x% cooldown reduction per Warpath stack consumed, up to a maximum of z% cooldown reduction.
                ModifierFunction.COOLDOWN_PERCENTAGE]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        return this.simmer_down_damage_resistance_bonus_per_stack! * this.GetStackCount() * (-1);
    }

    GetModifierPercentageCooldown(): number
    {
        // Talent: Persistent Brawler: Simmer Down now also grants x% cooldown reduction per Warpath stack consumed, up to a maximum of z% cooldown reduction.
        return this.ReimaginedTalentPersistentBrawler();
    }

    ReimaginedTalentPersistentBrawler(): number
    {
        if (HasTalent(this.caster, BristlebackTalents.BristlebackTalent_8))
        {
            // Initialize variables
            if (!this.talent_8_cooldown_reduction_per_stack) this.talent_8_cooldown_reduction_per_stack = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_8, "cooldown_reduction_per_stack");
            if (!this.talent_8_max_cooldown_reduction) this.talent_8_max_cooldown_reduction = GetTalentSpecialValueFor(this.caster, BristlebackTalents.BristlebackTalent_8, "max_cooldown_reduction");

            // Calculate cooldown reduction based on stacks, up to a maximum, and return it
            return Math.min(this.talent_8_cooldown_reduction_per_stack * this.GetStackCount(), this.talent_8_max_cooldown_reduction);
        }

        return 0;
    }
}
