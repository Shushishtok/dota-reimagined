import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_arcane_aura_buff } from "./modifier_reimagined_crystal_maiden_arcane_aura_buff";
import { modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane } from "./modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane"
import { modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery } from "./modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery";

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_aura extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();
    radius: number = 25000;
    
    // Reimagined specials
    focused_arcane_radius?: number
    blueheart_mastery_duration?: number;    

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Reimagined specials
        this.focused_arcane_radius = this.ability!.GetSpecialValueFor("focused_arcane_radius");
        this.blueheart_mastery_duration = this.ability!.GetSpecialValueFor("blueheart_mastery_duration");
    }

    OnRefresh()
    {
        this.OnCreated();
    }

    IsAura(): boolean
    {
        // Does nothing when caster is disabled
        if (this.parent.PassivesDisabled()) {return false}

        return true;
    }

    IsAuraActiveOnDeath() {return true}    
    GetAuraDuration() {return 0.5}
    GetAuraRadius(): number
    {
        // Reimagination: Focused Arcane: Can be no-target cast to reduce the aura range from global to 1200 but also increase magical resistance and spell amp of nearby allies
        if (this.ReimaginationFocusedArcane()) {return this.focused_arcane_radius!;}        
        
        return this.radius;        
    }

    ReimaginationFocusedArcane(): boolean
    {
        if (this.parent.HasModifier(modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane.name))
        {
            return true;
        }

        return false;
    }

    GetAuraSearchFlags(): UnitTargetFlags {return UnitTargetFlags.NONE}
    GetAuraSearchTeam(): UnitTargetTeam {return UnitTargetTeam.FRIENDLY;}
    GetAuraSearchType(): UnitTargetType {return UnitTargetType.HERO + UnitTargetType.BASIC}
    GetModifierAura(): string {return modifier_reimagined_crystal_maiden_arcane_aura_buff.name;}

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_TAKEDAMAGE // Reimagined: Blueheart Mastery: Dealing damage to enemy units improves Crystal Maiden's aura's mana regeneration for each damage instance she inflicts. Stacks infinitely, independent stacks. Each stack lasts 3 seconds.
                ]
    }

    OnTakeDamage(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Does nothing if the aura is disabled
        if (this.parent.PassivesDisabled()) {return;}

        // Does nothing if the attacker is not the caster
        if (this.parent != event.attacker) {return;}

        // Does nothing if the target is an ally, building or ward
        if (this.parent.GetTeamNumber() == event.unit!.GetTeamNumber() || event.unit!.IsBuilding() || event.unit!.IsOther()) {return;}

        // Add and increment a stack for Blueheart Mastery        
        if (!this.parent.HasModifier(modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery.name))
        {
            this.parent.AddNewModifier(this.caster!, this.ability!, modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery.name, {duration: this.blueheart_mastery_duration!});
        }        

        const modifier = this.parent.FindModifierByName(modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery.name)
        if (modifier)
        {
            modifier.IncrementStackCount();            
        }
    }
}