import { SvenTalents } from "../../../abilities/heroes/sven/reimagined_sven_talents";
import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import { HasTalent } from "../../../lib/util";
import { modifier_reimagined_sven_gods_strength_buff_fish_counter } from "./modifier_reimagined_sven_gods_strength_buff_fish_counter"

@registerModifier()
export class modifier_reimagined_sven_gods_strength extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff: string = "particles/units/heroes/hero_sven/sven_spell_gods_strength_ambient.vpcf";
    particle_buff_fx?: ParticleID;
    hero_effect: string = "particles/units/heroes/hero_sven/sven_gods_strength_hero_effect.vpcf";
    status_effect: string = "particles/status_fx/status_effect_gods_strength.vpcf";
    rough_knight_bonus_pct: number = 0;
    lock: boolean = false;    

    // Modifier specials
    gods_strength_damage?: number;

    // Reimagined specials
    shattering_strength_str_bonus_pct?: number;
    buff_fish_bonus_damage_pct?: number;
    buff_fish_cooldown?: number;
    rough_knight_unit_kill_damage_bonus?: number;    
    rough_knight_hero_kill_damage_bonus?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.gods_strength_damage = this.ability.GetSpecialValueFor("gods_strength_damage");

        // Reimagined specials
        this.shattering_strength_str_bonus_pct = this.ability.GetSpecialValueFor("shattering_strength_str_bonus_pct");
        this.buff_fish_bonus_damage_pct = this.ability.GetSpecialValueFor("buff_fish_bonus_damage_pct");
        this.buff_fish_cooldown = this.ability.GetSpecialValueFor("buff_fish_cooldown");
        this.rough_knight_unit_kill_damage_bonus = this.ability.GetSpecialValueFor("rough_knight_unit_kill_damage_bonus");
        this.rough_knight_hero_kill_damage_bonus = this.ability.GetSpecialValueFor("rough_knight_hero_kill_damage_bonus");

        this.particle_buff_fx = ParticleManager.CreateParticle(this.particle_buff, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControlEnt(this.particle_buff_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, "attach_weapon", this.parent.GetAbsOrigin(), true);
        ParticleManager.SetParticleControlEnt(this.particle_buff_fx, 2, this.parent, ParticleAttachment.POINT_FOLLOW, "attach_head" , this.parent.GetAbsOrigin(), true);
        this.AddParticle(this.particle_buff_fx, false, false, -1, false, true);

        if (IsServer()) this.StartIntervalThink(0.1);
    }

    OnIntervalThink()
    {
        (this.parent as CDOTA_BaseNPC_Hero).CalculateStatBonus();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
                ModifierFunction.STATS_STRENGTH_BONUS, // Reimagined: Shattered Strength                
                ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL, // Reimagined: Buff Fish
                ModifierFunction.ON_DEATH, // Reimagined: Rough Knight
                ModifierFunction.TOOLTIP,
                ModifierFunction.TOOLTIP2,
                ModifierFunction.TRANSLATE_ATTACK_SOUND
            ];
    }

    OnTooltip(): number
    {
        return this.buff_fish_bonus_damage_pct!;
    }

    OnTooltip2(): number
    {
        return this.buff_fish_cooldown!;
    }

    GetModifierBaseDamageOutgoing_Percentage(): number
    {
        // Rogue Knight: Killing an enemy unit while in God's Strength improves the bonus damage percentage by a small amount. Heroes increase the bonus further.
        let gods_strength_damage = this.gods_strength_damage!;
        gods_strength_damage = this.ReimaginationRoughKnight(gods_strength_damage)

        return gods_strength_damage;
    }

    GetModifierBonusStats_Strength(): number
    {
        // Check for locked behavior for infinite responses
        if (this.lock) return 0;
        
        // Apply lock
        this.lock = true;

        // Get current strength value, without this bonus (as it's locked)
        const strength = (this.parent as CDOTA_BaseNPC_Hero).GetStrength();
        
        // Release lock
        this.lock = false;
        
        // Calculate strength bonus
        const strength_bonus = strength * this.shattering_strength_str_bonus_pct! * 0.01;

        // Return strength bonus
        return strength_bonus;
    }

    GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number
    {        
        return this.ReimaginedBuffFish(event);
    }

    OnDeath(event: ModifierAttackEvent): void
    {     
        // Only apply if the killer is the parent
        if (this.parent != event.attacker) return;

        // Does not apply on allies
        if (event.unit?.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Does not apply if the target is a building or a ward
        if (event.unit!.IsOther() || event.unit!.IsBuilding()) return;

        // Does not apply on illusions
        if (event.unit!.IsIllusion()) return;

        // Does not apply on tempest doubles or clones
        if (event.unit!.IsTempestDouble() || event.unit!.IsClone()) return;

        // Increase appropriately for real heroes or creeps        
        if (event.unit!.IsRealHero())
        {            
            this.rough_knight_bonus_pct += this.rough_knight_hero_kill_damage_bonus!;            
        }       
        else
        {            
            this.rough_knight_bonus_pct += this.rough_knight_unit_kill_damage_bonus!;            
        }

        // Set stack count
        this.SetStackCount(this.rough_knight_bonus_pct);
    }

    ReimaginationRoughKnight(gods_strength_damage: number): number
    {
        // Calculate and return the bonus
        const actual_bonus = gods_strength_damage + this.GetStackCount()!;
        return actual_bonus;
    }    

    GetAttackSound(): string
    {
        return "Hero_Sven.GodsStrength.Attack";
    }

    GetHeroEffectName(): string
    {
        return this.hero_effect;
    }

    HeroEffectPriority(): number
    {
        return 10;
    }

    GetStatusEffectName(): string
    {
        return this.status_effect;
    }

    StatusEffectPriority(): number
    {
        return 10;
    }

    OnDestroy(): void
    {        
        if (IsServer())
        {
            // Buff Fish is handled by the talent if taken
            if (!HasTalent(this.caster, SvenTalents.SvenTalent_7))
            {
                if (this.parent.HasModifier(modifier_reimagined_sven_gods_strength_buff_fish_counter.name))
                {
                    this.parent.RemoveModifierByName(modifier_reimagined_sven_gods_strength_buff_fish_counter.name);
                }
            }
        }
    }



    ReimaginedBuffFish(event: ModifierAttackEvent): number
    {
        // Talent: Bodybuilder Fish: God's Strength's Buff Fish effect becomes permanent.
        // Check if permanent Buff Fish is applied; if so, it's handled in the talent
        if (HasTalent(this.caster, SvenTalents.SvenTalent_7)) return 0;
        
        // Check if Buff Fish is ready to be applied        
        if (!this.parent.HasModifier(modifier_reimagined_sven_gods_strength_buff_fish_counter.name))
        {            
            // Set buff fish cooldown modifier
            this.parent.AddNewModifier(this.caster, this.ability, modifier_reimagined_sven_gods_strength_buff_fish_counter.name, {duration: this.buff_fish_cooldown!});
            
            const parentdamage = this.parent.GetAverageTrueAttackDamage(event.target);
            const damage = parentdamage * this.buff_fish_bonus_damage_pct! * 0.01;            

            SendOverheadEventMessage(undefined, OverheadAlert.DAMAGE, event.target, damage + parentdamage, undefined);
            return damage;
        }
        else
        {            
            return 0;
        }
    }
}