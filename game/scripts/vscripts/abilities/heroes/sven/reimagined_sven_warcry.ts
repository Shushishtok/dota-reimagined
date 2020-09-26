import { BaseAbility , registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_sven_warcry_buff } from "../../../modifiers/heroes/sven/modifier_reimagined_sven_warcry_buff"

@registerAbility()
export class reimagined_sven_warcry extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_cast: string = "Hero_Sven.WarCry";
    cast_responses: string[] = ["sven_sven_ability_warcry_01", "sven_sven_ability_warcry_02", "sven_sven_ability_warcry_03", "sven_sven_ability_warcry_04"];
    particle_cast: string = "particles/units/heroes/hero_sven/sven_spell_warcry.vpcf";
    particle_cast_fx?: ParticleID;
    activity_modifier: string = "sven_warcry";

    // Ability specials
    duration?: number;
    radius?: number;

    // Reimagined specials
    chaaarge_duration_increase?: number;
    heart_valor_current_hp_shield_pct?: number;

    OnSpellStart(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");
        this.radius = this.GetSpecialValueFor("radius");

        // Reimagined specials
        this.chaaarge_duration_increase = this.GetSpecialValueFor("chaaarge_duration_increase");
        this.heart_valor_current_hp_shield_pct = this.GetSpecialValueFor("heart_valor_current_hp_shield_pct");
        
        // Reimagined: Chaaaaarge: Warcry's duration is increased by a few seconds for every allied hero in the radius on cast.
        let duration = this.duration;
        duration = this.ReimaginedChaaaarge()        

        // Reimagined: Heart of Valor: Grants Sven and his allies a shield that absorbs up to X% of Sven's current health. Lasts until Warcry's duration ends or the shield absorbs all the damage.
        const shield_stacks = this.ReimaginedHeartOfValor()

        // Play cast sound
        EmitSoundOn(this.sound_cast, this.caster);

        // Play a random cast response
        EmitSoundOn(this.cast_responses[RandomInt(0, this.cast_responses.length-1)], this.caster);

        // Play cast particle effect
        this.particle_cast_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.caster);	
        if (this.caster.GetName() == "npc_dota_hero_sven")
        {
            // Sven casting it gets fired up in the EYES!
            ParticleManager.SetParticleControlEnt(this.particle_cast_fx, 2, this.caster, ParticleAttachment.POINT_FOLLOW, "attach_eyes", this.caster.GetAbsOrigin(), true);
        }
        else
        {
            // Everyone else gets fired up... in their common area
            ParticleManager.SetParticleControlEnt(this.particle_cast_fx, 2, this.caster, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", this.caster.GetAbsOrigin(), true)
        }        
        ParticleManager.ReleaseParticleIndex(this.particle_cast_fx);

        // Find all nearby allies
        const allies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                        this.caster.GetAbsOrigin(),
                                        undefined,
                                        this.radius!,
                                        UnitTargetTeam.FRIENDLY,
                                        UnitTargetType.HERO,
                                        UnitTargetFlags.INVULNERABLE + UnitTargetFlags.OUT_OF_WORLD,
                                        FindOrder.ANY,
                                        false);

        for (const ally of allies)
        {
            // Grant allies the warcry modifier bonus
            ally.AddNewModifier(this.caster, this, modifier_reimagined_sven_warcry_buff.name, {duration: duration, shield_stacks: shield_stacks});
        }
    }

    ReimaginedChaaaarge(): number
    {
        let duration = this.duration!;

        // Search for nearby allies real heroes
        const allies = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                         this.caster.GetAbsOrigin(),
                                         undefined,
                                         this.radius!,
                                         UnitTargetTeam.FRIENDLY,
                                         UnitTargetType.HERO,
                                         UnitTargetFlags.INVULNERABLE + UnitTargetFlags.NOT_CREEP_HERO + UnitTargetFlags.OUT_OF_WORLD + UnitTargetFlags.NOT_ILLUSIONS,
                                         FindOrder.ANY,
                                         false);

        for (const ally of allies)
        {   
            // Do not include self
            if (ally == this.caster) continue;

            if (ally.IsTempestDouble()) continue;

            if (ally.IsClone()) continue;

            // Only real heroes, clones are not included
            if (ally.IsRealHero())            
            {                
                // Increase duration
                duration += this.chaaarge_duration_increase!;
            }            
        }                                        
            
        return duration;
    }

    ReimaginedHeartOfValor(): number
    {
        let shield_stacks;
        
        // Calculate shield stacks
        shield_stacks = this.caster.GetHealth() * this.heart_valor_current_hp_shield_pct! * 0.01;

        return shield_stacks;
    }
}