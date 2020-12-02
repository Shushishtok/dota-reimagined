import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenEntities } from "../../../lib/util";
import "./modifier_reimagined_broodmother_spin_web_web_sense_debuff";

@registerModifier()
export class modifier_reimagined_broodmother_spin_web_debuff extends BaseModifier
{
    // Reimagined: Web Sense: Enemies entering the web have their models shown through Fog of War for x seconds. This can only occur once per entrance to each web.

    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    unit_web: string = "npc_dota_broodmother_web";
    closest_web?: CDOTA_BaseNPC;
    interval_think: number = 0.25;
    modifier_web_sense: string = "modifier_reimagined_broodmother_spin_web_web_sense_debuff";

    // Modifier specials
    web_sense_duration?: number;
    radius?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.web_sense_duration = this.ability.GetSpecialValueFor("web_sense_duration");
        this.radius = this.ability.GetSpecialValueFor("radius");

        if (IsServer()) this.StartIntervalThink(this.interval_think);
    }

    OnIntervalThink(): void
    {
        // Check if no web is registered yet, or the current web is invalid
        if (!this.closest_web || !IsValidEntity(this.closest_web) || this.closest_web.IsNull())
        {
            const closest_web = this.FindClosestWeb();
            if (closest_web)
            {
                this.closest_web = closest_web;
                this.parent.AddNewModifier(this.caster, this.ability, this.modifier_web_sense, {duration: this.web_sense_duration!});
            }
        }
        // Check if we're no longer in distance of the current web
        else if (CalculateDistanceBetweenEntities(this.parent, this.closest_web) > this.radius!)
        {
            // We need a new web
            const closest_web = this.FindClosestWeb();

            // Register the new closest web and initialize timer
            if (closest_web)
            {
                // We got a new web: re-initialize
                this.closest_web = closest_web;
                this.parent.RemoveModifierByName(this.modifier_web_sense);
                this.parent.AddNewModifier(this.caster, this.ability, this.modifier_web_sense, {duration: this.web_sense_duration!});
            }
        }
    }

    FindClosestWeb(): CDOTA_BaseNPC | undefined
    {
        // Find the closest web in the radius
        const webs = Entities.FindAllByNameWithin(this.unit_web, this.parent.GetAbsOrigin(), this.radius!) as CDOTA_BaseNPC[];
        let closest_web: CDOTA_BaseNPC | undefined;
        let closest_web_distance: number = 0;
        for (const web of webs)
        {
            if (!closest_web)
            {
                closest_web = web;
                closest_web_distance = CalculateDistanceBetweenEntities(this.parent, web);
            }
            else
            {
                // Check if the web is closer than the closest web we've encountered thus far
                if (CalculateDistanceBetweenEntities(this.parent, web) < closest_web_distance)
                {
                    closest_web = web;
                    closest_web_distance = CalculateDistanceBetweenEntities(this.parent, web);
                }
            }
        }

        return closest_web;
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.web_sense_duration!;
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // Remove the Web Sense modifier, if any
        if (this.parent.HasModifier(this.modifier_web_sense)) this.parent.RemoveModifierByName(this.modifier_web_sense);
    }
}
