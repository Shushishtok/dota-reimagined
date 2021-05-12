declare interface ModifierTooltip {
    fail_type: number;
}

declare interface ModifierUnitEvent {
    ability: CDOTABaseAbility;
    target?: CDOTA_BaseNPC;
}

declare interface KnockbackProperties {
    center_x: number;
    center_y: number;
    center_z: number;
    duration: number;
    knockback_duration: number;
    knockback_distance: number;
    knockback_height: number;
    should_stun: 0 | 1;
}

interface CDOTA_BaseNPC {
    oldAddNewModifier: <TThis>(this: TThis, caster: CDOTA_BaseNPC | undefined, ability: CDOTABaseAbility | undefined, modifierName: string, modifierTable: object | undefined) => CDOTA_Buff;
    active_item_modifiers: Map<string, CDOTA_Item[]>;
}

interface NewModifierProperties {
    duration?: number;
    ignoreStatusResistance?: 1;
    [key: string]: any;
}

interface CustomGameEventDeclarations {
    learn_talent_event: { ability: EntityIndex };
    confirm_talent_learned: { talent_num: number; learned_by_force: 0 | 1 };
    request_currently_selected_unit: {};
    send_currently_selected_unit: { unit: EntityIndex };
    ping_talent: { ability: EntityIndex; status: TalentStatus };
    custom_chat_message: { isTeam: boolean; textData: string; playerID: PlayerID; ability_name: string | undefined };
}

interface CustomNetTableDeclarations {
    // Just an example of a nettable, not actually used
    spider_manager: { spiders: number };
}

interface CDOTA_BaseNPC_Hero {
    talents_learned: Set<CDOTABaseAbility>;
    talentMap: Map<number, CDOTABaseAbility>;
    recently_buyback: boolean;
    courier: CDOTA_Unit_Courier;
}

interface CDOTA_Buff {
    GetModifierLifeStealStacking(): number;
    GetModifierStatusAmp(): number;
}

interface CDOTABaseAbility {
    RequiresScepterForCharges(): boolean;
    ExecuteOrderFilter(event: ExecuteOrderFilterEvent): boolean;
    SetFrozenCooldown(state: boolean): void;
    SetCooldownSpeed(speed: number): void;
}

declare interface CreateIllusionsModifierKeys {
    outgoing_damage?: number;
    incoming_damage?: number;
    bounty_base?: number;
    bounty_growth?: number;
    outgoing_damage_structure?: number;
    outgoing_damage_roshan?: number;
    duration?: number;
}

declare interface OrbData {
    can_proc_from_illusions: boolean;
    can_proc_while_silenced: boolean;
    can_proc_on_building: boolean;
    can_proc_on_wards: boolean;
    can_proc_on_magic_immune: boolean;
    mana_cost: number;
}

declare interface ModifierInstanceEvent {
    attacker: CDOTA_BaseNPC;
    damage: number;
    damage_type: DamageTypes;
    damage_category: DamageCategory;
    damage_flags: DamageFlag;
    inflictor?: CDOTABaseAbility;
    original_damage: number;
    ranged_attack: boolean;
    unit: CDOTA_BaseNPC;
    no_attack_cooldown: boolean;
    record: number;
    fail_type: AttackRecord;
}
