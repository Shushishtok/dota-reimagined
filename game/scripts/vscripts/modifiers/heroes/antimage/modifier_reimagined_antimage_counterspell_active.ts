import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import * as util from "../../../lib/util";
import { modifier_reimagined_antimage_counterspell_passive } from "./modifier_reimagined_antimage_counterspell_passive";
import { modifier_reimagined_antimage_mana_convergence_debuff } from "./modifier_reimagined_antimage_mana_convergence_debuff";

@registerModifier()
export class modifier_reimagined_antimage_counterspell_active extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_reflect: string = "Hero_Antimage.Counterspell.Target";
    particle_shield: string = "particles/units/heroes/hero_antimage/antimage_counter.vpcf";
    particle_shield_fx?: ParticleID;
    particle_absorb: string = "particles/units/heroes/hero_antimage/antimage_spellshield.vpcf";
    particle_absorb_fx?: ParticleID;

    // Reimagined specials
    magic_ends_mana_burn?: number;
    anti_magic_duration_inc?: number;
    instinctive_counter_trigger_multiplier?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Reimagined specials
        this.magic_ends_mana_burn = this.ability?.GetSpecialValueFor("magic_ends_mana_burn");
        this.anti_magic_duration_inc = this.ability?.GetSpecialValueFor("anti_magic_duration_inc");
        this.instinctive_counter_trigger_multiplier = this.ability?.GetSpecialValueFor("instinctive_counter_trigger_multiplier");

        // Play particle
        this.particle_shield_fx = ParticleManager.CreateParticle(this.particle_shield, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_shield_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle_shield_fx, 1, Vector(150, 150, 150));
        this.AddParticle(this.particle_shield_fx, false, false, -1, false, false);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ABSORB_SPELL,
                ModifierFunction.REFLECT_SPELL]
    }

    
    GetAbsorbSpell(event: ModifierAbilityEvent): 0 | 1
    {
        if (!IsServer()) return 0;

        // Do not absorb allies' spells
        if (event.ability.GetCaster().GetTeamNumber() == this.parent.GetTeamNumber()) return 0;

        // Play absorb effect
        this.particle_absorb_fx = ParticleManager.CreateParticle(this.particle_absorb, ParticleAttachment.CUSTOMORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControlEnt(this.particle_absorb_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", this.parent.GetAbsOrigin(), true);
        ParticleManager.ReleaseParticleIndex(this.particle_absorb_fx);

        return 1;
    }

    GetReflectSpell(event: ModifierAbilityEvent): 0 | 1
    {
        if (!IsServer()) return 0;

        // List of unreflectable abilities
        const exceptionAbilities: String[] = 
        ["rubick_spell_steal",
         "dark_seer_ion_shell",
         "morphling_morph",
         "grimstroke_soul_chain",
         "spectre_spectral_dagger",
         "item_solar_crest",
         "item_urn_of_shadows",
         "item_medallion_of_courage",
         "item_spirit_vessel"]

        const original_caster = event.ability.GetCaster();
        
        // Do not reflect towards allies
        if (original_caster.GetTeamNumber() == this.parent.GetTeamNumber()) return 0;

        // Do not reflect back at reflectors to prevent infinite loops
        if (original_caster.HasModifier("modifier_item_lotus_orb_active") || original_caster.HasModifier(this.GetName()) || original_caster.HasModifier("modifier_mirror_shield_delay")) return 0;

        // Do not reflect abilities inside the exception table
        if (exceptionAbilities.includes(event.ability.GetAbilityName())) return 0;

        // Do not reflect abilities that have the reflect tag 
        if (util.IsReflectedAbility(event.ability)) return 0;
        
        // If the parent already knows the ability, reference it, otherwise add it
        let reflected_ability_handle;
        if (this.parent.HasAbility(event.ability.GetAbilityName()))
        {
            reflected_ability_handle = this.parent.FindAbilityByName(event.ability.GetAbilityName())
        }
        else
        {
            reflected_ability_handle = this.parent.AddAbility(event.ability.GetAbilityName());

            // Set properties of the new ability
            reflected_ability_handle!.SetStolen(true);
            reflected_ability_handle!.SetHidden(true);            
            util.MakeReflectAbility(reflected_ability_handle)

            reflected_ability_handle.SetRefCountsModifiers(true);
        }

        // Update level to match the original's
        reflected_ability_handle!.SetLevel(event.ability.GetLevel());
        
        // Set cursor on original target and cast the ability
        this.parent.SetCursorCastTarget(original_caster);
        reflected_ability_handle!.OnSpellStart();

        // Play reflect sound
        EmitSoundOn(this.sound_reflect, original_caster);

        // Remove channeling effects
        if (reflected_ability_handle!.OnChannelFinish!)
        {
            reflected_ability_handle!.OnChannelFinish(false);
        }

        // Add ability to the reflected table on the passive modifier
        if (this.parent.HasModifier(modifier_reimagined_antimage_counterspell_passive.name))
        {
            const passive_modifier = this.parent.FindModifierByName(modifier_reimagined_antimage_counterspell_passive.name);
            if (passive_modifier)
            {
                ((passive_modifier) as modifier_reimagined_antimage_counterspell_passive).reflected_abilities!.push(reflected_ability_handle!);
            }
        }

        // Reimagined: The Magic Ends Here: Burns a flat amount of mana of the original casters of reflected spells.
        this.ReimaginedTheMagicEndsHere(original_caster);

        // Reimagined: Anti Magic Shell: Increases Counterspell's current duration by x seconds for every spell reflected.
        this.ReimaginedAntiMagicShell();

        return 1;
    }

    ReimaginedTheMagicEndsHere(original_caster: CDOTA_BaseNPC): void
    {
        original_caster.ReduceMana(this.magic_ends_mana_burn!);
    }

    ReimaginedAntiMagicShell(): void
    {
        this.SetDuration(this.GetRemainingTime() + this.anti_magic_duration_inc!, true);
    }
}