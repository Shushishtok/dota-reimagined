import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_frostbite_debuff } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_frostbite_debuff";
import { modifier_reimagined_crystal_maiden_frostbite_buff } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_frostbite_buff";

@registerAbility()
export class reimagined_crystal_maiden_frostbite extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Crystal.Frostbite";    

    // Ability specials
    duration?: number;    

    CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult | undefined
    {
        if (!IsServer()) return;

        // Always apply on enemies according to the unit filter
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            return UnitFilter(target, this.GetAbilityTargetTeam(), this.GetAbilityTargetType(), this.GetAbilityTargetFlags(), this.caster.GetTeamNumber());
        }
        else // Check on allies for disable help
        {
            if (PlayerResource.IsDisableHelpSetForPlayerID(target.GetPlayerOwnerID(), this.caster.GetPlayerOwnerID()))
            {
                return UnitFilterResult.FAIL_DISABLE_HELP;
            }            

            return UnitFilter(target, this.GetAbilityTargetTeam(), this.GetAbilityTargetType(), this.GetAbilityTargetFlags(), this.caster.GetTeamNumber());            
        }
    }

    OnSpellStart(scepter?: boolean): void
    {
        // Ability properties
        const target = this.GetCursorTarget()!;

        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Play cast sound
        EmitSoundOn(this.sound_cast, target);

        // Apply Frostbite on target according to enemy or ally
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            // Only check for Linken's if this wasn't a scepter cast
            if (!scepter)
            {
                // Check for Linken's Sphere; do nothing else if triggered
                if (target.TriggerSpellAbsorb(this)) return;
            }

            // Ancients, Roshan, Creep Heroes or Real Heroes are assigned the regular duration            
            if (target.IsAncient() || target.IsConsideredHero() || target.IsHero())
            {
                target.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_frostbite_debuff.name, {duration: this.duration})
            }
            else
            {
                // Eternal Cold: Lasts infinitely on creeps. Can still be dispellable.
                this.ReimaginationEternalCold(target);
            }            
        }   
        else // Reimagination: Igloo Frosting: Can be cast on an ally, rooting it and increasing Arcane's Auras effect on that ally by 10 times. Can be help-disabled. No damage is done to a rooted ally. Procs Frost Emanation on nearby enemies.     
        {
            this.ReimaginationIglooFrosting(target);
        }
    }

    ReimaginationIglooFrosting(target: CDOTA_BaseNPC)
    {
        target.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_frostbite_buff.name, {duration: this.duration});
    }

    ReimaginationEternalCold(target: CDOTA_BaseNPC)
    {
        target.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_frostbite_debuff.name, {})
    }
}