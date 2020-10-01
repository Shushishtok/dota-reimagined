import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff } from "./modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff"
import { modifier_reimagined_crystal_maiden_frostbite_debuff } from "./modifier_reimagined_crystal_maiden_frostbite_debuff"

@registerModifier()
export class modifier_reimagined_crystal_maiden_crystal_nova_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_slowed = "particles/generic_gameplay/generic_slowed_cold.vpcf";

    // Modifier specials
    movespeed_slow?: number;
    attackspeed_slow?: number;

    // Reimagined specials
    snowbite_interval?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.movespeed_slow = this.ability.GetSpecialValueFor("movespeed_slow");
        this.attackspeed_slow = this.ability.GetSpecialValueFor("attackspeed_slow");

        // Reimagined specials
        this.snowbite_interval = this.ability.GetSpecialValueFor("snowbite_interval");

        // Snowbite: When an enemy is under Frostbite's effect while on a Snowstorm Field, Crystal Nova's slow modifier's refreshes itself.
        this.ReimaginedSnowbite();
    }

    ReimaginedSnowbite(): void
    {
        if (IsServer())
        {
            this.StartIntervalThink(this.snowbite_interval!);
        }
    }

    OnIntervalThink(): void
    {
        // Only applies if the parent has both Frostbite's and Snowstorm Field's modifiers        
        if (this.parent.HasModifier(modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff.name) && this.parent.HasModifier(modifier_reimagined_crystal_maiden_frostbite_debuff.name))
        {
            this.ForceRefresh();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.movespeed_slow! * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.attackspeed_slow! * (-1);
    }

    GetEffectName(): string
    {
        return this.particle_slowed;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}