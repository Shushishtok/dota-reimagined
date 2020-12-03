import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_hatch extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    original_scale?: number;

    OnCreated(): void
    {
        if (!IsServer()) return;
        this.original_scale = this.ability.GetSpecialValueFor("model_size");
        this.StartIntervalThink(FrameTime());
    }

    OnIntervalThink(): void
    {
        this.parent.SetModelScale(this.GetElapsedTime() / this.GetDuration() * this.original_scale!);
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;
        this.parent.SetModelScale(this.original_scale!);
    }

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.STUNNED]: true}
    }
}
