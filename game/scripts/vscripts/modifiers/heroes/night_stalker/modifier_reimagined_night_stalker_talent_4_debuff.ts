import { NightStalkerTalents } from "../../../abilities/heroes/night_stalker/reimagined_night_stalker_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_night_stalker_talent_4_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    fear_modifier: string = "modifier_reimagined_night_stalker_crippling_fear_fear_debuff";
    silence_modifier: string = "modifier_reimagined_night_stalker_crippling_fear_silence_debuff";
    talent_active: boolean = false;

    // Modifier specials
    application_threshold?: number;
    incoming_damage_increase?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.application_threshold = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_4, "application_threshold");        
        this.incoming_damage_increase = GetTalentSpecialValueFor(this.caster, NightStalkerTalents.NightStalkerTalents_4, "incoming_damage_increase")
        if (IsServer()) this.StartIntervalThink(0.1);        
    }

    OnIntervalThink(): void
    {
        // Check if the parent is no longer affected by either debuff
        if (!this.parent.HasModifier(this.fear_modifier) && !this.parent.HasModifier(this.silence_modifier))
        {
            this.Destroy();
        }

        // Check if talent should be active
        if (!this.talent_active)
        {
            if (this.GetElapsedTime() >= this.application_threshold!)
            {
                this.talent_active = true;
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE]
    }

    GetModifierIncomingDamage_Percentage(): number
    {
        if (this.talent_active)
        {
            return this.incoming_damage_increase!;
        }

        return 0;        
    }

    CheckState(): Partial<Record<ModifierState, boolean>> | undefined
    {
        if (this.talent_active)
        {
            return {[ModifierState.PASSIVES_DISABLED]: true}
        }

        return undefined;
    }
}