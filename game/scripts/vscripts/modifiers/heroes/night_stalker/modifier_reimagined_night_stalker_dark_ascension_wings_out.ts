import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_night_stalker_dark_ascension_active } from "./modifier_reimagined_night_stalker_dark_ascension_active";
import { modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night } from "./modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night"
import { modifier_reimagined_night_stalker_hunter_in_the_night_passive } from "./modifier_reimagined_night_stalker_hunter_in_the_night_passive";

@registerModifier()
export class modifier_reimagined_night_stalker_dark_ascension_wings_out extends BaseModifier
{
    // Modifier properties
    caster?: CDOTA_BaseNPC;
    ability?: CDOTABaseAbility; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    bonus_damage?: number
    wings_out_stack_threshold?: number;
    wings_out_damage_pct?: number;

    IsHidden(): boolean
    {
        // We return the opposite as we want to show (not hide) when it should be active.
        if (this.ShouldModifierBeActive())
        {
            return false;
        }
        
        return true;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier properties
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();

        // Modifier specials
        this.bonus_damage = this.ability!.GetSpecialValueFor("bonus_damage");
        this.wings_out_stack_threshold = this.ability!.GetSpecialValueFor("wings_out_stack_threshold");
        this.wings_out_damage_pct = this.ability!.GetSpecialValueFor("wings_out_damage_pct");
        
        if (IsServer()) this.StartIntervalThink(FrameTime());
    }

    OnIntervalThink()
    {
        if (this.ShouldModifierBeActive())
        {
            // Unobstructed vision
            AddFOWViewer(this.parent.GetTeamNumber(), this.parent.GetAbsOrigin(), this.parent.GetCurrentVisionRange(), FrameTime(), false);
        }
    }

    OnRefresh(): void
    {
        this.OnCreated();
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.PREATTACK_BONUS_DAMAGE,
                ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS]
    } 

    CheckState(): Partial<Record<ModifierState, boolean>>
    {               
        return {[ModifierState.FLYING]: this.ShouldModifierBeActive()}
    }

    GetPriority(): ModifierPriority
    {
        return ModifierPriority.LOW;
    }

    GetModifierPreAttack_BonusDamage(): number
    {
        if (this.ShouldModifierBeActive())
        {
            return this.bonus_damage! * this.wings_out_damage_pct! * 0.01;
        }
        
        return 0;
    }

    GetActivityTranslationModifiers(): string
    {
        if (this.ShouldModifierBeActive())
        {
            return "hunter_night";
        }

        //@ts-ignore
        return;
    }

    ShouldModifierBeActive(): boolean
    {
        // Modifier is inactive and hidden when the parent has the active component
        if (this.parent.HasModifier(modifier_reimagined_night_stalker_dark_ascension_active.name))
        {
            return false;
        }

        // Check if this is currently day (e.g. Phoenix's Supernova; return false if this is the case
        if (this.parent.HasModifier(modifier_reimagined_night_stalker_hunter_in_the_night_passive.name))
        {
            if (this.parent.GetModifierStackCount(modifier_reimagined_night_stalker_hunter_in_the_night_passive.name, this.parent) == 0)
            {
                return false;
            }
        }

        // Modifier is active and and is shown when the parent has more than the threshold for Dead of Night stacks
        if (this.wings_out_stack_threshold && this.parent.GetModifierStackCount(modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night.name, this.parent) >= this.wings_out_stack_threshold)
        {
            return true;
        }
        else // Otherwise, it should not trigger and be hidden.
        {
            return false;
        }
    }
}