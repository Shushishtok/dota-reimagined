import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_spin_web_aura";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_talent_4_debuff";
import "../../../modifiers/heroes/broodmother/modifier_reimagined_broodmother_talent_4_immunity";
import { BroodmotherTalents } from "./reimagined_broodmother_talents";

@registerAbility()
export class reimagined_broodmother_spin_web extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Broodmother.SpinWebCast";
    unit_web: string = "npc_dota_broodmother_web";
    webs_array: CDOTA_BaseNPC[] = [];
    modifier_web_aura: string = "modifier_reimagined_broodmother_spin_web_aura";
    particle_web: string = "particles/units/heroes/hero_broodmother/broodmother_spin_web_cast.vpcf";
    particle_web_fx?: ParticleID;
    has_scepter: boolean = false;

    // Ability specials
    radius?: number;
    count?: number;
    count_scepter?: number;

    // Reimagined talent properties
    modifier_talent_4_debuff: string = "modifier_reimagined_broodmother_talent_4_debuff";
    modifier_talent_4_immunity: string = "modifier_reimagined_broodmother_talent_4_immunity";

    // Reimagined talent specials
    talent_4_bound_duration?: number;
    talent_4_trigger_immunity_duration?: number;

    GetIntrinsicModifierName(): string
    {
        return GenericModifier.CHARGES;
    }

    OnInventoryContentsChanged()
    {
        if (!IsServer()) return;

        if (this.caster.HasScepter() && !this.has_scepter)
        {
            // Set the scepter flag
            this.has_scepter = true;
            const modifier = util.GetChargeModifierForAbility(this);
            if (modifier)
            {
                modifier.OnCasterEquippedScepter();
            }
        }
        else if (!this.caster.HasScepter() && this.has_scepter)
        {
            // Set the scepter flag
            this.has_scepter = false;
            const modifier = util.GetChargeModifierForAbility(this);
            if (modifier)
            {
                modifier.OnCasterUnequippedScepter();
            }
        }
    }

    OnUpgrade(): void
    {
        // Find the difference between current level and previous level, if any
        if (this.GetLevel() > 1)
        {
            let bonus_charges = 0;
            if (this.caster.HasScepter())
            {
                bonus_charges = this.GetSpecialValueFor("max_charges_scepter") - this.GetLevelSpecialValueFor("max_charges_scepter", this.GetLevel() -2);
            }
            else
            {
                bonus_charges = this.GetSpecialValueFor("max_charges") - this.GetLevelSpecialValueFor("max_charges", this.GetLevel() - 2);
            }

            // Grant bonus charges
            const charge_modifier = util.GetChargeModifierForAbility(this)
            if (charge_modifier)
            {
                charge_modifier.OnRefresh({bonus_charges: bonus_charges});
            }
        }
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC): number
    {
        if (!IsServer()) return super.GetCastRange(location, target);

        // Can cast anywhere that touches the web
        if (util.IsNearEntity(this.unit_web, location, this.GetSpecialValueFor("radius") * 2, this.caster))
        {
            return 25000;
        }

        return super.GetCastRange(location, target);
    }

    GetAOERadius(): number
    {
        return this.GetSpecialValueFor("radius");
    }

    GetCooldown(level: number): number
    {
        if (!IsServer()) return super.GetCooldown(level);
        else return 0;
    }

    OnSpellStart(): void
    {
        // Ability properties
        const target_point: Vector = this.GetCursorPosition();

        // Ability specials
        this.count = this.GetSpecialValueFor("count");
        this.count_scepter = this.GetSpecialValueFor("count_scepter");
        this.radius = this.GetSpecialValueFor("radius");

        // Play sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Play web particle
        this.particle_web_fx = ParticleManager.CreateParticle(this.particle_web, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);
        ParticleManager.SetParticleControl(this.particle_web_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_web_fx, 1, target_point);
        ParticleManager.SetParticleControl(this.particle_web_fx, 2, Vector(this.radius, this.radius, this.radius));
        ParticleManager.SetParticleControl(this.particle_web_fx, 3, target_point);
        ParticleManager.ReleaseParticleIndex(this.particle_web_fx);

        // Create a new web in position
        CreateUnitByNameAsync(this.unit_web, target_point, false, this.caster, this.caster, this.caster.GetTeamNumber(), (web: CDOTA_BaseNPC) =>
        {
            // Set the web to the user
            web.SetOwner(this.caster);
            web.SetControllableByPlayer((this.caster as CDOTA_BaseNPC_Hero).GetPlayerID(), true);

            // Set level of all web abilities at 1
            for (let index = 0; index < web.GetAbilityCount(); index++)
            {
                const ability = web.GetAbilityByIndex(index);
                if (ability)
                {
                    ability.SetLevel(1);
                }
            }

            // Give the web the aura modifiers
            web.AddNewModifier(this.caster, this, this.modifier_web_aura, {});

            // Insert into web array
            this.webs_array.push(web);

            // Determine the max webs possible, taking the scepter into account
            let max_webs;
            if (this.caster.HasScepter()) max_webs = this.count_scepter!
            else max_webs = this.count!;

            // Check if the web now has too many elements: remove the first element from it
            if (this.webs_array.length > max_webs)
            {
                const removed_web = this.webs_array.shift()!;
                removed_web.ForceKill(false);
                removed_web.RemoveModifierByName(this.modifier_web_aura);
            }
        });

        // Talent: Silken Bind: Casting Spin Web in radius of an enemy unit causes it to become rooted and disarmed for x seconds. Each enemy can only be afflicted by this effect once every y seconds.
        this.ReimaginedTalentSilkenBind(target_point);
    }

    ReimaginedTalentSilkenBind(target_point: Vector)
    {
        if (util.HasTalent(this.caster, BroodmotherTalents.BroodmotherTalent_4))
        {
            // Initialize variables
            if (!this.talent_4_bound_duration) this.talent_4_bound_duration = util.GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_4, "bound_duration");
            if (!this.talent_4_trigger_immunity_duration) this.talent_4_trigger_immunity_duration = util.GetTalentSpecialValueFor(this.caster, BroodmotherTalents.BroodmotherTalent_4, "trigger_immunity_duration");

            // Find all enemies in the radius of the ability
            let enemies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                              target_point,
                                              undefined,
                                              this.radius!,
                                              UnitTargetTeam.ENEMY,
                                              UnitTargetType.HERO + UnitTargetType.BASIC,
                                              UnitTargetFlags.NONE,
                                              FindOrder.ANY,
                                              false);

            // Filter enemies in the list to only include enemies that don't have the immunity modifier
            enemies = enemies.filter(enemy => !enemy.HasModifier(this.modifier_talent_4_immunity))

            // Apply the debuff and the immunity for the remaining enemies
            for (const enemy of enemies)
            {
                enemy.AddNewModifier(this.caster, this, this.modifier_talent_4_debuff, {duration: this.talent_4_bound_duration});
                enemy.AddNewModifier(this.caster, this, this.modifier_talent_4_immunity, {duration: this.talent_4_trigger_immunity_duration});
            }
        }
    }
}
