import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit, IsSpiderling, IsSpiderlingUnit } from "../../../lib/util";
import { modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff } from "./modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff";

@registerModifier()
export class modifier_reimagined_broodmother_insatiable_hunger_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    sound_hunger: string = "Hero_Broodmother.InsatiableHunger";
    particle_hunger: string = "particles/units/heroes/hero_broodmother/broodmother_hunger_buff.vpcf";
    particle_hunger_fx?: ParticleID;
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    bonus_damage?: number;
    lifesteal_pct?: number;

    // Reimagiend properties
    modifier_aura_buff: string = "modifier_reimagined_broodmother_insatiable_hunger_queen_of_brood_buff";
    modifier_feed_brood_debuff: string = "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_debuff";
    modifier_feed_brood_health_buff: string = "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff";
    modified_feed_brood_unit_heal_buff: string = "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_unit_heal";

    // Reimagined specials
    queen_brood_radius?: number;
    feed_brood_debuff_duration?: number;
    feed_brood_brood_hero_health?: number;
    feed_brood_brood_unit_health?: number;
    feed_brood_heal_duration?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");
        this.lifesteal_pct = this.ability.GetSpecialValueFor("lifesteal_pct");

        // Reimagined specials
        this.queen_brood_radius = this.ability.GetSpecialValueFor("queen_brood_radius");
        this.feed_brood_debuff_duration = this.ability.GetSpecialValueFor("feed_brood_debuff_duration");
        this.feed_brood_brood_hero_health = this.ability.GetSpecialValueFor("feed_brood_brood_hero_health");
        this.feed_brood_brood_unit_health = this.ability.GetSpecialValueFor("feed_brood_brood_unit_health");
        this.feed_brood_heal_duration = this.ability.GetSpecialValueFor("feed_brood_heal_duration");

        if (!IsServer()) return;

        // Play hunger sound
        this.parent.EmitSound(this.sound_hunger);

        // Apply particle
        this.particle_hunger_fx = ParticleManager.CreateParticle(this.particle_hunger, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControlEnt(this.particle_hunger_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.THORAX, this.parent.GetAbsOrigin(), true);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PREATTACK_BONUS_DAMAGE,
                ModifierFunction.TOOLTIP,
                // Reimagined: Feed The Brood: While Insatiable Hunger is active, Broodmother's attacks apply a debuff on it. If the target dies while the debuff is still active, Broodmother's current and max health increases by x for each hero killed, or by y for each unit killed. Upon killing an enemy unit, all spider units under her control in Queen of the Brood range are healed by z health every second for t seconds. Stacks have independent timers. Brood's health bonus is removed when Insatiable Hunger ends.
                ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.ON_DEATH]
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        return this.bonus_damage!;
    }

    OnTooltip(): number
    {
        return this.lifesteal_pct!;
    }

    OnAttackLanded(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Reimagined: Feed The Brood: While Insatiable Hunger is active, Broodmother's attacks apply a debuff on it. If the target dies while the debuff is still active, Broodmother's current and max health increases by x for each hero killed, or by y for each unit killed. Upon killing an enemy unit, all spider units under her control in Queen of the Brood range are healed by z health every second for t seconds. Stacks have independent timers. Brood's health bonus is removed when Insatiable Hunger ends.
        this.ReimaginedFeedTheBroodApplyDebuff(event);
    }

    OnDeath(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Reimagined: Feed The Brood: While Insatiable Hunger is active, Broodmother's attacks apply a debuff on it. If the target dies while the debuff is still active, Broodmother's current and max health increases by x for each hero killed, or by y for each unit killed. Upon killing an enemy unit, all spider units under her control in Queen of the Brood range are healed by z health every second for t seconds. Stacks have independent timers. Brood's health bonus is removed when Insatiable Hunger ends.
        this.ReimaginedFeedTheBrood(event);
    }

    GetModifierLifeStealStacking(): number
    {
        return this.lifesteal_pct!;
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        this.parent.StopSound(this.sound_hunger);

        if (this.particle_hunger_fx)
        {
            ParticleManager.DestroyParticle(this.particle_hunger_fx, false);
            ParticleManager.ReleaseParticleIndex(this.particle_hunger_fx);
        }
    }

    ReimaginedFeedTheBroodApplyDebuff(event: ModifierAttackEvent)
    {
        // Only apply on the parent attacking
        if (event.attacker != this.parent) return;

        // Ignore buildings, wards and allies
        if (event.target.IsBuilding() || event.target.IsOther() || event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Ignore magic immune enemies
        if (event.target.IsMagicImmune()) return;

        // Apply the debuff on the enemy (or refresh it)
        event.target.AddNewModifier(this.parent, this.ability, this.modifier_feed_brood_debuff, {duration: this.feed_brood_debuff_duration});
    }

    ReimaginedFeedTheBrood(event: ModifierAttackEvent)
    {
        // Only apply if the unit had the Feed the Brood debuff modifier
        if (!event.unit.HasModifier(this.modifier_feed_brood_debuff)) return;

        // Only apply if this was an enemy
        if (event.unit.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Grant the parent the health increase buff, or fetch it
        let modifier_buff;
        if (!this.parent.HasModifier(this.modifier_feed_brood_health_buff))
        {
            modifier_buff = this.parent.AddNewModifier(this.parent, this.ability, this.modifier_feed_brood_health_buff, {duration: this.GetRemainingTime()}) as modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff;
        }
        else
        {
            modifier_buff = this.parent.FindModifierByName(this.modifier_feed_brood_health_buff) as modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff;
        }

        if (modifier_buff)
        {
            // Determine how much health it should grant
            let health_bonus;
            if (event.unit.IsRealHero()) health_bonus = this.feed_brood_brood_hero_health!;
            else health_bonus = this.feed_brood_brood_unit_health!;

            // Increase the health of the modifier
            modifier_buff.SetStackCount(modifier_buff.GetStackCount() + health_bonus);

            // Force recalculation of stats
            (this.parent as CDOTA_BaseNPC_Hero).CalculateStatBonus();
        }

        // Feed the brood!
        // Find all spiderlings in radius
        let spiderlings = FindUnitsAroundUnit(this.parent, this.parent, this.queen_brood_radius!, UnitTargetTeam.FRIENDLY, UnitTargetType.BASIC, UnitTargetFlags.PLAYER_CONTROLLED);

        // Filter spiderlings, spiderites and spiderking
        spiderlings = spiderlings.filter(unit => IsSpiderlingUnit(unit, true));

        for (const spiderling of spiderlings)
        {
            // Give the Spiderling the healing buff
            let modifier;
            if (!spiderling.HasModifier(this.modified_feed_brood_unit_heal_buff))
            {
                modifier = spiderling.AddNewModifier(this.parent, this.ability, this.modified_feed_brood_unit_heal_buff, {duration: this.feed_brood_heal_duration})
            }
            else
            {
                modifier = spiderling.FindModifierByName(this.modified_feed_brood_unit_heal_buff);
            }

            if (modifier)
            {
                // Grant a stack to the modifier
                modifier.IncrementStackCount();
            }
        }
    }

    // Reimagined: Queen of the Brood: While Insatiable Hunger is active, Broodmother emits an aura that increases the damage of nearby spider units under her control in x range by y, and grants them z% lifesteal.
    IsAura() {return true}
    GetAuraDuration() {return 0.5}
    GetAuraEntityReject(target: CDOTA_BaseNPC): boolean
    {
        // Only applies on her spiderling units
        if (IsSpiderlingUnit(target, true) && target.GetOwner() == this.parent) return false;

        // Reject everything else
        return true;
    }
    GetAuraRadius() {return this.queen_brood_radius!}
    GetAuraSearchFlags() {return UnitTargetFlags.PLAYER_CONTROLLED}
    GetAuraSearchTeam() {return UnitTargetTeam.FRIENDLY}
    GetAuraSearchType() {return UnitTargetType.BASIC}
    GetModifierAura() {return this.modifier_aura_buff}
}
