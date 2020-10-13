import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_marksmanship_pride_drow extends BaseModifier
{
    particle_buff: string = "particles/heroes/drow_ranger/marksmanship_pride_of_the_drow.vpcf";

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}
    
    GetEffectName(): string
    {
        return this.particle_buff;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}