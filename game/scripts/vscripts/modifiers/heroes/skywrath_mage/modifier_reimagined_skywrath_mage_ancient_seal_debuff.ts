import { SkywrathMageTalents } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_talents";
import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_skywrath_mage_ancient_seal_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_seal = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_ancient_seal_debuff.vpcf";
    particle_seal_fx?: ParticleID;    

    // Modifier specials
    resist_debuff?: number;

    // Reimagined properties
    sealed_enmity_bonus_reduction = 0;
    sealed_enmity_damage_taken = 0;

    // Reimagind specials
    rebound_seal_search_radius?: number;
    sealed_enmity_magic_damage_threshold?: number;
    sealed_enmity_magic_reduction_increase?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.resist_debuff = this.ability.GetSpecialValueFor("resist_debuff");

        // Reimagind specials
        this.rebound_seal_search_radius = this.ability.GetSpecialValueFor("rebound_seal_search_radius");
        this.sealed_enmity_magic_damage_threshold = this.ability.GetSpecialValueFor("sealed_enmity_magic_damage_threshold");
        this.sealed_enmity_magic_reduction_increase = this.ability.GetSpecialValueFor("sealed_enmity_magic_reduction_increase");

        // Add particle effect
        this.particle_seal_fx = ParticleManager.CreateParticle(this.particle_seal, ParticleAttachment.OVERHEAD_FOLLOW, this.parent);
        ParticleManager.SetParticleControlEnt(this.particle_seal_fx, 1, this.parent, ParticleAttachment.ABSORIGIN_FOLLOW, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
        this.AddParticle(this.particle_seal_fx, false, false, -1 , false, true);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MAGICAL_RESISTANCE_BONUS,
                ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
                // Reimagined: Sealed Enmity: Every x magical damage accumulated by the target during the debuff increases the magic reduction by y% for the reminder of the duration.
                ModifierFunction.ON_TAKEDAMAGE]
    }

    GetModifierMagicalResistanceBonus(): number
    {
        // Doesn't affect creeps, it seems.
        if (this.parent.IsCreep()) return 0;
        return (this.resist_debuff! + this.sealed_enmity_bonus_reduction) * (-1);
    }

    OnTakeDamage(event: ModifierAttackEvent)
    {
        // Reimagined: Sealed Enmity: Every x magical damage accumulated by the target during the debuff increases the magic reduction by y% for the reminder of the duration.
        this.ReimaginedSealedEnmity(event);
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number
    {
        // Talent: Seal of Amplification: Sealed Enmity now increases damage taken from all types of damage instead of only magical.
        return this.ReimaginedTalentSealOfAmplification(event);
        
        return 0;
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.SILENCED]: true};
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;
        // Reimagined: Rebounding Seal: When the seal expires prematurely, it is applied to the closest enemy in x radius around it, if any. Rebound Seals can repeat this process infinitely.
        this.ReimaginedReboundingSeal();
    }

    ReimaginedReboundingSeal()
    {
        // Check if it was removed earlier than the intended duration, due to a purge or death
        if (this.GetElapsedTime() < this.GetDuration() && this.GetRemainingTime() > 0)
        {
            const enemy_units = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                      this.parent.GetAbsOrigin(),
                                                      undefined,
                                                      this.rebound_seal_search_radius!,
                                                      UnitTargetTeam.ENEMY,
                                                      UnitTargetType.HERO + UnitTargetType.BASIC,
                                                      UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                                                      FindOrder.CLOSEST,
                                                      false);

            for (const enemy_unit of enemy_units)
            {
                // Ignore the parent
                if (enemy_unit == this.parent) continue;

                // Find the closest ally that doesn't have this buff already
                if (!enemy_unit.HasModifier(this.GetName()))
                {
                    enemy_unit.AddNewModifier(this.caster, this.ability, this.GetName(), {duration: this.GetRemainingTime()});
                    break;
                }
            }
        }
    }

    ReimaginedSealedEnmity(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Only apply on damage done to the parent of this modifier
        if (event.unit != this.parent) return;

        // Only apply on magical damage
        if (event.damage_type != DamageTypes.MAGICAL) return;

        
        // Increment damage taken counter
        this.sealed_enmity_damage_taken += event.damage;
        
        // Calculate current sealed enmity percentage
        this.sealed_enmity_bonus_reduction = Math.floor(this.sealed_enmity_damage_taken / this.sealed_enmity_magic_damage_threshold!) * this.sealed_enmity_magic_reduction_increase!;
    }

    ReimaginedTalentSealOfAmplification(event: ModifierAttackEvent): number
    {
        if (HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_5))
        {
            // Ignore magic sources as they're already being handled by reducing magic resistance
            if (event.damage_type == DamageTypes.MAGICAL) return 0;

            // Creeps are unaffected
            if (this.parent.IsCreep()) return 0;

            return this.sealed_enmity_bonus_reduction!;
        }

        return 0;
    }
}