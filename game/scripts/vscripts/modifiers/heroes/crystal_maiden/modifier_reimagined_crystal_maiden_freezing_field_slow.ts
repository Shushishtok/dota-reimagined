import { BaseModifier, registerModifier} from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_crystal_maiden_freezing_field_aura } from "./modifier_reimagined_crystal_maiden_freezing_field_aura"
import { reimagined_crystal_maiden_frostbite } from "../../../abilities/heroes/crystal_maiden/reimagined_crystal_maiden_frostbite"

@registerModifier()
export class modifier_reimagined_crystal_maiden_freezing_field_slow extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();

    // Modifier specials
    movespeed_slow?: number;
    attack_slow?: number;
    scepter_delay?: number;
    time_incremented: number = 0;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier properties
        
        this.ability = this.GetAbility()!;

        // Modifier specials
        this.movespeed_slow = this.ability.GetSpecialValueFor("movespeed_slow");
        this.attack_slow = this.ability.GetSpecialValueFor("attack_slow");
        this.scepter_delay = this.ability.GetSpecialValueFor("scepter_delay");        

        if (IsServer() && this.caster!.HasScepter()) {this.StartIntervalThink(0.05)}        
    }

    OnIntervalThink()
    {
        // Increment timer
        this.time_incremented += 0.05;

        // Find the aura modifier
        if (this.caster!.HasModifier(modifier_reimagined_crystal_maiden_freezing_field_aura.name))
        {
            const modifier = this.caster!.FindModifierByName(modifier_reimagined_crystal_maiden_freezing_field_aura.name) as modifier_reimagined_crystal_maiden_freezing_field_aura;
            if (modifier)
            {
                // Check if this enemy is in the enemy list set        
                if (!(modifier).scepter_enemy_list.has(this.parent))
                {
                    if (this.time_incremented >= this.scepter_delay!)
                    {
                        // Find caster's Frostbite ability
                        if (this.caster!.HasAbility(reimagined_crystal_maiden_frostbite.name))
                        {
                            const frostbite_ability_handle = this.caster?.FindAbilityByName(reimagined_crystal_maiden_frostbite.name);
                            if (frostbite_ability_handle && frostbite_ability_handle.IsTrained())
                            {
                                // Cast Frostbite on this enemy
                                this.caster!.SetCursorCastTarget(this.parent);
                                (frostbite_ability_handle as reimagined_crystal_maiden_frostbite).OnSpellStart(true);

                                // Add the enemy to the set
                                modifier.scepter_enemy_list.add(this.parent);
                            }
                        }
                    }
                }
                else
                {
                    // If the enemy was already found in the set, stop thinking.
                    this.StartIntervalThink(-1);
                }
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
                ModifierFunction.ATTACKSPEED_BONUS_CONSTANT]
    }

    GetModifierMoveSpeedBonus_Percentage(): number
    {
        return this.movespeed_slow! * (-1);
    }

    GetModifierAttackSpeedBonus_Constant(): number
    {
        return this.attack_slow! * (-1);
    }
}