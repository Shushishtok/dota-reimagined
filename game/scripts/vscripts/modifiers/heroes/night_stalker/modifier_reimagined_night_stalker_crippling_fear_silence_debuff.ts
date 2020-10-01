import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";

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
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Reimagined specials
        this.crippling_crippling_fear_miss_rate = this.ability.GetSpecialValueFor("crippling_crippling_fear_miss_rate");        
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