import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import "./modifier_reimagined_broodmother_spiderking_venom_stinger_debuff"

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_venom_stinger_passive extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    modifier_debuff: string = "modifier_reimagined_broodmother_spiderking_venom_stinger_debuff";

    // Modifier specials
    duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.duration = this.ability.GetSpecialValueFor("duration");
    }

    OnRefresh(): void
    {
        this.OnCreated();
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

        // Doesn't apply on buildings, wards, or allies
        if (event.target.IsBuilding() || event.target.IsOther() || event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return;

        // Doesn't apply when passives are disabled
        if (this.parent.PassivesDisabled()) return;

        // Doesn't apply if the target is magic immune
        if (event.target.IsMagicImmune()) return;

        // Apply the debuff
        event.target.AddNewModifier(this.parent, this.ability, this.modifier_debuff, {duration: this.duration})
    }
}
