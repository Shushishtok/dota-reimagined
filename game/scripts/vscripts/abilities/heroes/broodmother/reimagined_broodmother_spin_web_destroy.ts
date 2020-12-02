import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { reimagined_broodmother_spin_web } from "./reimagined_broodmother_spin_web";

@registerAbility()
export class reimagined_broodmother_spin_web_destroy extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    ability_spin_web: string = "reimagined_broodmother_spin_web";
    modifier_web_aura: string = "modifier_reimagined_broodmother_spin_web_aura";

    OnSpellStart(): void
    {
        // Find the owner of the caster
        const owner = this.caster.GetOwner() as CDOTA_BaseNPC;

        if (owner)
        {
            // Find the Spin Web ability on the owner
            const ability_handle = owner.FindAbilityByName(this.ability_spin_web) as reimagined_broodmother_spin_web;
            if (ability_handle)
            {
                const web_array = ability_handle.webs_array;
                if (web_array)
                {
                    // Find the web in the array
                    if (web_array.includes(this.caster))
                    {
                        const removed_web = web_array.splice(web_array.indexOf(this.caster), 1)[0];
                        if (removed_web)
                        {
                            removed_web.ForceKill(false);
                            removed_web.RemoveModifierByName(this.modifier_web_aura);
                        }
                    }
                }
            }
        }
    }
}
