import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_freezing_field_aura } from "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_freezing_field_aura";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_freezing_field_slow";

@registerAbility()
export class reimagined_crystal_maiden_freezing_field extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_channel: string = "hero_Crystal.freezingField.wind";    

    // Ability specials
    max_duration?: number;    

    OnSpellStart(): void
    {
        // Ability specials
        this.max_duration = this.GetSpecialValueFor("max_duration");

        // Play cast sound
        EmitSoundOn(this.sound_channel, this.caster)

        // Apply Freezing Field aura on self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_crystal_maiden_freezing_field_aura.name, {duration: this.max_duration});
    }

    OnChannelFinish(interrupted: boolean)
    {
        // Stop sound
        StopSoundOn(this.sound_channel, this.caster);

        if (this.caster.HasModifier(modifier_reimagined_crystal_maiden_freezing_field_aura.name))
        {
            this.caster.RemoveModifierByName(modifier_reimagined_crystal_maiden_freezing_field_aura.name);
        }
    }
}