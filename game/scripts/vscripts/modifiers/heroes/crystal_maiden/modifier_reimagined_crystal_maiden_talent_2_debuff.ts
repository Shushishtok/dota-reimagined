import { CrystalMaidenTalents } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenPoints, GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_crystal_maiden_talent_2_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    cast_center?: Vector;

    // Reimagined talent specials
    max_additional_slow?: number
    units_per_slow?: number;
    radius?: number;

    IsHidden() {return true}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        if (!IsServer()) return;

        // Modifier specials
        this.radius = this.ability.GetSpecialValueFor("radius");
        this.StartIntervalThink(0.25);
    }

    OnIntervalThink()
    {
        // Check if the cast center variable was initialized by the ability
        if (this.cast_center)
        {

            // Initialize variables
            if (!this.max_additional_slow) this.max_additional_slow = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_2, "max_additional_slow");
            if (!this.units_per_slow) this.units_per_slow = GetTalentSpecialValueFor(this.caster, CrystalMaidenTalents.CrystalMaidenTalent_2, "units_per_slow");
            if (!this.radius) this.radius = this.ability.GetSpecialValueFor("radius");

            // Calculate the slow, scaling with distance from the center, rounded to the closest number.
            const distance = CalculateDistanceBetweenPoints(this.parent.GetAbsOrigin(), this.cast_center);
            const slow_per_interval = 100 / (this.radius / this.units_per_slow);
            let additional_slow = this.max_additional_slow * (1 - (((distance / this.units_per_slow) * slow_per_interval * 0.01)));
            additional_slow = Math.round(additional_slow);

            // If slow is under 0, set it at 0
            if (additional_slow < 0) additional_slow = 0;

            // Set stack count; the slow debuff refers to it.
            this.SetStackCount(additional_slow)
            return;
        }

        this.SetStackCount(0);
        return;
    }
}
