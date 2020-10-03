import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_phantom_assassin_blur_passive } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_passive"
import { modifier_reimagined_phantom_assassin_blur_active } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_active"
import "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_blur_quick_and_quiet"

@registerAbility()
export class reimagined_phantom_assassin_blur extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();

    // Ability specials
    duration?: number;

    GetCastPoint(): number
    {
        // Scepter: instant cast time
        if (this.caster.HasScepter())
        {
            return 0;
        }

        return super.GetCastPoint();
    }

    GetCooldown(): number
    {
        // Scepter: cooldown decrease
        if (this.caster.HasScepter())
        {
            return this.GetSpecialValueFor("scepter_cooldown");
        }

        return super.GetCooldown(this.GetLevel());
    }

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_phantom_assassin_blur_passive.name;
    }

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Apply Blur on self
        this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_blur_active.name, {duration: this.duration});

        // Scepter: Basic dispel self from debuffs
        if (this.caster.HasScepter())
        {
            this.caster.Purge(false, true, false, false, false);
        }
    }
}