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

declare interface OrbData
{
    can_proc_from_illusions: boolean;
    can_proc_while_silenced: boolean;
    can_proc_on_building: boolean;
    can_proc_on_wards: boolean;
    can_proc_on_magic_immune: boolean;
}

interface CDOTA_BaseNPC {
    AddNewModifier(
        caster: CDOTA_BaseNPC | undefined,
        ability: CDOTABaseAbility | undefined,
        modifierName: string,
        modifierTable: { duration?: number; [key: string]: any } | undefined,
    ): CDOTA_Buff;
}

