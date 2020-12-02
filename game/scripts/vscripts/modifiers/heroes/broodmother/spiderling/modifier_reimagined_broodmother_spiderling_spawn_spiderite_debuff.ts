import { reimagined_broodmother_spawn_spiderlings } from "../../../../abilities/heroes/broodmother/reimagined_broodmother_spawn_spiderlings";
import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import { IsSpiderling } from "../../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_spiderling_spawn_spiderite_debuff extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    unit_spiderite_name: string = "npc_dota_broodmother_spiderite";
    unit_spiderling_name: string = "npc_dota_broodmother_spiderling"
    spawn_spiderlings_ability: string = "reimagined_broodmother_spawn_spiderlings";

    // Modifier specials
    spiderite_duration?: number;

    // Reimagined properties
    spiderlings_set: Set<CDOTA_BaseNPC> = new Set();

    // Reimagined specials
    spider_genes_stacks?: number;

    IsHidden() {return false}
    IsDebuff() {return true}
    IsPurgable() {return true}

    OnCreated(): void
    {
        // Modifier specials
        this.spiderite_duration = this.ability.GetSpecialValueFor("spiderite_duration");

        // Reimagined specials
        this.spider_genes_stacks = this.ability.GetSpecialValueFor("spider_genes_stacks");

        // Reimagined: Spider Genes: attacks from different Spiderlings accumulate stacks on the target. If the target dies with at least x stacks, a Spiderling is spawned instead of a Spiderite.
        // Adds a stack and registers the caster immediately upon addition
        this.ReimaginedSpiderGenes(undefined);
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_DEATH,
                // Reimagined: Spider Genes: attacks from different Spiderlings accumulate stacks on the target. If the target dies with at least x stacks, a Spiderling is spawned instead of a Spiderite.
                ModifierFunction.ON_ATTACK_LANDED,
                ModifierFunction.TOOLTIP]
    }

    OnTooltip(): number
    {
        return this.spider_genes_stacks!;
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply when the unit is the parent
        if (event.unit! != this.parent) return;

        const death_position = this.parent.GetAbsOrigin();

        // Reimagined: Spider Genes: attacks from different Spiderlings accumulate stacks on the target. If the target dies with at least x stacks, a Spiderling is spawned instead of a Spiderite.
        // If the check goes through, this will create a Spiderling instead of a Spiderite
        if (this.ReimaginedSpiderGenesCheckStacks(death_position)) return;

        // Summon a Spiderite!
        this.SummonSpiderUnit(this.unit_spiderite_name, true, death_position);
    }

    SummonSpiderUnit(unit_name: string, isSpiderite: boolean, position: Vector)
    {
        // Spawn unit
        CreateUnitByNameAsync(unit_name, position, true, this.caster.GetOwner(), this.caster.GetOwner(), this.caster.GetTeamNumber(), (unit: CDOTA_BaseNPC) =>
        {
            // Set unit in position
            unit.SetOwner(this.caster.GetOwner());
            unit.SetControllableByPlayer(this.caster.GetPlayerOwnerID(), false);
            FindClearSpaceForUnit(unit, position, true);
            ResolveNPCPositions(position, unit.GetHullRadius());

            // Increase its ability levels
            let ability_level = 1;
            const spawn_spiderlings_ability_handle = (unit.GetOwner() as CDOTA_BaseNPC).FindAbilityByName(this.spawn_spiderlings_ability)
            if (spawn_spiderlings_ability_handle && spawn_spiderlings_ability_handle.IsTrained())
            {
                ability_level = spawn_spiderlings_ability_handle.GetLevel();
            }

            for (let index = 0; index < unit.GetAbilityCount(); index++)
            {
                const ability_handle = unit.GetAbilityByIndex(index);
                if (ability_handle)
                {
                    ability_handle.SetLevel(ability_level);
                }
            }

            // Give it a kill timer
            unit.AddNewModifier(this.caster.GetOwner() as CDOTA_BaseNPC, undefined, BuiltInModifier.KILL, {duration: this.spiderite_duration!});

            this.ReimaginedSpiderlingAcademy(unit, isSpiderite);
        })
    }

    OnAttackLanded(event: ModifierAttackEvent): void
    {
        // Reimagined: Spider Genes: attacks from different Spiderlings accumulate stacks on the target. If the target dies with at least x stacks, a Spiderling is spawned instead of a Spiderite.
        this.ReimaginedSpiderGenes(event);
    }

    ReimaginedSpiderGenes(event: ModifierAttackEvent | undefined): void
    {
        if (!IsServer()) return;

        // On creation, adds the caster to the set and sets stacks at 1
        if (!event)
        {
            this.spiderlings_set.add(this.caster);
            this.IncrementStackCount();
            return;
        }

        // Only apply if the target is the parent
        if (event.target != this.parent) return;

        // Only apply if the attacker is a spiderling
        if (!IsSpiderling(event.attacker)) return;

        // If this spiderling already attacked this parent, ignore
        if (this.spiderlings_set.has(event.attacker)) return;

        // Increment stack count
        this.IncrementStackCount();

        // Register attacker in set
        this.spiderlings_set.add(event.attacker);
    }

    ReimaginedSpiderGenesCheckStacks(position: Vector): boolean
    {
        // Check if there are enough stacks to turn the unit into a Spiderling instead
        if (this.GetStackCount() >= this.spider_genes_stacks!)
        {
            // Summon a spiderling instead
            this.SummonSpiderUnit(this.unit_spiderling_name, false, position);
            return true;
        }

        return false;
    }

    ReimaginedSpiderlingAcademy(unit: CDOTA_BaseNPC, isSpiderite: boolean)
    {
        // Find the ability handle of the caster
        const owner = this.caster.GetOwnerEntity() as CDOTA_BaseNPC;
        if (owner)
        {
            const spawn_spiderling_ability_handle = owner.FindAbilityByName(this.spawn_spiderlings_ability);
            if (spawn_spiderling_ability_handle)
            {
                // Apply the Spiderling Academy Reimagination from the caster
                (spawn_spiderling_ability_handle as reimagined_broodmother_spawn_spiderlings).ReimaginedSpiderlingAcademy(unit, isSpiderite);
            }
        }
    }
}
