import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_ancient_seal_debuff"
import "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_ancient_seal_screeauk"

@registerAbility()
export class reimagined_skywrath_mage_ancient_seal extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    cast_responses = ["skywrath_mage_drag_ancient_seal_01, skywrath_mage_drag_ancient_seal_03"];
	rare_cast_response = "skywrath_mage_drag_ancient_seal_02";
	sound_cast = "Hero_SkywrathMage.AncientSeal.Target";    

    // Ability specials
    seal_duration?: number;
    scepter_radius?: number;    

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget()!;        

        // Ability specials
        this.seal_duration = this.GetSpecialValueFor("seal_duration");
        this.scepter_radius = this.GetSpecialValueFor("scepter_radius");

        // Roll for rare cast response
        if (RollPercentage(15))
        {
            EmitSoundOn(this.rare_cast_response, this.caster);
        }
        else if (RollPercentage(25))
        {
            EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length - 1)], this.caster);
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Reimagined: Seal of Scree'auk: Can be cast on an ally to set the seal within it, granting it a x% spell amp increase, and causes it to emit an aura that applies Ancient Seal's debuff on any enemy in y radius near it.
        if (this.ReimaginedSealofScreeauk(target)) return;

        // If the target has Linken's Sphere, absorb the effect and do nothing else
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            if (target.TriggerSpellAbsorb(this))
            {
                return;
            }
        }

        // Apply the modifier on the enemy
        target.AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_debuff", {duration: this.seal_duration});

        // Scepter: Secondary effect around the target. Prioritizes heroes
        if (this.caster.HasScepter())
        {                    
            let target_found = false;
            const enemy_heroes = util.FindUnitsAroundUnit(this.caster,
                                                          target,
                                                          this.scepter_radius,
                                                          UnitTargetTeam.ENEMY,
                                                          UnitTargetType.HERO,
                                                          UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS);

            for (const enemy_hero of enemy_heroes)
            {
                // Ignore the main target
                if (enemy_hero == target) continue;    

                // Apply Ancient Seal on the first enemy and stop                
                enemy_hero.AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_debuff", {duration: this.seal_duration});
                target_found = true;
                break;                
            }

            // If we didn't find any hero, then cast it on a nearby creep instead
            if (!target_found)
            {
                const enemy_creeps = util.FindUnitsAroundUnit(this.caster,
                                                              target,
                                                              this.scepter_radius,
                                                              UnitTargetTeam.ENEMY,
                                                              UnitTargetType.BASIC,
                                                              UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS);

                if (enemy_creeps.length > 0)
                {
                    enemy_creeps[0].AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_debuff", {duration: this.seal_duration});
                    return;
                }                                                              
            }
        }
    }

    ReimaginedSealofScreeauk(target: CDOTA_BaseNPC): boolean
    {
        // If the target is an ally, apply Seal of Scree'auk effects and return true
        if (target.GetTeamNumber() == this.caster.GetTeamNumber())
        {
            target.AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_screeauk", {duration: this.seal_duration})
            
            // Scepter: Secondary effect around the target. Prioritizes heroes
            if (this.caster.HasScepter())
            {                    
                let target_found = false;
                const friendly_heroes = util.FindUnitsAroundUnit(this.caster,
                                                            target,
                                                            this.scepter_radius!,
                                                            UnitTargetTeam.FRIENDLY,
                                                            UnitTargetType.HERO,
                                                            UnitTargetFlags.NONE);

                for (const friendly_hero of friendly_heroes)
                {
                    // Ignore the main target
                    if (friendly_hero == target) continue;    

                    // Apply Ancient Seal on the first enemy and stop                
                    friendly_hero.AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_screeauk", {duration: this.seal_duration});
                    target_found = true;
                    break;                
                }

                // If we didn't find any hero, then cast it on a nearby creep instead
                if (!target_found)
                {
                    const friendly_creeps = util.FindUnitsAroundUnit(this.caster,
                                                                target,
                                                                this.scepter_radius!,
                                                                UnitTargetTeam.FRIENDLY,
                                                                UnitTargetType.BASIC,
                                                                UnitTargetFlags.NONE);

                    if (friendly_creeps.length > 0)
                    {
                        friendly_creeps[0].AddNewModifier(this.caster, this, "modifier_reimagined_skywrath_mage_ancient_seal_screeauk", {duration: this.seal_duration});
                    }                                                              
                }
            }
            return true;
        }
        return false;
    }
}