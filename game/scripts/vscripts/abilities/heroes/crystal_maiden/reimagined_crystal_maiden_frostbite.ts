import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_frostbite_debuff";
import "../../../modifiers/heroes/crystal_maiden/modifier_reimagined_crystal_maiden_frostbite_buff";
import { HasScepterShard } from "../../../lib/util";

@registerAbility()
export class reimagined_crystal_maiden_frostbite extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Crystal.Frostbite";
    modifier_debuff: string = "modifier_reimagined_crystal_maiden_frostbite_debuff";
    modifier_buff: string = "modifier_reimagined_crystal_maiden_frostbite_buff";

    // Ability specials
    duration?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf", context);
    }

    CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult | undefined
    {
        if (!IsServer()) return;

        // Always apply on enemies according to the unit filter
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            return UnitFilter(target, this.GetAbilityTargetTeam(), this.GetAbilityTargetType(), this.GetAbilityTargetFlags(), this.caster.GetTeamNumber());
        }
        else // Check on allies for disable help
        {
            if (PlayerResource.IsDisableHelpSetForPlayerID(target.GetPlayerOwnerID(), this.caster.GetPlayerOwnerID()))
            {
                return UnitFilterResult.FAIL_DISABLE_HELP;
            }

            return UnitFilter(target, this.GetAbilityTargetTeam(), this.GetAbilityTargetType(), this.GetAbilityTargetFlags(), this.caster.GetTeamNumber());
        }
    }

    GetBehavior(): AbilityBehavior
    {
        let behaviors = AbilityBehavior.UNIT_TARGET;

        if (IsServer() && HasScepterShard(this.caster) && this.caster.IsChanneling())
        {
            behaviors += AbilityBehavior.IGNORE_CHANNEL;
        }

        return behaviors;
    }

    GetCooldown(level: number): number
    {
        let cooldown = super.GetCooldown(level);

        // Scepter Shard effect: Reduces cooldown
        if (HasScepterShard(this.caster))
        {
            cooldown -= this.GetSpecialValueFor("shard_cooldown_reudction");
        }

        return cooldown;
    }

    OnSpellStart(scepter?: boolean): void
    {
        // Ability properties
        const target = this.GetCursorTarget()!;

        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");

        // Play cast sound
        EmitSoundOn(this.sound_cast, target);

        // Apply Frostbite on target according to enemy or ally
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            // Only check for Linken's if this wasn't a scepter cast
            if (!scepter)
            {
                // Check for Linken's Sphere; do nothing else if triggered
                if (target.TriggerSpellAbsorb(this)) return;
            }

            // Ancients, Roshan, Creep Heroes or Real Heroes are assigned the regular duration
            if (target.IsAncient() || target.IsConsideredHero() || target.IsHero())
            {
                target.AddNewModifier(this.caster, this, this.modifier_debuff, {duration: this.duration})
            }
            else
            {
                // Eternal Cold: Lasts infinitely on creeps. Can still be dispellable.
                this.ReimaginationEternalCold(target);
            }
        }
        else // Reimagination: Igloo Frosting: Can be cast on an ally, rooting it and increasing Arcane's Auras effect on that ally by 10 times. Can be help-disabled. No damage is done to a rooted ally. Procs Frost Emanation on nearby enemies.
        {
            this.ReimaginationIglooFrosting(target);
        }
    }

    ReimaginationIglooFrosting(target: CDOTA_BaseNPC)
    {
        target.AddNewModifier(this.caster, this, this.modifier_buff, {duration: this.duration});
    }

    ReimaginationEternalCold(target: CDOTA_BaseNPC)
    {
        target.AddNewModifier(this.caster, this, this.modifier_debuff, {})
    }

    ExecuteOrderFilter(event: ExecuteOrderFilterEvent): boolean
    {
        // Prevent casting if the caster is currently TPing
        if (event.order_type == UnitOrder.CAST_TARGET)
        {
            if (HasScepterShard(this.caster))
            {
                if (this.caster.HasModifier("modifier_teleporting")) return false;
            }
        }

        return true;
    }
}
