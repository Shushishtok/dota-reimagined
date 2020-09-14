import { BaseAbility, BaseModifier } from "./dota_ts_adapter";

export interface ReimaginedModifier extends BaseModifier
{
    GetModifierLifeStealStacking(): number;
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
export function FindUnitsAroundUnit(unit: CDOTA_BaseNPC, radius: number, findTeam: UnitTargetTeam, findtypes: UnitTargetType, findFlags: UnitTargetFlags): CDOTA_BaseNPC[]
{
    let units: CDOTA_BaseNPC[] = [];

    units = FindUnitsInRadius(unit.GetTeamNumber(),
                            unit.GetAbsOrigin(),
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

