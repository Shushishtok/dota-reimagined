import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import "./modifier_reimagined_broodmother_incapacitating_bite_webbed_up_debuff"

@registerModifier()
export class modifier_reimagined_broodmother_incapacitating_bite_webbed_up_counter extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_debuff: string = "particles/heroes/broodmother/broodmother_webbed_up_counter_effect.vpcf";
    modifier_debuff: string = "modifier_reimagined_broodmother_incapacitating_bite_webbed_up_debuff";

    // Modifier specials
    web_up_stacks_threshold?: number;
    web_up_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.web_up_stacks_threshold = this.ability.GetSpecialValueFor("web_up_stacks_threshold");
        this.web_up_duration = this.ability.GetSpecialValueFor("web_up_duration");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.web_up_stacks_threshold!;
    }

    OnStackCountChanged(): void
    {
        if (!IsServer()) return;

        // Get current stacks
        const stacks = this.GetStackCount();

        // If we're above the threshold, trigger the debuff and remove this modifier
        if (stacks >= this.web_up_stacks_threshold!)
        {
            this.parent.AddNewModifier(this.caster, this.ability, this.modifier_debuff, {duration: this.web_up_duration});
            this.Destroy();
        }
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
