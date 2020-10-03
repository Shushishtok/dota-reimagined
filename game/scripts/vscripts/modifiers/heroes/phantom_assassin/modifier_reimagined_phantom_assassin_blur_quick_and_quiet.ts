import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_phantom_assassin_blur_quick_and_quiet extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    quick_quiet_ms_per_interval?: number;
    quick_quiet_linger_duration?: number;    
    quick_quiet_interval?: number;    

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.quick_quiet_ms_per_interval = this.ability.GetSpecialValueFor("quick_quiet_ms_per_interval")
        this.quick_quiet_linger_duration = this.ability.GetSpecialValueFor("quick_quiet_linger_duration");
        this.quick_quiet_interval = this.ability.GetSpecialValueFor("quick_quiet_interval");        

        // Start thinking
        if (IsServer())
        {                                    
            this.StartIntervalThink(this.quick_quiet_interval);
        }
    }

    OnRefresh(): void
    {        
        this.OnCreated();
    }

    OnIntervalThink(): void
    {        
        this.IncrementStackCount();
    }

    LingerAndDispel(): void
    {
        this.SetDuration(this.quick_quiet_linger_duration!, true);
        this.StartIntervalThink(-1);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.TOOLTIP]
    }    

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.quick_quiet_ms_per_interval! * this.GetStackCount();
    }

    OnTooltip(): number
    {
        return this.quick_quiet_linger_duration!;
    }
}