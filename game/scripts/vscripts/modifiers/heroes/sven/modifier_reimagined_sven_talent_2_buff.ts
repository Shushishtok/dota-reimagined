import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { CalculateDirectionToPosition } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_sven_talent_2_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    main_target?: CDOTA_BaseNPC;
    projectile?: ProjectileID;

    // Modifier specials
    bolt_speed?: number;    

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.bolt_speed = this.ability.GetSpecialValueFor("bolt_speed"); 
        
        if (IsServer()) this.StartIntervalThink(FrameTime());
    }

    OnIntervalThink()
    {
        // Drag the enemy towards the main target
        const direction = CalculateDirectionToPosition(this.parent.GetAbsOrigin(), this.main_target!.GetAbsOrigin());
        const new_pos = (this.parent.GetAbsOrigin() + direction * this.bolt_speed! * FrameTime()) as Vector;        
        this.parent.SetAbsOrigin(new_pos);

        if (this.projectile)
        {
            if (!ProjectileManager.IsValidProjectile(this.projectile))
            {
                this.Destroy();
            }
        }
        else
        {
            this.Destroy();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.OVERRIDE_ANIMATION];
    }

    GetOverrideAnimation(): GameActivity
    {
        return GameActivity.DOTA_FLAIL;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>    
    {
        return {[ModifierState.STUNNED]: true};
    }

    OnDestroy(): void
    {
        if (IsServer())
        {
            FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), true);
            ResolveNPCPositions(this.parent.GetAbsOrigin(), this.parent.GetHullRadius());
        }
    }
}