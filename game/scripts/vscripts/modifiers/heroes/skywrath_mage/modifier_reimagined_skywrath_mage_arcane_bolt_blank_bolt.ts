import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_blank_bolt: string = "particles/heroes/skywrath_mage/blank_bolt.vpcf";
    particle_damage: string = "particles/heroes/skywrath_mage/blank_bolt_endcap.vpcf";
    sound_damage: string = "Item.StarEmblem.Enemy";

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    GetEffectName(): string
    {
        return this.particle_blank_bolt;
    }

    GetEffectAttachType(): ParticleAttachment
    {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }    

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_TAKEDAMAGE]
    }

    OnTakeDamage(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply on the parent taking damage        
        if (event.unit != this.parent) return;

        // Do nothing if the parent is still magic immune
        if (event.unit.IsMagicImmune()) return;

        // Do nothing if the damage was caused due to reflection
        if (util.HasBit(event.damage_flags, DamageFlag.REFLECTION)) return;
        
        // Only apply on magical damage being applied by an ability
        if (event.damage_type != DamageTypes.MAGICAL) return;

        // Get triggered! Deal damage to the parent        
        const damage = ApplyDamage(
        {
            attacker: this.caster,
            damage: this.GetStackCount(),
            damage_type: this.ability.GetAbilityDamageType(),
            victim: this.parent,
            ability: this.ability,
            damage_flags: DamageFlag.REFLECTION
        });
        
        // Play damage
        EmitSoundOn(this.sound_damage, this.parent);

        // Play damage particle
        ParticleManager.ReleaseParticleIndex((ParticleManager.CreateParticle(this.particle_damage, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent)));        

        // Destroy this modifier
        this.Destroy();
    }
}