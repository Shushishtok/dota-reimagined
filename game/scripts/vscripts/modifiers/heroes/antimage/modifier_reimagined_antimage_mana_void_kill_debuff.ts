import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_antimage_mana_void_kill_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    parent_died = false;
    selected_ability_cooldown?: CDOTABaseAbility;

    // Modifier specials
    scepter_cooldown_increase?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.scepter_cooldown_increase = this.ability.GetSpecialValueFor("scepter_cooldown_increase");        
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_DEATH,
                ModifierFunction.ON_RESPAWN];
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        // Only trigger if the dying unit is the parent
        if (this.parent == event.unit)
        {
            // Flag the parent as a parent that just died
            this.parent_died = true;

            // Set the expiration date to never
            this.SetDuration(-1, true);
        }
    }

    OnRespawn(event: ModifierUnitEvent): void
    {
        // Only trigger on the parent's respawn
        if (event.unit != this.parent) return;

        if (this.parent_died)
        {
            this.SetDuration(this.scepter_cooldown_increase!, true);
            this.IncreaseCooldown();
            this.StartIntervalThink(1);
        }
    }

    IncreaseCooldown(): void
    {
        if (!IsServer()) return;

        // Find the target's highest cooldown ability
        let highest_cooldown = 0;
        let current_highest_cooldown_ability = undefined;

        for (let index = 0; index < 10; index++) 
        {
            const current_ability = this.parent.GetAbilityByIndex(index);
            if (current_ability)
            {
                const cooldown = current_ability.GetCooldown(current_ability.GetLevel() -1);
                if (cooldown > highest_cooldown)
                {
                    highest_cooldown = cooldown;
                    current_highest_cooldown_ability = current_ability;
                }
            }            
        }

        if (current_highest_cooldown_ability != undefined)
        {
            // If ability is not in cooldown, set in cooldown
            if (current_highest_cooldown_ability!.IsCooldownReady())
            {
                current_highest_cooldown_ability!.StartCooldown(this.scepter_cooldown_increase!);
            }
            else // Increase cooldown by 100 instead
            {
                const remaining_cd = current_highest_cooldown_ability!.GetCooldownTimeRemaining();
                current_highest_cooldown_ability!.EndCooldown();
                current_highest_cooldown_ability!.StartCooldown(remaining_cd + this.scepter_cooldown_increase!);
            }

            // Set selected ability in the modifier's properties
            this.selected_ability_cooldown = current_highest_cooldown_ability;            
        }        
        else
        {
            this.Destroy();
        }
    }

    OnIntervalThink(): void
    {
        if (this.selected_ability_cooldown && this.selected_ability_cooldown.IsCooldownReady())
        {
            this.Destroy();
        }
    }
}