import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenEntities, IsSpiderlingUnit } from "../../../lib/util";
import "./modifier_reimagined_broodmother_avenger_buff";

@registerModifier()
export class modifier_reimagined_broodmother_avenger extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    modifier_avenger: string = "modifier_reimagined_broodmother_avenger_buff";

    // Modifier specials
    avenger_radius?: number;
    avenger_duration?: number;
    avenger_damage_pct?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}
    IsPermanent() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.avenger_radius = this.ability.GetSpecialValueFor("avenger_radius");
        this.avenger_duration = this.ability.GetSpecialValueFor("avenger_duration");
        this.avenger_damage_pct = this.ability.GetSpecialValueFor("avenger_damage_pct");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_DEATH]
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if this unit is a spiderling
        if (!IsSpiderlingUnit(event.unit!, true)) return;

        // Only apply if it was not killed by its kill timer expiring
        if (event.attacker == event.unit!) return;

        // Only apply if the distance between the spiderling and Broodmother is inside the avenger radius
        if (CalculateDistanceBetweenEntities(event.unit!, this.caster) > this.avenger_radius!) return;

        // Add Avenger buff if it doesn't have it yet
        let modifier_handle;
        if (!this.parent.HasModifier(this.modifier_avenger))
        {
            modifier_handle = this.parent.AddNewModifier(this.parent, this.ability, this.modifier_avenger, {duration: this.avenger_duration});
        }

        // Get the handle if not added
        if (!modifier_handle)
        {
            modifier_handle = this.parent.FindModifierByName(this.modifier_avenger);
        }

        if (modifier_handle)
        {
            // Increment a stack for Broodmother
            modifier_handle.IncrementStackCount();
            modifier_handle.ForceRefresh();
        }
    }
}
