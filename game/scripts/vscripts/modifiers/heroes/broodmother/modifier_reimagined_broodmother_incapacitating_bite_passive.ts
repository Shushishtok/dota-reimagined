import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent, IsSpiderlingUnit } from "../../../lib/util";
import "./modifier_reimagined_broodmother_incapacitating_bite_debuff";
import "./modifier_reimagined_broodmother_spin_web_debuff"
import "./modifier_reimagined_broodmother_incapacitating_bite_webbed_up_counter"
import "./modifier_reimagined_broodmother_talent_5_buff"
import { BroodmotherTalents } from "../../../abilities/heroes/broodmother/reimagined_broodmother_talents";

@registerModifier()
export class modifier_reimagined_broodmother_incapacitating_bite_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    modifier_debuff: string = "modifier_reimagined_broodmother_incapacitating_bite_debuff";
    modifier_enemy_web: string = "modifier_reimagined_broodmother_spin_web_debuff";
    modifier_webbed_up_counter: string = "modifier_reimagined_broodmother_incapacitating_bite_webbed_up_counter";
    modifier_webbed_up_debuff: string = "modifier_reimagined_broodmother_incapacitating_bite_webbed_up_debuff";

    // Modifier specials
    duration?: number;

    // Reimagined specials
    web_up_stacks_hero?: number;
    web_up_stacks_spider?: number;
    web_up_counter_duration?: number;

    // Reimagined talent properties
    modifier_talent_5_buff: string = "modifier_reimagined_broodmother_talent_5_buff";

    // Reimagined talent specials
    talent_5_additional_stacks?: number;
    talent_5_attack_speed_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.duration = this.ability.GetSpecialValueFor("duration");

        // Reimagined specials
        this.web_up_stacks_hero = this.ability.GetSpecialValueFor("web_up_stacks_hero");
        this.web_up_stacks_spider = this.ability.GetSpecialValueFor("web_up_stacks_spider");
        this.web_up_counter_duration = this.ability.GetSpecialValueFor("web_up_counter_duration");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED]
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Does nothing if the attacker is broken
        if (event.attacker.PassivesDisabled()) return;

        // Ignore allies, buildings, and wards.
        if (event.target.IsBuilding() || event.target.IsOther() || event.target.GetTeamNumber() == event.attacker.GetTeamNumber()) return;

        // Does nothing if the target is magic immune
        if (event.target.IsMagicImmune()) return;

        // Reimagined: Webbed Up: When Broodmother attacks an enemy standing in a web, that enemy gets a stack of Webbed Up. When it reaches x stacks, stacks are consumed and the enemy becomes rooted and has y% miss chance for b seconds. Broodmother's attacks increase the stacks by z. Spiderlings', Spiderites and Spiderking's attacks increase it by t stacks instead.
        this.ReimaginedWebbedUp(event);

        // Only apply if the attacker is the parent
        if (event.attacker != this.parent) return;

        // Apply the debuff
        event.target.AddNewModifier(this.caster, this.ability, this.modifier_debuff, {duration: this.duration!});
    }

    ReimaginedWebbedUp(event: ModifierAttackEvent): void
    {
        // Only apply on parent attacks or its own controlled spider units
        if (event.attacker == this.parent || IsSpiderlingUnit(event.attacker, true) && event.attacker.GetPlayerOwnerID() == this.parent.GetPlayerOwnerID())
        {
            // Only apply on targets that are standing on a web
            if (!event.target.HasModifier(this.modifier_enemy_web)) return;

            // Decide how many stacks based on whether it's Broodmother or one of her spiderlings
            let stacks;
            if (event.attacker == this.parent) stacks = this.web_up_stacks_hero!;
            else stacks = this.web_up_stacks_spider!;

            // Talent: Weblings: Spiderlings and Spiderites now apply x additional Webbed Up stacks, and gain y attack speed when attacking a target with the Webbed Up counter or debuff.
            stacks = this.ReimaginedTalentWeblings(event, stacks);

            // If the target doesn't have the modifier, give it to it
            if (!event.target.HasModifier(this.modifier_webbed_up_counter))
            {
                event.target.AddNewModifier(this.caster, this.ability, this.modifier_webbed_up_counter, {duration: this.web_up_counter_duration});
            }

            // Increment stacks
            const modifier = event.target.FindModifierByName(this.modifier_webbed_up_counter);
            if (modifier)
            {
                modifier.SetStackCount(modifier.GetStackCount() + stacks);
                modifier.ForceRefresh();
            }
        }
    }

    ReimaginedTalentWeblings(event: ModifierAttackEvent, stacks: number): number
    {
        if (HasTalent(this.caster, BroodmotherTalents.BroodmotherTalent_5))
        {
            // Initialize talent specials
            if (!this.talent_5_additional_stacks) this.talent_5_additional_stacks = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_5, "additional_stacks");
            if (!this.talent_5_attack_speed_duration) this.talent_5_attack_speed_duration = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_5, "attack_speed_duration");

            // Check if the attack is a spiderling or a spiderite - does not count Spiderkings
            if (IsSpiderlingUnit(event.attacker, false))
            {
                // Increase applied stacks
                stacks += this.talent_5_additional_stacks;

                // Check if the target already has the Webbed Up counter or the debuff
                if (event.target.HasModifier(this.modifier_webbed_up_counter) || event.target.HasModifier(this.modifier_webbed_up_debuff))
                {
                    // Grant the Spiderling/Spiderite attack speed bonus modifier
                    event.attacker.AddNewModifier(this.caster, this.ability, this.modifier_talent_5_buff, {duration: this.talent_5_attack_speed_duration});
                }
            }
        }

        return stacks;
    }
}
