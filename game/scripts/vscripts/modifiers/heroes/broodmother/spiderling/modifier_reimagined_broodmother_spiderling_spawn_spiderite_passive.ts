import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import "./modifier_reimagined_broodmother_spiderling_spawn_spiderite_debuff"

@registerModifier()
export class modifier_reimagined_broodmother_spiderling_spawn_spiderite_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    modifier_spawn_spiderite_debuff: string = "modifier_reimagined_broodmother_spiderling_spawn_spiderite_debuff";

    // Modifier specials
    buff_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.buff_duration = this.ability.GetSpecialValueFor("buff_duration");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_ATTACK_LANDED]
    }

    OnAttackLanded(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        // Only apply if the attacker is the parent
        if (event.attacker != this.parent) return;

        // Ignores wards and buildings
        if (event.target.IsOther() || event.target.IsBuilding()) return;

        // Add debuff to target
        event.target.AddNewModifier(this.caster, this.ability, this.modifier_spawn_spiderite_debuff, {duration: this.buff_duration});
    }
}
