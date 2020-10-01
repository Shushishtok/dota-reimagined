import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_antimage_blink_magic_nullity extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_shield: string = "particles/heroes/anti_mage/antimage_magic_nullity_shield.vpcf";
    particle_shield_fx?: ParticleID;

    // Modifier specials
    magic_nullity_magic_res?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.magic_nullity_magic_res = this.ability?.GetSpecialValueFor("magic_nullity_magic_res");

        // Attach particle
        this.particle_shield_fx = ParticleManager.CreateParticle(this.particle_shield, ParticleAttachment.POINT_FOLLOW, this.parent);
        ParticleManager.SetParticleControlEnt(this.particle_shield_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", this.parent.GetAbsOrigin(), true);
        this.AddParticle(this.particle_shield_fx, false, false, -1, false, false);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MAGICAL_RESISTANCE_BONUS]
    }

    GetModifierMagicalResistanceBonus(): number
    {
        return this.magic_nullity_magic_res!;
    }
}