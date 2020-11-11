import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util"

@registerModifier()
export class modifier_reimagined_night_stalker_crippling_fear_silence_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_effect: string = "particles/units/heroes/hero_night_stalker/nightstalker_crippling_fear.vpcf";

    // Reimagined specials
    crippling_crippling_fear_miss_rate?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {        
        // Reimagined specials
        this.crippling_crippling_fear_miss_rate = this.ability.GetSpecialValueFor("crippling_crippling_fear_miss_rate");        

        // Talent: Dreadful Creature: Enemies that are affected by Crippling Fear for over x seconds have Break applied on them and take y% more damage until they lose the aura debuff.
        this.ReimaginedTalentDreadfulCreature();
    }

    ReimaginedTalentDreadfulCreature()
    {
        if (!IsServer()) return;

        if (util.HasTalent(this.caster, NightStalkerTalents.NightStalkerTalents_4))
        {
            if (!this.parent.HasModifier("modifier_reimagined_night_stalker_talent_4_debuff"))
            {
                // Find out how long the aura is still active for
                let aura_duration;
                const modifier_aura = this.caster.FindModifierByName("modifier_reimagined_night_stalker_crippling_fear_aura");
                if (modifier_aura)
                {
                    aura_duration = modifier_aura.GetRemainingTime();
                    this.parent.AddNewModifier(this.caster, this.ability, "modifier_reimagined_night_stalker_talent_4_debuff", {duration: aura_duration})
                }
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MISS_PERCENTAGE]
    }

    GetModifierMiss_Percentage(): number
    {
        return this.crippling_crippling_fear_miss_rate!;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.SILENCED]: true}
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