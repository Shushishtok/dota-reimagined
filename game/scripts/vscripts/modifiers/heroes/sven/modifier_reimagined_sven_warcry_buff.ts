import { SvenTalents } from "../../../abilities/heroes/sven/reimagined_sven_talents";
import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";
import { modifier_reimagined_sven_gods_strength } from "./modifier_reimagined_sven_gods_strength";


@registerModifier()
export class modifier_reimagined_sven_warcry_buff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    gods_strength_active: boolean = false;    
    particle_buff: string = "particles/units/heroes/hero_sven/sven_warcry_buff.vpcf";
    particle_buff_fx?: ParticleID;
    particle_shield: string = "particles/heroes/sven/warcry_shield.vpcf";
    particle_shield_fx?: ParticleID;

    // Modifier specials
    movespeed?: number;
    bonus_armor?: number;    

    // Reimagined specials
    power_overwhelming_damage_pct?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return true}

    OnCreated(keys: {shield_stacks: number}): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.movespeed = this.ability.GetSpecialValueFor("movespeed");
        this.bonus_armor = this.ability.GetSpecialValueFor("bonus_armor");        

        // Reimagined specials
        this.power_overwhelming_damage_pct = this.ability.GetSpecialValueFor("power_overwhelming_damage_pct");

        // Play particle buff effect        
        this.particle_buff_fx = ParticleManager.CreateParticle(this.particle_buff, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);                
		ParticleManager.SetParticleControlEnt(this.particle_buff_fx, 1, this.parent, ParticleAttachment.OVERHEAD_FOLLOW, undefined, this.parent.GetAbsOrigin(), true);
        this.AddParticle(this.particle_buff_fx, false, false, -1, false, true);
        
        // Reimagined triggers
        if (IsServer()) this.ReimaginedHeartOfValor(keys.shield_stacks);            
        this.ReimaginedPowerOverWhelming(true);        
    }

    OnIntervalThink()
    {
        this.ReimaginedPowerOverWhelming(false);
    }

    ReimaginedHeartOfValor(shield_stacks: number)
    {
        // Set the amount of shield stacks as modifier stacks
        if (shield_stacks)
        {
            this.SetStackCount(shield_stacks);

            // Apply the shield particle
            this.particle_shield_fx = ParticleManager.CreateParticle(this.particle_shield, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
            ParticleManager.SetParticleControl(this.particle_shield_fx, 0, this.parent.GetAbsOrigin());
        }
    }

    ReimaginedPowerOverWhelming(first_time: boolean)
    {
        if (first_time)
        {            
            this.StartIntervalThink(0.1);
        }
        
        // Check if the caster has God's Strength active or not
        if (this.caster!.HasModifier(modifier_reimagined_sven_gods_strength.name))
        {
            this.gods_strength_active = true;
        }
        else
        {            
            this.gods_strength_active = false;
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.PHYSICAL_ARMOR_BONUS,
                ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,                    
                ModifierFunction.TOTAL_CONSTANT_BLOCK, // Reimagined: Heart of Valor:
                ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE, // Reimagined: Power Overwhelming
                ModifierFunction.TOOLTIP,
                ModifierFunction.TOOLTIP2,
                ModifierFunction.STATS_STRENGTH_BONUS // Talent: Rallying Cry of Strength
            ]; 
    }    

    OnTooltip(): number
    {
        return this.GetStackCount();
    }

    OnTooltip2(): number
    {
        return this.power_overwhelming_damage_pct!;
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.movespeed!;
    }

    GetModifierPhysicalArmorBonus(): number
    {
        return this.bonus_armor!;
    }

    GetActivityTranslationModifiers(): string | void
    {
        if (this.parent.GetName() == "npc_dota_hero_sven")
        {
            return "sven_warcry";            
        }
        
        return;
    }    

    GetModifierTotal_ConstantBlock(event: ModifierAttackEvent): number
    {
        if (!IsServer()) return 0;

        const stacks = this.GetStackCount();
        // Check if there are still some shield stacks left
        if (stacks > 0)
        {
            // Check how many stacks are used up to deflect the damage
            let depleted_stacks = 0;
            if (event.damage >= stacks)
            {
                // Deplete all stacks
                depleted_stacks = stacks;
                this.SetStackCount(0);

                // Remove the shield particle
                ParticleManager.DestroyParticle(this.particle_shield_fx!, false);
                ParticleManager.ReleaseParticleIndex(this.particle_shield_fx!);
                this.particle_shield_fx = undefined;
            }
            else
            {
                // Deplete stacks according to damage
                depleted_stacks = event.damage
                this.SetStackCount(this.GetStackCount() - depleted_stacks);
            }

            return depleted_stacks;
        }

        return 0;
    }

    GetModifierBaseDamageOutgoing_Percentage(): number
    {        
        // Only apply if God's Strength is active on the caster
        if (this.gods_strength_active)
        {            
            return this.power_overwhelming_damage_pct!;            
        }
        
        return 0;
    }

    GetModifierBonusStats_Strength(): number
    {
        // Talent: Rallying Cry of Strength: Power Overwhelming now also grants allies x% of Sven's current Strength. Does not include Sven himself.
        return this.ReimaginedTalentRallyingCryOfStrength();
    }

    OnDestroy()
    {
        if (this.particle_shield_fx)
        {
            ParticleManager.DestroyParticle(this.particle_shield_fx!, false);
            ParticleManager.ReleaseParticleIndex(this.particle_shield_fx!);
        }        
    }

    ReimaginedTalentRallyingCryOfStrength(): number
    {
        if (HasTalent(this.caster, SvenTalents.SvenTalent_6))
        {
            const strength_pct = GetTalentSpecialValueFor(this.caster, SvenTalents.SvenTalent_6, "strength_pct");

            // Only when God's Strength is active. Ignores the caster
            if (this.gods_strength_active && this.parent != this.caster)
            {
                return (this.caster as CDOTA_BaseNPC_Hero).GetStrength() * strength_pct * 0.01;
            }
        }

        return 0;
    }
}