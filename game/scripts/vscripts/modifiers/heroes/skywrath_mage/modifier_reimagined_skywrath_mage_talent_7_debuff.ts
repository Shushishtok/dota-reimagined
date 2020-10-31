import { SkywrathMageTalents } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { CalculateDistanceBetweenPoints, GetTalentSpecialValueFor } from "../../../lib/util";
import { reimagined_skywrath_mage_mystic_flare } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_mystic_flare"

@registerModifier()
export class modifier_reimagined_skywrath_mage_talent_7_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: reimagined_skywrath_mage_mystic_flare = this.GetAbility()! as reimagined_skywrath_mage_mystic_flare; 
    parent: CDOTA_BaseNPC = this.GetParent();
    mystic_flare_ID?: number;
    center_pos?: Vector;

    // Modifier specials
    radius?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(params: {mystic_flare_ID: number}): void
    {
        if (IsServer())
        {
            if (params.mystic_flare_ID)
            {
                this.mystic_flare_ID = params.mystic_flare_ID;

                // Update position
                this.GetCurrentMysticFlarePosition();
            }
            else
            {
                this.Destroy();
                return;
            }

            // Modifier specials
            this.radius = this.ability.GetSpecialValueFor("radius");


            // Start checking!
            const check_interval = GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_7, "check_interval");
            this.StartIntervalThink(check_interval);
        }
    }

    OnIntervalThink()
    {
        // Update position
        this.GetCurrentMysticFlarePosition()   

        // Check if the distance from the center position is higher than the radius
        if (CalculateDistanceBetweenPoints(this.parent.GetAbsOrigin(), this.center_pos!) > this.radius!)
        {
            this.Destroy();
            return;
        }
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.TETHERED]: true}
    }

    GetCurrentMysticFlarePosition(): void
    {
        if (this.mystic_flare_ID)
        {
            if (this.ability.mystic_flare_map.has(this.mystic_flare_ID))
            {
                const properties = this.ability.mystic_flare_map.get(this.mystic_flare_ID)!
                this.center_pos = properties.position;
            }
        }
    }
}