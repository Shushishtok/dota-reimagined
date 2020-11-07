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
    ATTACK1 = "attach_attack1"
}

declare const enum GenericModifier
{
    NO_OUTGOING_DAMAGE = "modifier_reimagined_no_outgoing_damage",
    IGNORE_ARMOR = "modifier_reimagined_negate_armor",
    CANNOT_MISS = "modifier_reimagined_cannot_miss",
    DAMAGE_REDUCTION = "modifier_reimagined_damage_penalty"
}

declare const enum PrecacheType
{
    SOUNDFILE = "soundfile",
    PARTICLE = "particle",
    PARTICLE_FOLDER = "particle_folder",
    MODEL = "model"
}