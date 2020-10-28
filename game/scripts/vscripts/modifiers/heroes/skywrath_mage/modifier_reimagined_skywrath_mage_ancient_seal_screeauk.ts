import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_skywrath_mage_ancient_seal_screeauk extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_buff = "particles/heroes/skywrath_mage/ancient_seal_buff.vpcf";
    particle_buff_fx?: ParticleID;

    // Reimagined specials
    seal_screeauk_spell_amp?: number;
    seal_screeauk_radius?: number;    
    rebound_seal_search_radius?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}    

    OnCreated(): void
    {
        // Reimagined specials
        this.seal_screeauk_spell_amp = this.ability.GetSpecialValueFor("seal_screeauk_spell_amp");
        this.seal_screeauk_radius = this.ability.GetSpecialValueFor("seal_screeauk_radius");
        this.rebound_seal_search_radius = this.ability.GetSpecialValueFor("rebound_seal_search_radius");

        // Add particle
        this.particle_buff_fx = ParticleManager.CreateParticle(this.particle_buff, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_buff_fx, 0, this.parent.GetAbsOrigin());
        this.AddParticle(this.particle_buff_fx, false, false, -1, false, false);        
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.SPELL_AMPLIFY_PERCENTAGE,
                ModifierFunction.TOOLTIP]
    }

    OnTooltip()
    {
        return this.seal_screeauk_radius!;
    }

    GetModifierSpellAmplify_Percentage(): number
    {
        return this.seal_screeauk_spell_amp!;
    }

    OnDestroy()
    {
        if (!IsServer()) return;

        // Reimagined: Rebounding Seal: When the seal expires prematurely, it is applied to the closest allied in x radius around it, if any. Rebound Seals can repeat this process infinitely.
        this.ReimaginedReboundingSeal();
    }

    // If we don't do this, for some reason the aura modifier will stay up even if you die. Why? I don't know.
    IsAura() {if (this.parent.IsAlive()) return true;
              else return false;}
    GetAuraDuration() {return 0.5;}
    GetAuraRadius() {return this.seal_screeauk_radius!;}
    GetAuraSearchFlags() {return UnitTargetFlags.NONE;}
    GetAuraSearchTeam() {return UnitTargetTeam.ENEMY;}
    GetAuraSearchType() {return UnitTargetType.HERO + UnitTargetType.BASIC;}
    GetModifierAura() {return "modifier_reimagined_skywrath_mage_ancient_seal_debuff";}    

    ReimaginedReboundingSeal()
    {
        // Check if it was removed earlier than the intended duration, due to a purge or death        
        if (this.GetElapsedTime() < this.GetDuration() && this.GetRemainingTime() > 0)
        {
            const friendly_units = FindUnitsInRadius(this.caster.GetTeamNumber(),
                                                      this.parent.GetAbsOrigin(),
                                                      undefined,
                                                      this.rebound_seal_search_radius!,
                                                      UnitTargetTeam.FRIENDLY,
                                                      UnitTargetType.HERO + UnitTargetType.BASIC,
                                                      UnitTargetFlags.NONE,
                                                      FindOrder.CLOSEST,
                                                      false);

            for (const friendly_unit of friendly_units)
            {                
                // Ignore the parent
                if (friendly_unit == this.parent) continue;

                // Find the closest ally that doesn't have this buff already
                if (!friendly_unit.HasModifier(this.GetName()))
                {                    
                    friendly_unit.AddNewModifier(this.caster, this.ability, this.GetName(), {duration: this.GetRemainingTime()});
                    break;
                }
            }
        }
    }
}