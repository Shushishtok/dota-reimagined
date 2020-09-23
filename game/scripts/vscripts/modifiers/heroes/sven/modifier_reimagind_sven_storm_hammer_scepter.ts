import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"

@registerModifier()
export class modifier_reimagind_sven_storm_hammer_scepter extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();    
    projectileID?: ProjectileID;
    target?: CDOTA_BaseNPC;

    // Modifier specials
    bolt_speed?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.bolt_speed = this.ability!.GetSpecialValueFor("bolt_speed");

        if (IsServer())
        {
            // Start the "flying" gesture
            this.parent.StartGesture(GameActivity.DOTA_OVERRIDE_ABILITY_1);

            // Start thinking every frame
            this.StartIntervalThink(FrameTime())
        }
    }

    OnIntervalThink(): void
    {
        // Update position based on the projectile ID's location
        if (this.projectileID && this.target)
        {   
            const location = ProjectileManager.GetTrackingProjectileLocation(this.projectileID)

            // Break transportation if distance is bigger than 2000
            if (util.CalculateDistanceBetweenPoints(location, this.target.GetAbsOrigin()) > 2000)
            {
                this.Destroy();
            }

            // Set the parent's location to match the particle's.
            if (location)
            {
                this.parent.SetAbsOrigin(location);
            }
        }
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.STUNNED]: true,
                [ModifierState.UNTARGETABLE]: true,                
                [ModifierState.INVULNERABLE]: true,
                [ModifierState.OUT_OF_GAME]: true}
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        if (this.target)
        {
            this.parent.PerformAttack(this.target, false, true, true, true, false, false, false);
        }

        this.parent.FadeGesture(GameActivity.DOTA_OVERRIDE_ABILITY_1);

        FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), false);
        ResolveNPCPositions(this.parent.GetAbsOrigin(), this.parent.GetHullRadius());
    }
}