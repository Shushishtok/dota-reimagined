import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit } from "../../../../lib/util";

@registerModifier()
export class modifier_reimagined_broodmother_spiderite_volatile_spiderite extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    sound_volatile_spiderite: string = "Hero_Snapfire.MortimerBlob.Impact";
    particle_volatile_spiderite: string = "particles/heroes/broodmother/broodmother_spiderling_volatile_spiderite.vpcf";
    particle_volatile_spiderite_fx?: ParticleID;

    // Modifier specials
    volatile_spiderite_damage?: number;
    volatile_spiderite_radius?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.volatile_spiderite_damage = this.ability.GetSpecialValueFor("volatile_spiderite_damage");
        this.volatile_spiderite_radius = this.ability.GetSpecialValueFor("volatile_spiderite_radius");
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_DEATH]
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the dead unit is the parent
        if (event.unit! != this.parent) return;

        // Only apply if it was not killed by its kill timer expiring
        if (event.attacker == event.unit!) return;

        // Play sound
        this.parent.EmitSoundParams(this.sound_volatile_spiderite, 0, 0.5, 0);

        // Create particle
        this.particle_volatile_spiderite_fx = ParticleManager.CreateParticle(this.particle_volatile_spiderite, ParticleAttachment.ABSORIGIN, this.parent);
        ParticleManager.SetParticleControl(this.particle_volatile_spiderite_fx, 0, this.parent.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_volatile_spiderite_fx);

        // For all enemies in radius
        const enemies = FindUnitsAroundUnit(this.parent,
                                            this.parent,
                                            this.volatile_spiderite_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO + UnitTargetType.BASIC,
                                            UnitTargetFlags.NONE);

        for (const enemy of enemies)
        {
            // Deal damage to the target
            ApplyDamage(
            {
                attacker: this.caster,
                damage: this.volatile_spiderite_damage!,
                damage_type: DamageTypes.MAGICAL,
                victim: enemy,
                ability: this.ability,
                damage_flags: DamageFlag.NONE
            });
        }
    }
}
