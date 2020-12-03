import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_hardened_brood_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff: string = "particles/heroes/broodmother/broodmother_spiderking_hardened_brood.vpcf";

    // Modifier specials
    damage_reduction?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.damage_reduction = this.ability.GetSpecialValueFor("damage_reduction");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        return this.damage_reduction! * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_buff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
