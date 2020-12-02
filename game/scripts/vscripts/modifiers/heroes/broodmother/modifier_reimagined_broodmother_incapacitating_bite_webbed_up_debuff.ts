import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_incapacitating_bite_webbed_up_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_debuff: string = "particles/heroes/broodmother/broodmother_webbed_up_debuff.vpcf";

    // Modifier specials
    web_up_miss_chance_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.web_up_miss_chance_pct = this.ability.GetSpecialValueFor("web_up_miss_chance_pct");
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.ROOTED]: true}
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MISS_PERCENTAGE]
    }

    GetModifierMiss_Percentage(): number
    {
        return this.web_up_miss_chance_pct!;
    }

    GetEffectName(): string
    {
        return this.particle_debuff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
