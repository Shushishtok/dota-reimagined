import { modifier_reimagined_charges } from "../modifiers/general_mechanics/modifier_reimagined_charges";
import "../modifiers/general_mechanics/modifier_reimagined_no_outgoing_damage";
import { BaseAbility, BaseModifier } from "./dota_ts_adapter";
import { BaseTalent } from "./talents";
import { reloadable } from "./tstl-utils";

export interface ReflecteableModifier extends BaseModifier
{
    reflected_abilities?: CDOTABaseAbility[];
}

export interface ReflectedAbility
{
    spell_shield_reflect: boolean;
}

// Type guard - to check if an ability has ReflectAbility stuff
export function IsReflectedAbility(ability: CDOTABaseAbility): ability is CDOTABaseAbility & ReflectedAbility
{
    return (ability as any).spell_shield_reflect !== undefined;
}

// Add the Reflect Ability tag to an existing ability
export function MakeReflectAbility(ability: CDOTABaseAbility): CDOTABaseAbility & ReflectedAbility
{
    (ability as unknown as ReflectedAbility).spell_shield_reflect = true;
    return ability as CDOTABaseAbility & ReflectedAbility;
}

export function SpellReflect(event: ModifierAbilityEvent, parent: CDOTA_BaseNPC, passive_modifier_name: string): boolean
{
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
    if (original_caster.GetTeamNumber() == parent.GetTeamNumber()) return false;

    // Do not reflect back at reflectors to prevent infinite loops
    if (original_caster.HasModifier("modifier_item_lotus_orb_active") || original_caster.HasModifier("modifier_reimagined_antimage_counterspell_active") || original_caster.HasModifier("modifier_mirror_shield_delay")) return false;

    // Do not reflect abilities inside the exception table
    if (exceptionAbilities.includes(event.ability.GetAbilityName())) return false;

    // Do not reflect abilities that have the reflect tag
    if (IsReflectedAbility(event.ability)) return false;

    // If the parent already knows the ability, reference it, otherwise add it
    let reflected_ability_handle;
    if (parent.HasAbility(event.ability.GetAbilityName()))
    {
        reflected_ability_handle = parent.FindAbilityByName(event.ability.GetAbilityName())
    }
    else
    {
        reflected_ability_handle = parent.AddAbility(event.ability.GetAbilityName());

        // Set properties of the new ability
        reflected_ability_handle!.SetStolen(true);
        reflected_ability_handle!.SetHidden(true);
        MakeReflectAbility(reflected_ability_handle)

        reflected_ability_handle.SetRefCountsModifiers(true);
    }

    // Update level to match the original's
    reflected_ability_handle!.SetLevel(event.ability.GetLevel());

    // Set cursor on original target and cast the ability
    parent.SetCursorCastTarget(original_caster);
    reflected_ability_handle!.OnSpellStart();

    // Remove channeling effects
    if (reflected_ability_handle!.OnChannelFinish!)
    {
        reflected_ability_handle!.OnChannelFinish(false);
    }

    // Add ability to the reflected table on the passive modifier
    if (parent.HasModifier(passive_modifier_name))
    {
        const passive_modifier = parent.FindModifierByName(passive_modifier_name);
        if (passive_modifier)
        {
            ((passive_modifier) as ReflecteableModifier).reflected_abilities!.push(reflected_ability_handle!);
        }
    }

    return true;
}

export function RemoveReflectedAbilities(modifier: ReflecteableModifier): void
{
    let removeable_abilities: CDOTABaseAbility[] = []
    // Check if the parent has reflect abilities that can were done with their effects and can be deleted
    for (const reflected_ability of modifier.reflected_abilities!)
    {
        // Verify ability is valid
        if (IsValidEntity(reflected_ability) && !reflected_ability.IsNull())
        {
            // Verify ability is a reflected ability so we won't accidentally remove something original
            if (IsReflectedAbility(reflected_ability))
            {
                // If ability can removed, remove it from the caster
                if (reflected_ability.NumModifiersUsingAbility() == 0 && !reflected_ability.IsChanneling())
                {
                    reflected_ability.RemoveSelf();
                    removeable_abilities.push(reflected_ability);
                }
            }
        }
    }

    // After reitrerating the entire table, remove the removeable abilities from the table
    for (const removeable_ability of removeable_abilities)
    {
        if (modifier.reflected_abilities!.includes(removeable_ability))
        {
            const index = modifier.reflected_abilities!.indexOf(removeable_ability);
            if (index > -1)
            {
                modifier.reflected_abilities!.splice(index, 1);
            }
        }
    }
}


export function CalculateDistanceBetweenEntities(entity1: CBaseEntity, entity2: CBaseEntity) : number
{
    let distance = (entity1.GetAbsOrigin() as Vector - entity2.GetAbsOrigin() as Vector).Length2D();
    return distance
}

export function CalculateDistanceBetweenPoints(point1: Vector, point2: Vector) : number
{
    let distance = ((point1 - point2) as Vector).Length2D();
    return distance
}

export function CalculateDirectionToPosition(origin_pos: Vector, towards_pos: Vector)
{
    return ((towards_pos - origin_pos) as Vector).Normalized();
}

/**
 * Scans near the position to find the closest enemy unit that has the highest track rating. Only use this function for the AI units
 * @param current_position The position to look around for enemies from
 * @param enemy_seek_range The range to look around for enemies
 * @returns Closest unit with highest track rating.
 */

/**
 * Finds all units around a specific unit using FindUnitsInRadius.
 * @param unit the unit to revolve around
 * @param radius search radius
 * @param findTeam The team to search for
 * @param findtypes The type(s) to search for
 * @param findFlags The flag(s) to take into account when searching
 * @returns An array of all units found around the unit using the sent parameters.
 */
export function FindUnitsAroundUnit(caster: CDOTA_BaseNPC, around_unit: CDOTA_BaseNPC, radius: number, findTeam: UnitTargetTeam, findtypes: UnitTargetType, findFlags: UnitTargetFlags): CDOTA_BaseNPC[]
{
    let units: CDOTA_BaseNPC[] = [];

    units = FindUnitsInRadius(caster.GetTeamNumber(),
                              around_unit.GetAbsOrigin(),
                            undefined,
                            radius,
                            findTeam,
                            findtypes,
                            findFlags,
                            FindOrder.ANY,
                            false);
    return units;
}

export function CanUnitGetOrders(unit: CDOTA_BaseNPC)
{
    if (unit.IsStunned() || unit.IsCommandRestricted() || unit.IsOutOfGame() || unit.IsHexed() || unit.IsFrozen())
    {
        return false;
    }

    return true;
}

// Cleave-like cone search - returns the units in front of the caster in a cone.
export function FindUnitsInCone(teamNumber: number, vDirection: Vector, vPosition: Vector, startRadius: number, endRadius: number, flLength: number, hCacheUnit: CDOTA_BaseNPC | undefined, targetTeam: UnitTargetTeam, targetUnit: UnitTargetType, targetFlags: UnitTargetFlags, findOrder: FindOrder, bCache: boolean): CDOTA_BaseNPC[]
{
    const vDirectionCone = Vector(vDirection.y, -vDirection.x, 0.0);
    const enemies = FindUnitsInRadius(teamNumber, vPosition, hCacheUnit, endRadius + flLength, targetTeam, targetUnit, targetFlags, findOrder, bCache );
    let unitTable: CDOTA_BaseNPC[] = []
    if (enemies.length > 0)
    {
        for (const enemy of enemies)
        {
            if (enemy != undefined)
            {
                const vToPotentialTarget = (enemy.GetAbsOrigin() - vPosition) as Vector;
                const flSideAmount = math.abs( vToPotentialTarget.x * vDirectionCone.x + vToPotentialTarget.y * vDirectionCone.y + vToPotentialTarget.z * vDirectionCone.z )
                const enemy_distance_from_caster = ( vToPotentialTarget.x * vDirection.x + vToPotentialTarget.y * vDirection.y + vToPotentialTarget.z * vDirection.z )

                // Author of this "increase over distance": Fudge, pretty proud of this :D
                // Calculate how much the width of the check can be higher than the starting point
                const max_increased_radius_from_distance = endRadius - startRadius

                // Calculate how close the enemy is to the caster, in comparison to the total distance
                const pct_distance = enemy_distance_from_caster / flLength

                // Calculate how much the width should be higher due to the distance of the enemy to the caster.
                const radius_increase_from_distance = max_increased_radius_from_distance * pct_distance

                if (( flSideAmount < startRadius + radius_increase_from_distance ) && ( enemy_distance_from_caster > 0.0 ) && ( enemy_distance_from_caster < flLength ))
                {
                    unitTable.push(enemy);
                }
            }
        }
    }
    return unitTable
}


// Huge credits to DoctorGester for this amazing thing going on here
// Clustering mechanics used by the AI to find the most enemies in the cast range and casting at a point that would hit as many units as possible
// To use: Find the best cluster by running FindBiggestAbilityTargetCluster; this will return the cluster which is a Vector[] variable, or undefined if it didn't find anything
// If the cluster is returned, find its center by running ClusterAverage(), which returns a specific Vector point
// The Vector that was returned is the point that the unit should cast its ability on in order to hit the biggest cluster of enemies.

export function FindBiggestAbilityTargetCluster(ability: CDOTABaseAbility, at_location: Vector, initial_search_radius: number, cluster_radius: number, bigger_than: number): Vector[] | undefined
{
    const all_clusters = SplitAbilityTargetsIntoCircleClusters(ability, at_location, initial_search_radius, cluster_radius)

    if (all_clusters == undefined)
    {
        return undefined;
    }

    return FindBiggestCluster(all_clusters, bigger_than)
}

export function FindBiggestCluster(all_clusters: Vector[][], bigger_than: number): Vector[] | undefined
{
    let biggest_cluster: Vector[] | undefined = undefined;
    let biggest_cluster_size = bigger_than;

    for (const current_cluster of all_clusters)
    {
        if (current_cluster.length > biggest_cluster_size)
        {
            biggest_cluster_size = current_cluster.length;
            biggest_cluster = current_cluster;
        }
    }

    return biggest_cluster
}

export function SplitAbilityTargetsIntoCircleClusters(ability: CDOTABaseAbility, at_location: Vector, initial_search_radius: number, cluster_radius: number): Vector[][] | undefined
{
    const all_points = FindPredictedAbilityTargetsPointsAtLocation(ability, at_location, initial_search_radius)

    if (all_points == undefined)
    {
        return undefined;
    }

    return ClusterizePoints(all_points, cluster_radius)
}

export function ClusterizePoints(points: Vector[], cluster_radius: number): Vector[][]
{
    let all_clusters: Vector[][] = []

    for (let index_top = 0; index_top < points.length; index_top++)
    {
        const point_top = points[index_top];
        let current_cluster: Vector[] = [];

        current_cluster.push(point_top);
        all_clusters.push(current_cluster);

        for (let index_bottom = 0; index_bottom < points.length; index_bottom++)
        {
            const point_bottom = points[index_bottom];
            if (index_top != index_bottom && ((point_bottom - point_top) as Vector).Length2D() <= cluster_radius * 2)
            {
                current_cluster.push(point_bottom);
            }
        }
    }

    return all_clusters
}

export function ClusterAverage(cluster: Vector[]): Vector
{
    let cluster_center: Vector = cluster[0]
    for (const cluster_point of cluster)
    {
        cluster_center = ((cluster_center + cluster_point) / 2.0) as Vector
    }

    return cluster_center
}

export function FindPredictedAbilityTargetsPointsAtLocation(ability: CDOTABaseAbility, at_location: Vector, initial_search_radius: number): Vector[] | undefined
{
    const units_in_radius = FindAbilityTargetsAtLocation(ability, at_location, initial_search_radius)
    if (units_in_radius == undefined)
    {
        return undefined;
    }

    let all_points: Vector[] = []

    for (const unit of units_in_radius)
    {
        let point = unit.GetAbsOrigin()

        if (unit.IsMoving())
        {
            point = (point + unit.GetForwardVector() * unit.GetIdealSpeed()) as Vector
        }

        all_points.push(point)
    }

    return all_points
}

export function FindAbilityTargetsAtLocation(ability: CDOTABaseAbility, at_location: Vector, with_radius: number) : CDOTA_BaseNPC[] | undefined
{
    const units = FindUnitsInRadius(
        ability.GetMoveParent().GetTeamNumber(),
        at_location,
        undefined,
        with_radius,
        ability.GetAbilityTargetTeam(),
        ability.GetAbilityTargetType(),
        ability.GetAbilityTargetFlags(),
        FindOrder.ANY,
        false
    )

    if (units && units.length > 0)
    {
        return units;
    }
    else
    {
        return undefined;
    }
}

// All Ability Perks should have IsPerk set to true
export class AbilityPerk extends BaseAbility
{
    IsPerk: boolean = true;
}

// Custom cleave attack to prevent inconsistencies and forced behaviors
export function CustomCleaveAttack(attacker: CDOTA_BaseNPC, start_position: Vector, start_width: number, end_width: number, distance: number, targetTeam: UnitTargetTeam, targetType: UnitTargetType, targetFlags: UnitTargetFlags, target: CDOTA_BaseNPC, damage_percent: number, ability: CDOTABaseAbility): number
{
    // Find enemies
    const enemies = FindUnitsInCone(attacker.GetTeamNumber(),
                                    attacker.GetForwardVector(),
                                    start_position,
                                    start_width,
                                    end_width,
                                    distance,
                                    undefined,
                                    targetTeam,
                                    targetType,
                                    targetFlags,
                                    FindOrder.CLOSEST,
                                    false);

    // Calculate damage
    const damage = attacker.GetAverageTrueAttackDamage(target) * damage_percent * 0.01;

    // Deal damage to enemies
    for (const enemy of enemies)
    {
        // Ignore main enemy
        if (enemy == target) continue;

        // Deal physical damage to enemies
        ApplyDamage(
        {
            attacker: attacker,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            victim: enemy,
            ability: ability,
            damage_flags: DamageFlag.NONE
        });
    }

    return enemies.length;
}

export function PerformAttackNoCleave(attacker: CDOTA_BaseNPC, target: CDOTA_BaseNPC, useCastAttackOrb: boolean, processProcs: boolean, skipCooldown: boolean, ignoreInvis: boolean, useProjectile: boolean, fakeAttack: boolean, neverMiss: boolean)
{
    // If this is a fake attack, do things as usual
    if (fakeAttack)
    {
        attacker.PerformAttack(target, useCastAttackOrb, processProcs, skipCooldown, ignoreInvis, useProjectile, fakeAttack, neverMiss)
    }
    else
    {
        // Make a real attack without proccing any on hit effects
        attacker.PerformAttack(target, useCastAttackOrb, false, skipCooldown, ignoreInvis, useProjectile, fakeAttack, neverMiss)

        // Add no-damage modifier to the attacker
        const modifier = attacker.AddNewModifier(undefined, undefined, GenericModifier.NO_OUTGOING_DAMAGE, {duration: 1});

        // And then a fake attack with proccing hit effects, no projectiles
        attacker.PerformAttack(target, useCastAttackOrb, true, skipCooldown, ignoreInvis, false, true, neverMiss);

        // Remove no-damage modifier
        modifier.Destroy();
    }
}

export function PrintEventTable(event: any)
{
    for (const key in event)
    {
        print(key, event[key])
    }
}

export function IsRoshan(unit: CDOTA_BaseNPC): boolean
{
    if (unit.GetName() == "npc_dota_roshan") return true;
    else return false;
}

export function CanOrbEffectBeCast(event: ModifierAttackEvent, ability: CDOTABaseAbility, orb_data: OrbData): boolean
{
    // Assume it's an orb attack unless otherwise stated
    let orb_attack = true;

    orb_attack = CanUserCastOrb(event.attacker, ability, orb_data.can_proc_from_illusions, orb_data.can_proc_while_silenced, orb_data.mana_cost);
    if (!orb_attack) return false;

    orb_attack = CanOrbBeCastOnTarget(event.target, orb_data.can_proc_on_building, orb_data.can_proc_on_wards, orb_data.can_proc_on_magic_immune);
    return orb_attack;
}

export function CanUserCastOrb(user: CDOTA_BaseNPC, ability: CDOTABaseAbility, can_proc_from_illusions: boolean, can_proc_while_silenced: boolean, mana_cost: number): boolean
{
    // Illusions cannot proc the orb attacks
    if (!can_proc_from_illusions)
    {
        if (user.IsIllusion()) return false;
    }

    // If the parent is silenced, can't proc the orb attacks
    if (!can_proc_while_silenced)
    {
        if (user.IsSilenced()) return false;
    }

    // If the caster doesn't have enough mana to cast it, return false
    if (user.GetMana() < mana_cost) return false;

    // If the ability can't be cast due to mana or other limitations, can't proc the orb attacks
    if (!ability.IsFullyCastable()) return false;

    return true;
}

export function CanOrbBeCastOnTarget(target: CDOTA_BaseNPC, can_proc_on_building: boolean, can_proc_on_wards: boolean, can_proc_on_magic_immune: boolean): boolean
{
    // Check conditions on whether it can proc on the enemy
    if (!can_proc_on_building)
    {
        if (target.IsBuilding()) return false;
    }

    if (!can_proc_on_wards)
    {
        if (target.IsOther()) return false;
    }

    if (!can_proc_on_magic_immune)
    {
        if (target.IsMagicImmune()) return false;
    }

    return true;
}

/**
 * Returns the duration after calculating the target's status resistance and the caster's status amp.
 * @param caster the unit that is responsible for the modifier. Checks for its status amp.
 * @param target the unit that has the modifier apply on. Checks for its status resistance.
 * @param duration the initial duration of a modifier.

 * @returns The duration of a modifier that should be applied, taking into account status resistance and status amp.
 */
export function GetAppliedDuration(caster: CDOTA_BaseNPC | undefined, target: CDOTA_BaseNPC, duration: number, modifier_name: string): number
{
    // Does nothing if caster and target are on the same team
    if (caster && caster.GetTeamNumber() == target.GetTeamNumber()) return duration;

    // Get target's status resistance
    const status_resistance = target.GetStatusResistance(); // Returns a number between 0 and 1

    // Get caster's status amp
    let total_status_amp = 1;
    if (caster)
    {
        const modifiers = caster.FindAllModifiers() as BaseModifier[];
        let status_amp: number[] = [];
        for (const modifier of modifiers)
        {
            if (modifier.GetModifierStatusResistanceCaster)
            {
                status_amp.push(modifier.GetModifierStatusResistanceCaster());
            }

            // Hardcoded because I can't figure out how Timeless Relic actually works for that, sue me. Only two debuff duration amplifiers anyway
            if (modifier.GetName() == "modifier_item_timeless_relic")
            {
                const debuff_amp = modifier.GetAbility()!.GetSpecialValueFor("debuff_amp");
                status_amp.push(debuff_amp);
            }
            else if (modifier.GetName() == "modifier_rubick_arcane_supremacy")
            {
                const debuff_amp = modifier.GetAbility()!.GetSpecialValueFor("status_resistance");
                status_amp.push(debuff_amp);
            }
        }

        // Calculate total status amp
        for (let index = 0; index < status_amp.length; index++) {
            const status_amp_instance = status_amp[index];
            total_status_amp *= 1 - status_amp_instance * 0.01;
        }
    }
    total_status_amp = 1 - total_status_amp;

    duration = duration * ((1 + (total_status_amp - status_resistance)));
    return duration
}

export function HasBit(checker: number, value: number)
{
    return (checker & value) == value;
}

export function GenerateRandomPositionAroundPosition(position: Vector, min_distance: number, max_distance: number): Vector
{
    return (position + RandomVector(min_distance + Math.sqrt(RandomFloat(0, 1)) * (max_distance! - min_distance!))) as Vector;
}

// Serverside talent utility functions
export function HasTalent(caster: CDOTA_BaseNPC, name: string): boolean
{
    if (IsServer())
    {
        if (caster.HasAbility(name))
        {
            const ability = caster.FindAbilityByName(name);
            if (ability)
            {
                if (ability.IsTrained())
                {
                    return true;
                }
            }
        }
    }
    else
    {
        if (caster.HasModifier("modifier_" + name))
        {
            return true;
        }
    }

    return false;
}

interface AbilityKeyValue
{
    talent_name: string
    special_name: string
}

let specialValueTable: Map<string, number> = new Map();
let abilityKVValueFile: Map<string, any> = new Map();

export function GetTalentSpecialValueFor(caster: CDOTA_BaseNPC, name: string, value: string): number
{
    let number = 0;

    if (IsServer())
    {
        if (HasTalent(caster, name))
        {
            const ability = caster.FindAbilityByName(name);
            if (ability)
            {
                return ability.GetSpecialValueFor(value);
            }
        }
    }
    else
    {
        // Check if talent is learned
        if (HasTalent(caster, name))
        {
            // Form a KeyValue table
            const keyValue: AbilityKeyValue =
            {
                talent_name: name,
                special_name: value
            }

            // Check if the value doesn't already exist in the map from previous attempts
            if (specialValueTable.has(keyValue.talent_name + keyValue.special_name))
            {
                return specialValueTable.get(keyValue.talent_name + keyValue.special_name)!;
            }

            // Load KVs for the hero
            const abilityKVSpecial = "AbilitySpecial";
            let hero_name = caster.GetUnitName()
            hero_name = hero_name.replace("npc_dota_hero_", "");
            const filepath = "scripts/npc/heroes/" + hero_name + "/abilities.kv";

            let abilitiesKV;
            if (abilityKVValueFile.has(filepath))
            {
                abilitiesKV = abilityKVValueFile.get(filepath)
            }
            else
            {
                abilitiesKV = LoadKeyValues(filepath) as any;
                abilityKVValueFile.set(filepath, abilitiesKV);
            }

            // "AbilitySpecial" block
            if (abilitiesKV[name][abilityKVSpecial])
            {
                // "01", "02"... block
                for (const key in abilitiesKV[name][abilityKVSpecial])
                {
                    // "field, name" block
                    for (const key2 in abilitiesKV[name][abilityKVSpecial][key])
                    {
                        if (key2 == value)
                        {
                            // Form the KeyValue objects
                            const keyValue: AbilityKeyValue =
                            {
                                talent_name: name,
                                special_name: value
                            }

                            // Put value in the map for future access
                            const actual_value: number = abilitiesKV[name][abilityKVSpecial][key][key2]
                            specialValueTable.set(keyValue.talent_name + keyValue.special_name, actual_value);

                            return actual_value
                        }
                    }
                }
            }
        }
    }

    return number
}

export function IsTalentAbility(ability: CDOTABaseAbility)
{
    if ((ability as BaseTalent).isTalentAbility) return true;
    if (ability.GetAbilityName().indexOf("special_bonus") !== -1) return true;

    return false;
}

export function PrepareTalentList(hero: CDOTA_BaseNPC_Hero): Map<number, CDOTABaseAbility>
{
    let talentMap: Map<number, CDOTABaseAbility> = new Map();

    // Run over all slots, find out how many abilities this hero has
    let talentsFound = 0;
    for (let index = 0; index < hero.GetAbilityCount(); index++)
    {
        const ability = hero.GetAbilityByIndex(index);
        if (ability)
        {
            if (IsTalentAbility(ability))
            {
                talentsFound++;
                talentMap.set(talentsFound, ability);
            }
        }
    }

    // Assign the map to the hero
    hero.talentMap = talentMap;
    return talentMap;
}

export function GetTalentNumber(ability: CDOTABaseAbility): number | undefined
{
    // Get caster
    const caster = ability.GetCaster() as CDOTA_BaseNPC_Hero;

    // Cycle between the talent map of the caster until the talent number is found
    for (const talent_number of caster.talentMap.keys())
    {
        if (caster.talentMap.get(talent_number) == ability)
        {
            return talent_number;
        }
    }

    return undefined;
}

export function GetTalentAbilityFromNumber(hero: CDOTA_BaseNPC_Hero, talent_number: number): CDOTABaseAbility | undefined
{
    if (hero.talentMap.has(talent_number))
    {
        return hero.talentMap.get(talent_number);
    }

    return undefined;
}

export function ShuffleNumbersInArray(number_array: number[]): number[]
{
    // Fisher-Yates shuffle - modern method
    const result_array = [...number_array];
    for (let index = 0; index < number_array.length; index++)
    {
        const random_number = RandomInt(index, number_array.length - 1)

        // Swap randomed nr with current index
        const temp = result_array[index];
        result_array[index] = result_array[random_number];
        result_array[random_number] = temp;
    }

    return result_array;
}

export function IsSpiderlingUnit(unit: CDOTA_BaseNPC, includes_spiderking: boolean): boolean
{
    if ((includes_spiderking && unit.GetUnitName() === "npc_dota_reimagined_broodmother_spiderking") || IsSpiderling(unit) || unit.GetUnitName() === "npc_dota_broodmother_spiderite") return true;
    else return false;
}

export function IsSpiderling(unit: CDOTA_BaseNPC): boolean
{
    if (unit.GetUnitName() === "npc_dota_broodmother_spiderling") return true
    else return false;
}

export function IsNearEntity(entity_name: string, location: Vector, distance: number, owner?: CDOTA_BaseNPC)
{
    for (const entity of Entities.FindAllByClassname(entity_name))
    {
        if (owner)
        {
            if (entity.GetOwner() === owner && CalculateDistanceBetweenPoints(entity.GetAbsOrigin(), location) <= distance)
            {
                return true;
            }
        }
        else if (CalculateDistanceBetweenPoints(entity.GetAbsOrigin(), location) <= distance)
        {
            return true
        }
    }

    return false
}

export function GetChargeModifierForAbility(ability: CDOTA_Ability_Lua): modifier_reimagined_charges | undefined
{
    // Find all charge modifiers
    const caster = ability.GetCaster();
    const modifiers = caster.FindAllModifiersByName(GenericModifier.CHARGES) as modifier_reimagined_charges[];
    for (const modifier of modifiers)
    {
        // Find the one for this ability
        if (modifier.GetAbility() == ability)
        {
            return modifier;
        }
    }

    return undefined;
}

export function GetAllChargesModifiersForUnit(caster: CDOTA_BaseNPC): modifier_reimagined_charges[] | undefined
{
    const charge_modifiers = caster.FindAllModifiersByName("modifier_reimagined_charges") as modifier_reimagined_charges[];
    if (charge_modifiers)
    {
        return charge_modifiers;
    }

    return undefined;
}

export function GetAllPlayers(): CDOTAPlayer[]
{
    const players: CDOTAPlayer[] = [];

    for (let playerID = 0; playerID < DOTA_MAX_TEAM_PLAYERS; playerID++)
    {
        if (PlayerResource.IsValidPlayer(playerID))
        {
            const player = PlayerResource.GetPlayer(playerID);
            if (player)
            {
                players.push(player);
            }
        }
    }

    return players;
}

export function RegisterFunctionOverrides()
{
    // Override AddNewModifier
    CDOTA_BaseNPC.oldAddNewModifier = CDOTA_BaseNPC.AddNewModifier;
    CDOTA_BaseNPC.AddNewModifier = AddNewModifier;
}

export function AddNewModifier<TThis extends CDOTA_BaseNPC>(this: TThis, caster: CDOTA_BaseNPC | undefined, ability: CDOTABaseAbility | undefined, modifierName: string, modifierTable: {duration?: number; ignoreStatusResistance?: 1; [key: string]: any } | undefined): CDOTA_Buff
{
    // Check if the modifier table has anything in it
    if (modifierTable)
    {
        // Check if it doesn't have the ignoreStatusResistance attribute initialized
        if (!modifierTable.ignoreStatusResistance)
        {
            // Check if it has a duration defined
            if (modifierTable.duration)
            {
                // Apply the actual duration based on the target's status resistance
                modifierTable.duration = GetAppliedDuration(caster, this, modifierTable.duration, modifierName);
            }
        }
    }

    return this.oldAddNewModifier(caster, ability, modifierName, modifierTable);
}

export function GetIllusionOwner(illusion_unit: CDOTA_BaseNPC): CDOTA_BaseNPC | undefined
{
    if (!illusion_unit.IsIllusion()) return undefined;

    let possible_owners = Entities.FindAllByName(illusion_unit.GetUnitName()) as CDOTA_BaseNPC[];
    possible_owners = possible_owners.filter(possible_owner => IsValidEntity(possible_owner) && !possible_owner.IsIllusion() && possible_owner.GetPlayerOwnerID() == illusion_unit.GetPlayerOwnerID());

    // At the end of the process, only one "real" unit should emerge
    if (possible_owners.length == 1)
    {
        return possible_owners[0];
    }
    else
    {
        return undefined;
    }
}

export function GetIllusions(unit: CDOTA_BaseNPC): CDOTA_BaseNPC[] | undefined
{
    if (unit.IsIllusion()) return undefined;

    let possible_illusions = Entities.FindAllByName(unit.GetUnitName()) as CDOTA_BaseNPC[];
    possible_illusions = possible_illusions.filter(possible_illusion => possible_illusion.IsIllusion() && possible_illusion.GetPlayerOwnerID() == unit.GetPlayerOwnerID());
    possible_illusions = possible_illusions.filter(possible_illusion => IsValidEntity(possible_illusion) && possible_illusion.IsAlive());

    if (possible_illusions.length > 0)
    {
        return possible_illusions;
    }
    else
    {
        return undefined;
    }
}

export function ConvertRadiansToEffectiveDotRange(radians: number): number
{
    const effectiveDot = math.cos(radians);
    return effectiveDot;
}

// Rotate a 2D Vector clockwise by x degrees
export function RotateVector2D(direction: Vector, degree: number):Vector {
	let theta = ConvertDegreesToRadians(degree);
	let xp: number = direction.x * Math.cos(theta) - direction.y * Math.sin(theta);
	let yp: number = direction.x * Math.sin(theta) + direction.y * Math.cos(theta);
	return Vector(xp, yp, direction.z).Normalized();
}

// Calculate the angle between two vectors as degrees (with sign as side indicator)
export function AngleCalculationWithSide(vectorA: Vector, vectorB: Vector):number {
	let a2 = Math.atan2(vectorA.y, vectorA.x);
	let a1 = Math.atan2(vectorB.y, vectorB.x);
	let sign = a1 > a2 ? 1 : -1;
	let angle = a1 - a2;
	let K = -sign * Math.PI * 2;
	angle = (Math.abs(K + angle) < Math.abs(angle))? K + angle : angle;
	return ConvertRadiansToDegrees(angle);
}

// Return the side of a test point in reference to another direction (with start location)
export function GetVectorSide(direction: Vector, origin: Vector, point: Vector): 1 | 0 | -1 {
	let goal = (origin + direction * 1000) as Vector;
	let a = (goal.x - origin.x) * (point.y - origin.y) - (goal.y - origin.y) * (point.x - origin.x)
	return sign(a);
}

// Calculate the minimal distance to a line segment from a point (in 2D)
export function MinimumDistanceToLine(startLoc: Vector, endLoc: Vector, testLoc: Vector):number {
	let l2 = sqrDist(startLoc, endLoc);
	if (l2 == 0) return  sqrDist(startLoc, testLoc);
	let t = ((testLoc.x - startLoc.x) * (endLoc.x - startLoc.x) + (testLoc.y - startLoc.y) * (endLoc.y - startLoc.y)) / l2;
	t = Math.max(0, Math.min(1, t));
	return sqrDist(testLoc, Vector(
		startLoc.x + t * (endLoc.x - startLoc.x),
		startLoc.y + t * (endLoc.y - startLoc.y),
		0
	));
}

function sqrDist(vectorA: Vector, vectorB: Vector):number {
	return sqr(vectorA.x - vectorB.x) + sqr(vectorA.y - vectorB.y)
}

function sqr(x: number):number {
	return x * x;
}

function sign(x: number):1 | 0 | -1 {
	return x > 0 ? 1 : x < 0 ? -1 : 0;
}

export function ConvertDegreesToRadians(deg: number):number {
	return deg * (Math.PI / 180);
}

export function ConvertRadiansToDegrees(rad: number):number {
	return 360 * rad / (Math.PI * 2);
}

export function HasScepterShard(unit: CDOTA_BaseNPC): boolean
{
    return unit.HasModifier("modifier_item_aghanims_shard");
}

export function SpawnDummyUnit(location: Vector, owner: CDOTA_BaseNPC): CDOTA_BaseNPC
{
    return CreateUnitByName("reimagined_npc_dummy_unit", location, false, owner, owner, owner.GetTeamNumber());
}
