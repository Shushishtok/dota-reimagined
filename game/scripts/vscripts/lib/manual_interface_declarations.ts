declare interface ModifierTooltip
{
    fail_type: number;
}

declare interface ModifierUnitEvent
{
    ability: CDOTABaseAbility;
    target?: CDOTA_BaseNPC;
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
    mana_cost: number
}

interface CDOTA_BaseNPC
{
    AddNewModifier(caster: CDOTA_BaseNPC | undefined,
                ability: CDOTABaseAbility | undefined,
                modifierName: string,
                modifierTable: { duration?: number; [key: string]: any } | undefined): CDOTA_Buff;
}

interface CustomGameEventDeclarations
{
    learn_talent_event: {ability: EntityIndex};
    confirm_talent_learned: {talent_num: number, learned_by_force: 0 | 1};
    request_currently_selected_unit: {};
    send_currently_selected_unit: {unit: EntityIndex};
    ping_talent: {ability: EntityIndex, status: TalentStatus}
    custom_chat_message: {isTeam: boolean, textData: string, playerID: PlayerID, ability_name: string | undefined}
}

interface CustomNetTableDeclarations
{
    // Just an example of a nettable, not actually used
    spider_manager: {spiders: number};
}

interface CDOTA_BaseNPC_Hero
{
    talents_learned: Set<CDOTABaseAbility>;
    talentMap: Map<number, CDOTABaseAbility>;
    recently_buyback: boolean;
}

interface CDOTA_Buff
{
    GetModifierLifeStealStacking(): number;
    GetModifierStatusAmp(): number;
}

interface CDOTABaseAbility
{
    RequiresScepterForCharges(): boolean;
}
