declare interface ModifierAttackEvent
{
    no_attack_cooldown: boolean;
    record: number;
}

declare interface ModifierTooltip
{
    fail_type: number;
}

declare interface ModifierUnitEvent
{
    ability: CDOTABaseAbility;
    target: CDOTA_BaseNPC;
}

declare interface KnockbackProperties
{
    center_x: number;
    center_y: number;
    center_z: number,
    duration: number;
    knockback_duration: number;
    knockback_distance: number;
    knockback_height: number;
    should_stun: 0 | 1;
}

