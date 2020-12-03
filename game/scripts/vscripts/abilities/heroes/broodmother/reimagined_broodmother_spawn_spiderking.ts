import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/broodmother/spiderking/modifier_reimagined_broodmother_spiderking_hatch"


@registerAbility()
export class reimagined_broodmother_spawn_spiderking extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_spawn: string = "Hero_Broodmother.SpawnSpiderlings";
    unit_spiderking: string = "npc_dota_reimagined_broodmother_spiderking";
    modifier_spiderking_hatch: string = "modifier_reimagined_broodmother_spiderking_hatch";
    spiderkings_array: CDOTA_BaseNPC[] = [];

    // Ability specials
    max_spiderkings?: number;
    spawn_distance?: number;
    hatch_duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.MODEL, "models/items/broodmother/spiderling/elder_blood_heir_of_elder_blood/elder_blood_heir_of_elder_blood.vmdl", context);
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.max_spiderkings = this.GetSpecialValueFor("max_spiderkings");
        this.spawn_distance = this.GetSpecialValueFor("spawn_distance");
        this.hatch_duration = this.GetSpecialValueFor("hatch_duration");

        // Play sound
        EmitSoundOn(this.sound_spawn, this.caster);

        // Calculate direction behind her
        const direction = this.caster.GetForwardVector() * (-1);

        // Calculate position behind the caster
        const spawn_position = (this.caster.GetAbsOrigin() + this.spawn_distance * direction) as Vector;

        // Spawn a new Spiderking
        CreateUnitByNameAsync(this.unit_spiderking, spawn_position, true, this.caster, this.caster, this.caster.GetTeamNumber(), (spiderking) =>
        {
            // Set its properties: controllable, owner, and abilities
            spiderking.SetOwner(this.caster);
            spiderking.SetControllableByPlayer(this.caster.GetPlayerOwnerID(), true);

            for (let index = 0; index < spiderking.GetAbilityCount(); index++)
            {
                const ability = spiderking.GetAbilityByIndex(index);
                if (ability)
                {
                    ability.SetLevel(this.GetLevel());
                }
                else break;
            }

            // Give it the hatch modifier
            spiderking.AddNewModifier(this.caster, this, this.modifier_spiderking_hatch, {duration: this.hatch_duration});

            // Add into the array
            this.spiderkings_array.push(spiderking);

            // Check if there are too many Spiderkings in the array now: if so, remove and kill the oldest one
            if (this.spiderkings_array.length > this.max_spiderkings!)
            {
                const old_spiderking = this.spiderkings_array.shift();
                if (old_spiderking)
                {
                    old_spiderking.ForceKill(false);
                }
            }
        });
    }

    OnUpgrade(): void
    {
        // Check if we currently have a Spiderking(s)
        if (this.spiderkings_array.length > 0)
        {
            // Set its ability levels accordingly
            for (const spiderking of this.spiderkings_array)
            {
                for (let index = 0; index < spiderking.GetAbilityCount(); index++)
                {
                    const ability = spiderking.GetAbilityByIndex(index);
                    if (ability)
                    {
                        ability.SetLevel(this.GetLevel());
                    }
                    else break;
                }
            }
        }
    }
}
