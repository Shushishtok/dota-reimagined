import { registerModifier } from "../../../lib/dota_ts_adapter";
import { BaseTalent, BaseTalentModifier, registerTalent } from "../../../lib/talents";
import { GetTalentSpecialValueFor } from "../../../lib/util";

export const enum DrowRangerTalents {
    DrowRangerTalent_1 = "reimagined_drow_ranger_talent_1",
    DrowRangerTalent_2 = "reimagined_drow_ranger_talent_2",
    DrowRangerTalent_3 = "reimagined_drow_ranger_talent_3",
    DrowRangerTalent_4 = "reimagined_drow_ranger_talent_4",
    DrowRangerTalent_5 = "reimagined_drow_ranger_talent_5",
    DrowRangerTalent_6 = "reimagined_drow_ranger_talent_6",
    DrowRangerTalent_7 = "reimagined_drow_ranger_talent_7",
    DrowRangerTalent_8 = "reimagined_drow_ranger_talent_8",
}

@registerTalent()
export class reimagined_drow_ranger_talent_1 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_2 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_3 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_4 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_5 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_6 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_drow_ranger_talent_7 extends BaseTalentModifier {
    // Talent properties
    parent = this.GetParent() as CDOTA_BaseNPC_Hero;
    ability = this.GetAbility()!;
    marskmanship_ability_handle?: CDOTABaseAbility;

    // Talent specials
    talent_7_pride_duration?: number;
    talent_7_internal_cd?: number;

    IsHidden() {
        return true;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }
    IsPermanent() {
        return true;
    }
    RemoveOnDeath() {
        return false;
    }

    OnCreated() {
        if (!IsServer()) return;

        // Initialize variables
        if (!this.talent_7_pride_duration)
            this.talent_7_pride_duration = GetTalentSpecialValueFor(
                this.parent,
                DrowRangerTalents.DrowRangerTalent_7,
                "talent_7_pride_duration"
            );
        if (!this.talent_7_internal_cd)
            this.talent_7_internal_cd = GetTalentSpecialValueFor(
                this.parent,
                DrowRangerTalents.DrowRangerTalent_7,
                "talent_7_internal_cd"
            );

        // Attempt to get the Marksmanship ability handle
        if (this.parent.HasAbility("reimagined_drow_ranger_marksmanship")) {
            this.marskmanship_ability_handle = this.parent.FindAbilityByName("reimagined_drow_ranger_marksmanship");
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_TAKEDAMAGE];
    }

    OnTakeDamage(event: ModifierInstanceEvent) {
        if (!IsServer()) return;

        // Only applies if the unit taking damage is the parent
        if (event.unit != this.parent) return;

        // If for some reason we don't have the ability handle, try to reinitialize it
        if (!this.marskmanship_ability_handle) this.OnCreated();

        // If we still don't have it, then something is wrong and we should just abort
        if (!this.marskmanship_ability_handle) return;

        // Check if we are not prevented from using this talent
        if (!this.parent.HasModifier("modifier_reimagined_drow_ranger_talent_7_counter")) {
            // Check if Pride of the Drow is not currently active
            if (!this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_pride_drow")) {
                // Add the counter modifier
                this.parent.AddNewModifier(
                    this.parent,
                    this.ability,
                    "modifier_reimagined_drow_ranger_talent_7_counter",
                    { duration: this.talent_7_internal_cd }
                );

                // Apply the modifier
                this.parent.AddNewModifier(
                    this.parent,
                    this.marskmanship_ability_handle!,
                    "modifier_reimagined_drow_ranger_marksmanship_pride_drow",
                    { duration: this.talent_7_pride_duration }
                );
            }
        }
    }
}

@registerTalent(undefined, modifier_reimagined_drow_ranger_talent_7)
export class reimagined_drow_ranger_talent_7 extends BaseTalent {}

@registerTalent()
export class reimagined_drow_ranger_talent_8 extends BaseTalent {}
