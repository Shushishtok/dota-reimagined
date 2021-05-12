import { registerModifier } from "../../../lib/dota_ts_adapter";
import { BaseTalent, BaseTalentModifier, registerTalent } from "../../../lib/talents";
import { GetTalentSpecialValueFor } from "../../../lib/util";

export const enum BroodmotherTalents {
    BroodmotherTalent_1 = "reimagined_broodmother_talent_1",
    BroodmotherTalent_2 = "reimagined_broodmother_talent_2",
    BroodmotherTalent_3 = "reimagined_broodmother_talent_3",
    BroodmotherTalent_4 = "reimagined_broodmother_talent_4",
    BroodmotherTalent_5 = "reimagined_broodmother_talent_5",
    BroodmotherTalent_6 = "reimagined_broodmother_talent_6",
    BroodmotherTalent_7 = "reimagined_broodmother_talent_7",
    BroodmotherTalent_8 = "reimagined_broodmother_talent_8",
}

@registerTalent()
export class reimagined_broodmother_talent_1 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_2 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_3 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_4 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_5 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_6 extends BaseTalent {}

@registerModifier()
export class modifier_reimagined_broodmother_talent_7 extends BaseTalentModifier {
    // Talent: Hunger Pangs: When killing an enemy unit and Insatiable Hunger is not currently active, grants the Insatiable Hunger buff for x seconds.

    IsHidden() {
        return true;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }
    RemoveOnDeath() {
        return false;
    }

    caster: CDOTA_BaseNPC = this.GetCaster()!;

    // Modifier properties
    ability_insatiable_hunger: string = "reimagined_broodmother_insatiable_hunger";
    ability_handle?: CDOTABaseAbility;
    modifier_buff = "modifier_reimagined_broodmother_insatiable_hunger_buff";

    // Reimagined talent specials
    duration?: number;

    OnCreated() {
        if (!IsServer()) return;

        // Initialize variables
        this.duration = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_7, "duration");

        // Register for ability handle
        this.GetAbilityHandle();
    }

    GetAbilityHandle(): CDOTABaseAbility | undefined {
        // If the handle already exists, return it
        if (this.ability_handle) return this.ability_handle;

        // Find the Insatiable Hunger ability on the caster
        if (this.caster.HasAbility(this.ability_insatiable_hunger)) {
            const ability_handle = this.caster.FindAbilityByName(this.ability_insatiable_hunger);
            if (ability_handle) {
                // Assign ability handle to save additional iterations
                this.ability_handle = ability_handle;
                return ability_handle;
            }
        }

        return undefined;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_DEATH];
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (!IsServer()) return;

        // Only apply when the caster is the killer
        if (event.attacker != this.caster) return;

        // Ignore illusions, buildings, wards, and allies
        if (event.unit.IsIllusion()) return;
        if (event.unit.IsBuilding() || event.unit.IsOther()) return;
        if (event.unit.GetTeamNumber() == this.caster.GetTeamNumber()) return;

        // Only apply if the caster doesn't have the Insatiable Hunger's buff
        if (this.caster.HasModifier(this.modifier_buff)) return;

        // Make sure the value was properly initialized
        if (!this.duration)
            this.duration = GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_7, "duration");

        // Make sure the ability handle exists and is valid
        if (!this.ability_handle && !this.GetAbilityHandle()) return;

        // Make sure the ability is trained
        if (!this.ability_handle!.IsTrained()) return;

        // Apply Insatiable Hunger's buff
        this.caster.AddNewModifier(this.caster, this.ability_handle, this.modifier_buff, { duration: this.duration });
    }
}

@registerTalent(undefined, modifier_reimagined_broodmother_talent_7)
export class reimagined_broodmother_talent_7 extends BaseTalent {}

@registerTalent()
export class reimagined_broodmother_talent_8 extends BaseTalent {}
