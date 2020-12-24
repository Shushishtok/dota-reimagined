import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_silken_bola_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_debuff: string = "particles/units/heroes/hero_broodmother/broodmother_silken_bola_root.vpcf";
    particle_debuff_fx?: ParticleID;
    damage_per_interval?: number;

    // Modifier specials
    damage_per_second?: number;
    damage_interval?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.damage_per_second = this.ability.GetSpecialValueFor("damage_per_second");
        this.damage_interval = this.ability.GetSpecialValueFor("damage_interval");

        // Calculate damage per interval
        this.damage_per_interval = this.damage_per_second * this.damage_interval;

        // Create and add particle to modifier
        this.particle_debuff_fx = ParticleManager.CreateParticle(this.particle_debuff, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_debuff_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_debuff_fx, 1, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_debuff_fx, 2, Vector(this.GetDuration(), 0, 0));
        ParticleManager.SetParticleControl(this.particle_debuff_fx, 4, this.parent.GetAbsOrigin());
        this.AddParticle(this.particle_debuff_fx, false, false, -1, false, false);

        if (IsServer()) this.StartIntervalThink(this.damage_interval);
    }

    OnIntervalThink(): void
    {
        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: this.damage_per_interval!,
            damage_type: this.ability.GetAbilityDamageType(),
            victim: this.parent,
            ability: this.ability,
        });
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.ROOTED]: true,
                [ModifierState.INVISIBLE]: false}
    }

    GetPriority(): ModifierPriority
    {
        return ModifierPriority.HIGH;
    }
}
