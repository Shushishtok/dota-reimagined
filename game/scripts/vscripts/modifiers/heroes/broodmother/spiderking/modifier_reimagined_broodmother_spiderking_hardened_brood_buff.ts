import { BroodmotherTalents } from "../../../../abilities/heroes/broodmother/reimagined_broodmother_talents";
import { BaseModifier, registerModifier } from "../../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_hardened_brood_buff extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff: string = "particles/heroes/broodmother/broodmother_spiderking_hardened_brood.vpcf";
    owner?: CDOTA_BaseNPC;

    // Modifier specials
    damage_reduction?: number;

    IsHidden() {
        return false;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }

    OnCreated(): void {
        // Modifier specials
        this.damage_reduction = this.ability.GetSpecialValueFor("damage_reduction");

        if (!IsServer()) return;
        this.owner = this.parent.GetOwner() as CDOTA_BaseNPC;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
            // Talent: Broodfather: Spiderking's Hardened Brood Aura now also prevents the death of affected Spiderlings and Spiderites.
            ModifierFunction.MIN_HEALTH,
        ];
    }

    GetModifierIncomingDamage_Percentage(): number {
        return this.damage_reduction! * -1;
    }

    GetMinHealth(): number | undefined {
        // Talent: Broodfather: Spiderking's Hardened Brood Aura now also prevents the death of affected Spiderlings and Spiderites.
        return this.ReimaginedTalentBroodfather();
    }

    ReimaginedTalentBroodfather(): number | undefined {
        if (this.owner && HasTalent(this.owner, BroodmotherTalents.BroodmotherTalent_2)) {
            return 1;
        }

        return undefined;
    }

    GetEffectName(): string {
        return this.particle_buff;
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
