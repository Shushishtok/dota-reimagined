import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"

@registerModifier()
export class modifier_reimagined_night_stalker_crippling_fear_fear_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_effect: string = "particles/heroes/night_stalker/reimagined_nightstalker_crippling_fear_feared.vpcf";

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;
        
        if (IsServer())
        {
            this.StartIntervalThink(0.1)
        }
    }

    OnIntervalThink(): void
    {
        // Get caster's position
        const caster_position = this.caster!.GetAbsOrigin();

        // Calculate the distance and direction between the parent and the caster
        const direction = util.CalculateDirectionToPosition(this.caster!.GetAbsOrigin(), this.parent.GetAbsOrigin());
        const distance = util.CalculateDistanceBetweenEntities(this.caster!, this.parent);

        // Find a position away from the caster
        const run_position: Vector = (this.caster!.GetAbsOrigin() + direction * (distance + 200)) as Vector;

        // Force parent to move to this position
        this.parent.MoveToPosition(run_position);
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.FEARED]: true,
                [ModifierState.COMMAND_RESTRICTED]: true}
    }

    GetEffectName()
    {
        return this.particle_effect;
    }

    GetEffectAttachType()
    {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }
}