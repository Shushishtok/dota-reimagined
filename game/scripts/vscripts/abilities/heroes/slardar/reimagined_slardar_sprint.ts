import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_sprint_buff";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_sprint_river";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_sprint_finish_strong";
import "../../../modifiers/heroes/slardar/modifier_reimagined_slardar_talent_1_slow_debuff";

@registerAbility()
export class reimagined_slardar_sprint extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Slardar.Sprint";
    modifier_sprint: string = "modifier_reimagined_slardar_sprint_buff";
    modifier_river: string = "modifier_reimagined_slardar_sprint_river";

    // Ability specials
    duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_sprint.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_slardar/slardar_sprint_river.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_headstrong.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_finish_strong_jump.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_finish_strong_landing.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/slardar/slardar_finish_strong_trail.vpcf", context);
    }

    OnUpgrade(): void
    {
        this.duration = this.GetSpecialValueFor("duration");
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_river;
    }

    OnSpellStart(): void
    {
        // Play cast sound
        this.caster.EmitSound(this.sound_cast);

        // Give self the sprint modifier
        this.caster.AddNewModifier(this.caster, this, this.modifier_sprint, {duration: this.duration});
    }
}
