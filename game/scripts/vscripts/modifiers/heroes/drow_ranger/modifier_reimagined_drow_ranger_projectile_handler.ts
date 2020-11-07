import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_drow_ranger_frost_arrows_handler } from "./modifier_reimagined_drow_ranger_frost_arrows_handler";
import { modifier_reimagined_drow_ranger_marksmanship_passive } from "./modifier_reimagined_drow_ranger_marksmanship_passive"

@registerModifier()
export class modifier_reimagined_drow_ranger_projectile_handler extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    projectile_marksmanship_attack: string = "particles/units/heroes/hero_drow/drow_marksmanship_attack.vpcf"
    projectile_frost: string = "particles/units/heroes/hero_drow/drow_frost_arrow.vpcf";
    projectile_frost_marksmanship_attack: string = "particles/units/heroes/hero_drow/drow_marksmanship_frost_arrow.vpcf";
    original_projectile?: string;
    
    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}

    OnCreated(): void
    {
        if (IsServer())
        {
            this.original_projectile = this.caster.GetRangedProjectileName();
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_START]
    }
    
    OnAttackStart(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        if (event.attacker != this.parent) return;

        let frost_arrow = false;
        let marksmanship_arrow = false;

        // Check if the parent is firing a frost arrow
        if (this.parent.HasModifier("modifier_reimagined_drow_ranger_frost_arrows_handler"))
        {
            const frost_arrows_modifier = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_frost_arrows_handler") as modifier_reimagined_drow_ranger_frost_arrows_handler;
            if (frost_arrows_modifier)
            {                
                if (frost_arrows_modifier.FiresFrostProjectiles())
                {                                        
                    frost_arrow = true;
                }
            }
        }

        // Check if the parent is firing a Marksmanship arrow
        if (this.parent.HasModifier("modifier_reimagined_drow_ranger_marksmanship_passive"))
        {
            const marksmanship_modifier = this.parent.FindModifierByName("modifier_reimagined_drow_ranger_marksmanship_passive") as modifier_reimagined_drow_ranger_marksmanship_passive;
            if (marksmanship_modifier)
            {                
                if (marksmanship_modifier.FiresMarksmanshipArrow())
                {                    
                    marksmanship_arrow = true;
                }
            }
        }

        // Determine arrow projectile
        if (frost_arrow)
        {            
            // Both arrows
            if (marksmanship_arrow)
            {                
                this.caster.SetRangedProjectileName(this.projectile_frost_marksmanship_attack);
            }
            else
            {                
                // If this is only a Frost Arrow, use Frost Arrow projectile
                this.caster.SetRangedProjectileName(this.projectile_frost);
            }
        }
        else if (marksmanship_arrow)
        {            
            // Only Marksmanship
            this.caster.SetRangedProjectileName(this.projectile_marksmanship_attack);
        }
        else
        {
            this.caster.SetRangedProjectileName(this.original_projectile!);
        }        
    }
}