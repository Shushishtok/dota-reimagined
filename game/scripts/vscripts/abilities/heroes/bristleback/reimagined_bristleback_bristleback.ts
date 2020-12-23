import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_bristleback_passive"
import "../../../modifiers/heroes/bristleback/modifier_reimagined_bristleback_bristleback_moving_fortress"

@registerAbility()
export class reimagined_bristleback_bristleback extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_bristleback_passive: string = "modifier_reimagined_bristleback_bristleback_passive"
    modifier_moving_fortress: string = "modifier_reimagined_bristleback_bristleback_moving_fortress";

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_back_dmg.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_bristleback/bristleback_back_lrg_dmg.vpcf", context);
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_bristleback_passive;
    }

    ResetToggleOnRespawn() {return true}

    OnToggle(): void
    {
        // Reimagined: Moving Fortress: Can be toggled on to apply the damage reduction from behind to the sides and grant an additional x% damage reduction. However, Bristleback is slowed by y% move speed and z attack speed while this effect is active.
        this.ReimaginedMovingFortress();
    }

    ReimaginedMovingFortress(): void
    {
        // Check if this was a toggle on or toggle off
        if (this.GetToggleState())
        {
            // Toggled on
            this.caster.AddNewModifier(this.caster, this, this.modifier_moving_fortress, {});
        }
        else
        {
            this.caster.RemoveModifierByName(this.modifier_moving_fortress);
        }
    }
}
