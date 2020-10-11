import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_multishot_endless_barrage extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {   
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ORDER]        
    }

    OnOrder(event: ModifierUnitEvent)
    {
        if (!IsServer) return;

        // Only apply if the order issuer is the parent
        if (event.unit != this.parent) return;

        // If an auto cast order was issued, change stack count: 0 - no barrage mode, 1 - barrage mode
        if (event.order_type == UnitOrder.CAST_TOGGLE_AUTO)
        {
            Timers.CreateTimer(FrameTime(), () =>
            {
                if (this.ability.GetAutoCastState()) this.SetStackCount(1);
                else this.SetStackCount(0);
            });
        }
    }
}