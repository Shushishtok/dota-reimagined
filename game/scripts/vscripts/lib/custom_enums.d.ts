declare const enum BuiltInModifier
{
    STUN = "modifier_stunned",
    SILENCE = "modifier_silence",
    KNOCKBACK = "modifier_knockback",
    KILL = "modifier_kill"
}

declare const enum AttachLocation
{
    HITLOC = "attach_hitloc",
    EYES = "attach_eyes",
    WEAPON = "attach_weapon",
    HEAD = "attach_head",
    SWORD_END = "attach_sword_end",
    ATTACK1 = "attach_attack1",
    ATTACK2 = "attach_attack2",
    ATTACK3 = "attach_attack3",
    THORAX = "attach_thorax"
}

declare const enum GenericModifier
{
    NO_OUTGOING_DAMAGE = "modifier_reimagined_no_outgoing_damage",
    IGNORE_ARMOR = "modifier_reimagined_negate_armor",
    CANNOT_MISS = "modifier_reimagined_cannot_miss",
    DAMAGE_REDUCTION = "modifier_reimagined_damage_penalty",
    CHARGES = "modifier_reimagined_charges"
}

declare const enum PrecacheType
{
    SOUNDFILE = "soundfile",
    PARTICLE = "particle",
    PARTICLE_FOLDER = "particle_folder",
    MODEL = "model"
}

declare const enum TalentStatus
{
    LEARNED = 0,
    NOT_LEARNED = 1,
    UNLEARNABLE = 2,
    CAN_BE_LEARNED = 3
}

declare const enum CustomCastErrorStrings
{
    CANNOT_CAST_ON_ROSHAN = "#DOTA_Tooltip_cast_error_cast_on_roshan",
    CANNOT_CAST_ON_PLAYER_CONTROLLED = "#DOTA_Tooltip_cast_error_cast_on_player_controlled_units"
}
