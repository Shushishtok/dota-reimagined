import { BaseModifier, registerModifier, } from "../../../lib/dota_ts_adapter";
import { reimagined_slardar_slithereen_crush } from "../../../abilities/heroes/slardar/reimagined_slardar_slithereen_crush"

@registerModifier()
export class modifier_reimagined_slardar_bash_crusher_counter extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    ability_slithereen_crush_name: string = "reimagined_slardar_slithereen_crush";

    // Modifier specials
    crusher_proc_count?: number;

    IsHidden()
    {
        // Only visible when the stack count is non-zero
        return this.GetStackCount() == 0;
    }

    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.crusher_proc_count = this.ability.GetSpecialValueFor("crusher_proc_count");
    }

    OnStackCountChanged(old_stack_count: number)
    {
        if (!IsServer()) return;

        // We only care about increments of stacks
        if (this.GetStackCount() <= old_stack_count) return;

        // Check if the stack count is now at the proc threshold
        if (this.GetStackCount() < this.crusher_proc_count!) return;

        // Proc Slithereen Crush.. for free! Assuming we can find it.
        const ability_slithereen_crush = this.parent.FindAbilityByName(this.ability_slithereen_crush_name) as reimagined_slardar_slithereen_crush;
        if (!ability_slithereen_crush) return;
        ability_slithereen_crush.SlithereenCrush(true, this.parent, false);

        // Reset stack count
        this.SetStackCount(0);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.crusher_proc_count!;
    }
}
