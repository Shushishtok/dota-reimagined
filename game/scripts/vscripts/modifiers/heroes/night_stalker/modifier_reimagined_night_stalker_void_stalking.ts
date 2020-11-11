import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";
import { modifier_reimagined_night_stalker_void_debuff } from "./modifier_reimagined_night_stalker_void_debuff";
import { modifier_reimagined_night_stalker_void_stalked } from "./modifier_reimagined_night_stalker_void_stalked";

@registerModifier()
export class modifier_reimagined_night_stalker_void_stalking extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    stalking_ms_bonus?: number;
    stalking_width?: number;
    stalking_distance?: number;
    stalk_interval?: number;

    IsHidden()
    {
        // 1 means no stalk target, 0 means currently stalking a target
        if (this.GetStackCount() == 1)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.stalking_ms_bonus = this.ability.GetSpecialValueFor("stalking_ms_bonus");
        this.stalking_width = this.ability.GetSpecialValueFor("stalking_width");
        this.stalking_distance = this.ability.GetSpecialValueFor("stalking_distance");
        this.stalk_interval = this.ability.GetSpecialValueFor("stalk_interval");

        // Start thinking
        this.StartIntervalThink(this.stalk_interval!);
    }

    OnRefresh(): void
    {
        this.OnCreated();
    }

    OnIntervalThink(): void
    {
        if (!IsServer()) return;

        // Find units in a line from the direction the caster is facing
        const direction = this.parent.GetForwardVector();
        const end_position = (this.parent.GetAbsOrigin() + this.stalking_distance! * direction) as Vector;
        const enemies_in_direction = FindUnitsInLine(this.parent.GetTeamNumber(),
                                                     this.parent.GetAbsOrigin(),
                                                     end_position!,
                                                     undefined,
                                                     this.stalking_width!,
                                                     UnitTargetTeam.ENEMY,
                                                     UnitTargetType.HERO + UnitTargetType.BASIC,
                                                     UnitTargetFlags.NONE)

        // Try to find at least one enemy afflicted with Void
        let found_stalk_target = false;
        for (const enemy of enemies_in_direction)
        {
            if (enemy.HasModifier(modifier_reimagined_night_stalker_void_debuff.name))
            {
                // Found one! Set self's status to stalk mode
                found_stalk_target = true;
                if (this.GetStackCount() != 0)
                {
                    this.SetStackCount(0);
                }
                
                // Apply stalk debuff
                enemy.AddNewModifier(this.caster!, this.ability, modifier_reimagined_night_stalker_void_stalked.name, {duration: this.stalk_interval!});
            }   
        }

        // If we didn't find any, set stack count to 1, which will hide it
        if (!found_stalk_target)
        {
            this.SetStackCount(1);            
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];        
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        // We are stalking a target
        if (this.GetStackCount() == 0)
        {
            return this.stalking_ms_bonus!;
        }

        return 0;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> | undefined
    {
        // Talent: Path to the Prey: While the Stalking buff is active, Night Stalker gains free pathing.
        return this.ReimaginedPathToThePrey();
    }

    ReimaginedPathToThePrey(): Partial<Record<ModifierState, boolean>> | undefined
    {
        // We need to be actively stalking
        if (this.GetStackCount() != 0) return undefined;

        if (HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_2))
        {
            return {[ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
                    [ModifierState.NO_UNIT_COLLISION]: true};
        }

        return undefined;
    }
}