import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights extends BaseModifier
{
    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    ability: CDOTABaseAbility = this.GetAbility()!

    // Modifier specials
    everlasting_night_duration?: number

    GetTexture(): string
    {
        // Original texture!
        return "night_stalker/everlasting_nights";
    }

    OnCreated()
    {
        // Modifier properties
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.everlasting_night_duration = this.ability.GetSpecialValueFor("everlasting_night_duration");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.everlasting_night_duration! * this.GetStackCount();
    }
}

