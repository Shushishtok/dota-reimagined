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