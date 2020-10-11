import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_marksmanship_passive"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_projectile_handler"
import "../../../modifiers/general_mechanics/modifier_reimagined_damage_penalty"

@registerAbility()
export class reimagined_drow_ranger_marksmanship extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound: string = "";
    particle: string = "";
    particle_fx?: ParticleID;

    // Ability specials
    damage_reduction_scepter?: number;

    GetIntrinsicModifierName(): string
    {
        return modifier_reimagined_drow_ranger_marksmanship_passive.name;
    }

    OnSpellStart(): void
    {
        
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector)
    {
        if (!target) return;

        // Get damage reduction value
        this.damage_reduction_scepter = this.GetSpecialValueFor("damage_reduction_scepter");

        // give Drow a damage reduction penalty modifier for a frame
        const modifier = this.caster.AddNewModifier(this.caster, this, GenericModifier.DAMAGE_REDUCTION, {damage_reduction: this.damage_reduction_scepter});

        // Instant attack the target
        this.caster.PerformAttack(target, true, true, true, false, false, false, false);

        // Remove damage reduction penalty modifier
        modifier.Destroy();
    }
}