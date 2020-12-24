import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_handler"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_slow"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_frost_arrows_brittle"
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_hypothermia";
import "../../../modifiers/heroes/drow_ranger/modifier_reimagined_drow_ranger_hypothermia_slow";

@registerAbility()
export class reimagined_drow_ranger_frost_arrows extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    modifier_handler: string = "modifier_reimagined_drow_ranger_frost_arrows_handler";
    modifier_hypothermia_slow: string = "modifier_reimagined_drow_ranger_hypothermia_slow";

    // Ability specials
    shard_burst_damage?: number;
    shard_burst_slow_duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/drow_ranger/frost_arrows_cryo_arrowhead.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/status_fx/status_effect_frost.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_marksmanship_start.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_marksmanship.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_base_attack.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_frost_arrow.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_hypothermia_counter_stack.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_shard_hypothermia_death.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_drow/drow_shard_hypothermia_projectile_crystal.vpcf", context);
    }

    GetCastRange(): number
    {
        // Scales with the attack range of the parent
        return this.caster.Script_GetAttackRange();
    }

    OnUpgrade()
    {
        this.shard_burst_damage = this.GetSpecialValueFor("shard_burst_damage");
        this.shard_burst_slow_duration = this.GetSpecialValueFor("shard_burst_slow_duration");
    }

    GetIntrinsicModifierName(): string
    {
        return this.modifier_handler;
    }

    OnSpellStart(): void
    {
        // This literally does n o t h i ng
        // The entire code is located in the handler modifier, and casting this ability is detected there as well
    }

    // This should only trigger when a Scepter Shard Hypothermia enemy dies
    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: {stacks: number}): boolean | void
    {
        if (!target) return;
        if (target.IsMagicImmune()) return;

        // Deals damage based on the Hypothermia stacks the target had when it died
        let stacks = 1;
        if (extraData && extraData.stacks)
        {
            stacks = extraData.stacks;
        }

        const damage = stacks * this.shard_burst_damage!;

        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: damage,
            damage_type: DamageTypes.MAGICAL,
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE
        });

        target.AddNewModifier(this.caster, this, this.modifier_hypothermia_slow, {duration: this.shard_burst_slow_duration});
    }
}
