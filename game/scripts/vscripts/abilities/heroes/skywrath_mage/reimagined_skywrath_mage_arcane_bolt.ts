import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt";
import { modifier_reimagined_skywrath_mage_arcane_bolt_wrath } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_arcane_bolt_wrath";
import { modifier_reimagined_skywrath_mage_talent_1_buff } from "../../../modifiers/heroes/skywrath_mage/modifier_reimagined_skywrath_mage_talent_1_buff"
import { SkywrathMageTalents } from "./reimagined_skywrath_mage_talents";

@registerAbility()
export class reimagined_skywrath_mage_arcane_bolt extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_SkywrathMage.ArcaneBolt.Cast";
    sound_impact: string = "Hero_SkywrathMage.ArcaneBolt.Impact";
    responses: string[] = ["skywrath_mage_drag_arcanebolt_02", "skywrath_mage_drag_arcanebolt_03"];
    response_rare: string = "skywrath_mage_drag_arcanebolt_01";
    projectile_arcane_bolt: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf";    
    projectile_wrath_bolt: string = "particles/heroes/skywrath_mage/wrath_bolt.vpcf";

    // Ability specials
    bolt_speed?: number;
    bolt_vision?: number;
    bolt_damage?: number;
    int_multiplier?: number;
    vision_duration?: number;
    scepter_radius?: number;

    // Reimagined specials
    arcane_infusion_speed_per_int?: number;
    wrath_arcane_bolt_casts?: number;
    wrath_bolt_speed_multiplier?: number;
    wrath_int_calculate_range?: number;
    wrath_caster_calculations?: number;
    wrath_duration?: number;
    blank_bolt_duration?: number;
    blank_bolt_damage_pct?: number;

    Precache(context: CScriptPrecacheContext)
    {
        PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/skywrath_mage/wrath_bolt.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/skywrath_mage/blank_bolt.vpcf", context);
        PrecacheResource(PrecacheType.PARTICLE, "particles/heroes/skywrath_mage/blank_bolt_endcap.vpcf", context);        
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target = this.GetCursorTarget()!;

        // Ability specials
        this.bolt_speed = this.GetSpecialValueFor("bolt_speed")
        this.bolt_vision = this.GetSpecialValueFor("bolt_vision")
        this.bolt_damage = this.GetSpecialValueFor("bolt_damage")
        this.int_multiplier = this.GetSpecialValueFor("int_multiplier")
        this.vision_duration = this.GetSpecialValueFor("vision_duration")
        this.scepter_radius = this.GetSpecialValueFor("scepter_radius")

        // Reimagined specials
        this.arcane_infusion_speed_per_int = this.GetSpecialValueFor("arcane_infusion_speed_per_int")
        this.wrath_arcane_bolt_casts = this.GetSpecialValueFor("wrath_arcane_bolt_casts")
        this.wrath_bolt_speed_multiplier = this.GetSpecialValueFor("wrath_bolt_speed_multiplier")
        this.wrath_int_calculate_range = this.GetSpecialValueFor("wrath_int_calculate_range")
        this.wrath_caster_calculations = this.GetSpecialValueFor("wrath_caster_calculations")
        this.wrath_duration = this.GetSpecialValueFor("wrath_duration")
        this.blank_bolt_duration = this.GetSpecialValueFor("blank_bolt_duration")
        this.blank_bolt_damage_pct = this.GetSpecialValueFor("blank_bolt_damage_pct");

        // Roll for rare response sound
        if (RollPercentage(5))
        {
            EmitSoundOn(this.response_rare, this.caster);   
        }
        // If not, roll for standard response sound
        else if (RollPercentage(25))
        {
            EmitSoundOn(this.responses[RandomInt(0, this.responses.length - 1)], this.caster);
        }

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Talent: Unending Proficiency: Casting Arcane Bolt increases your intelligence by x for y seconds. Has independent stacks.
        if (HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_1))
        {
            const talent_1_duration = GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_1, "duration");

            if (!this.caster.HasModifier(modifier_reimagined_skywrath_mage_talent_1_buff.name))
            {
                this.caster.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_talent_1_buff.name, {duration: talent_1_duration});
            }

            const talent_1_modifier = this.caster.FindModifierByName(modifier_reimagined_skywrath_mage_talent_1_buff.name);
            if (talent_1_modifier)
            {
                talent_1_modifier.IncrementStackCount();
            }
        }
        
        // Reimagined: Wrath of Dragonus: After Skywrath casts x Arcane Bolts, the next Arcane Bolt will become a Wrath Bolt. Wrath Bolts are twice as fast, the damage includes the intelligence of all nearby allied heroes in 1200 range, and the caster's intelligence is calculated twice. Wrath Bolts are also duplicated by Aghanim's Scepter upgrade. The counter modifier lasts y seconds and refreshes itself when casting Arcane Bolt.
        const wrath_bolt = this.ReimaginedWrathOfDragonusCounter();

        // Fire tracking projectile at target
        this.LaunchArcaneBolt(target, wrath_bolt);

        // Scepter effect: Arcane Bolt is launched at a secondary enemy unit, heroes prioritzed
        if (this.caster.HasScepter())
        {            
            // Look for heroes only around the target
            const enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                              target.GetAbsOrigin(),
                                              undefined,
                                              this.scepter_radius,
                                              UnitTargetTeam.ENEMY,
                                              UnitTargetType.HERO,
                                              UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NO_INVIS + UnitTargetFlags.NOT_CREEP_HERO + UnitTargetFlags.FOW_VISIBLE,
                                              FindOrder.ANY,
                                              false);

            // Fire Arcane Bolt at random hero
            if (enemies && enemies.length > 0)
            {
                for (const enemy of enemies)
                {
                    // Ignore main target
                    if (enemy == target) continue;    

                    this.LaunchArcaneBolt(enemy, wrath_bolt);
                    return;
                }
            }
            
            // If no heroes were found, look for creeps and creep heroes
            const creeps = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                            target.GetAbsOrigin(),
                                            undefined,
                                            this.scepter_radius,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.BASIC,
                                            UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.NO_INVIS + UnitTargetFlags.FOW_VISIBLE,
                                            FindOrder.ANY,
                                            false);
            
            // Fire Arcane Bolt at random creep
            if (creeps && creeps.length > 0)
            {
                for (const creep of creeps)
                {
                    // Ignore main target
                    if (creep == target) continue;
                    
                    this.LaunchArcaneBolt(creep, wrath_bolt);
                    return;
                }
            }
        }
    }

    LaunchArcaneBolt(target: CDOTA_BaseNPC, wrath_bolt: boolean): void
    {
        // Calculate intelligence of the caster
        let damage = this.bolt_damage! + (this.caster as CDOTA_BaseNPC_Hero).GetIntellect() * this.int_multiplier!;

        // Reimagined: Arcane Infusion: Grants bonus x projectile speed for each point of intelligence Skywrath has when casting Arcane Bolt.
        let bolt_speed = this.bolt_speed!;
        bolt_speed += this.ReimaginedArcaneInfusion();

        let projectile = this.projectile_arcane_bolt;
        // Reimagined: Wrath of Dragonus: After Skywrath casts x Arcane Bolts, the next Arcane Bolt will become a Wrath Bolt. Wrath Bolts are twice as fast, the damage includes the intelligence of all nearby allied heroes in 1200 range, and the caster's intelligence is calculated twice. Wrath Bolts are also duplicated by Aghanim's Scepter upgrade. The counter modifier lasts y seconds and refreshes itself when casting Arcane Bolt.
        if (wrath_bolt)
        {
            const wrath_data = this.ReimaginedWrathOfDragonus(bolt_speed, target);
            if (wrath_data)
            {
                damage = wrath_data.damage;
                bolt_speed = wrath_data.speed;
            }
            
            projectile = this.projectile_wrath_bolt;
        }

        // Fire tracking projectile
        ProjectileManager.CreateTrackingProjectile(
        {                
            Ability: this,
            EffectName: projectile,
            ExtraData: {damage: damage},
            Source: this.caster,
            Target: target,
            bDodgeable: false,
            bDrawsOnMinimap: false,
            bIsAttack: false,
            bProvidesVision: true,
            bReplaceExisting: false,
            bVisibleToEnemies: true,
            iMoveSpeed: bolt_speed,            
            iVisionRadius: this.bolt_vision,
            iVisionTeamNumber: this.caster.GetTeamNumber(),
            vSourceLoc: this.caster.GetAbsOrigin(),            
        });
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: {damage: number})
    {
        // If there was no target, do nothing
        if (!target) return;

        // If the target is magic immune, do nothing
        if (target.IsMagicImmune())
        {
            // Reimagined: Blank Bolt: Arcane Bolt can be cast on spell immune enemies. When the projectile hits a spell immune enemy, it deals no damage, but instead sets a debuff that has a stack count equal to x% of the damage the unit would've taken if it wasn't spell immune. Upon hitting with an ability that deals magic damage to the target, the debuff is consumed and the damage it had stored is dealt in an additional separate instance. Lasts y seconds. Blank Bolt can refresh itself with additional Arcane Bolt hits on a spell immune enemy, with the damage being adjusted only when the new stack has more damage than the current.
            this.ReimaginedBlankBolt(target, extraData.damage);
            return;
        }
            

        // If Linken's Sphere is triggered and absorbs, do nothing
        if (target.GetTeamNumber() != this.caster.GetTeamNumber())
        {
            if (target.TriggerSpellAbsorb(this)) return;
        }

        // Play impact sound
        EmitSoundOn(this.sound_impact, target);

        // Add a FOW viewer at target point
        AddFOWViewer(this.caster.GetTeamNumber(),
                    target.GetAbsOrigin(),
                    this.bolt_vision!,
                    this.vision_duration!,
                    false)

        // Deal damage to the target
        ApplyDamage(
        {
            attacker: this.caster,
            damage: extraData.damage,
            damage_type: this.GetAbilityDamageType(),
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE
        });
    }

    ReimaginedArcaneInfusion(): number
    {
        let bonus_speed = 0;

        // Calculate bonus projectile speed based on the caster's intelligence
        bonus_speed = (this.caster as CDOTA_BaseNPC_Hero).GetIntellect() * this.arcane_infusion_speed_per_int!;

        return bonus_speed;
    }

    ReimaginedWrathOfDragonusCounter(): boolean
    {
        let wrath_bolt = false;

        // If caster doesn't have the counter modifier, add it
        if (!this.caster.HasModifier(modifier_reimagined_skywrath_mage_arcane_bolt_wrath.name))
        {
            this.caster.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_arcane_bolt_wrath.name, {duration: this.wrath_duration});
        }

        // Get modifier handle
        const modifier_wrath = this.caster.FindModifierByName(modifier_reimagined_skywrath_mage_arcane_bolt_wrath.name);
        if (modifier_wrath)
        {
            const stack_count = modifier_wrath.GetStackCount();
            // Check stack count: if it has reached the threshold, consume it and set Wrath Bolt to true
            if (stack_count >= this.wrath_arcane_bolt_casts!)
            {
                modifier_wrath.Destroy();
                wrath_bolt = true;
            }
            else
            {
                // Otherwise, increment stack and refresh
                modifier_wrath.IncrementStackCount();
                modifier_wrath.ForceRefresh();
            }
        }

        return wrath_bolt
    }

    ReimaginedWrathOfDragonus(speed: number, target: CDOTA_BaseNPC): {damage: number, speed: number}
    {
        let damage = 0;

        // Multiply projectile speed
        speed *= this.wrath_bolt_speed_multiplier!;
        
        // Find all nearby allied heroes
        const allies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        this.caster.GetAbsOrigin(),
                                        undefined,
                                        this.wrath_int_calculate_range!,
                                        UnitTargetTeam.FRIENDLY,
                                        UnitTargetType.HERO,
                                        UnitTargetFlags.NOT_ILLUSIONS + UnitTargetFlags.NOT_CREEP_HERO,
                                        FindOrder.ANY,
                                        false);

        // Sum intelligence except for caster
        for (const ally of allies)
        {
            // Ignore caster
            if (ally == this.caster) continue;
            
            damage += (ally as CDOTA_BaseNPC_Hero).GetIntellect();
        }

        // Calculate caster's intelligence based on the calculation multiplier
        damage += (this.caster as CDOTA_BaseNPC_Hero).GetIntellect() * this.int_multiplier! * this.wrath_caster_calculations!;

        // Add the base damage on top
        damage += this.bolt_damage!;

        // Talent: Wrathful Incantation: Wrath Bolts also calculate the target's main attribute as damage.
        if (HasTalent(this.caster, SkywrathMageTalents.SkywrathMageTalent_2))
        {
            damage += (target as CDOTA_BaseNPC_Hero).GetPrimaryStatValue();
        }

        // Return damage and speed
        return {damage, speed}
    }

    ReimaginedBlankBolt(target: CDOTA_BaseNPC, damage: number): void
    {
        // If the target doesn't have the Blank Bolt modifier, add it        
        if (!target.HasModifier(modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt.name))
        {
            target.AddNewModifier(this.caster, this, modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt.name, {duration: this.blank_bolt_duration!});
        }

        // Get the modifier's handle
        const modifier_blank_bolt = target.FindModifierByName(modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt.name);
        if (modifier_blank_bolt)
        {
            // Calculate stacks that need to be set
            const stacks = damage * this.blank_bolt_damage_pct! * 0.01;

            // Get current stack count of the modifier
            const current_stacks = modifier_blank_bolt.GetStackCount();
    
            // If the stacks to set is higher than the current stack count, set it
            if (stacks > current_stacks)
            {
                modifier_blank_bolt.SetStackCount(stacks);
            }
    
            // Refresh modifier
            modifier_blank_bolt.ForceRefresh();
        }
    }
}