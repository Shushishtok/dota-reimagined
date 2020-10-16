import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    // TODO: Add debuff particle: Spirit Vessel ring + electricity particles
    // TODO: Add destruction particle: Mango + Spirit Vessel destruction flash particles
    // both colored gold
    // TODO: destruction sound

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_TAKEDAMAGE]
    }

    OnTakeDamage(event: ModifierAttackEvent): void
    {
        if (IsServer()) return;

        // Only apply on the parent taking damage
        if (event.unit != this.parent) return;

        // Only apply on magical damage being applied by an ability
        if (event.damage_type != DamageTypes.MAGICAL || !event.inflictor) return;

        // Get triggered! Deal damage to the parent        
        ApplyDamage(
        {
            attacker: this.caster,
            damage: this.GetStackCount(),
            damage_type: this.ability.GetAbilityDamageType(),
            victim: this.parent,
            ability: this.ability,
            damage_flags: DamageFlag.NONE
        });

        // Destroy self
        this.Destroy();
    }    
}