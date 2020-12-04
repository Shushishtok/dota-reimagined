import { BroodmotherTalents } from "../../../../abilities/heroes/broodmother/reimagined_broodmother_talents";
import { BaseModifier, registerModifier, } from "../../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit, GetTalentSpecialValueFor, HasTalent } from "../../../../lib/util";

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
    owner?: CDOTA_BaseNPC;

    // Modifier specials
    volatile_spiderite_damage?: number;
    volatile_spiderite_radius?: number;

    // Reimagind talent specials
    talent_1_pop_chance?: number;
    talent_1_min_damage?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.volatile_spiderite_damage = this.ability.GetSpecialValueFor("volatile_spiderite_damage");
        this.volatile_spiderite_radius = this.ability.GetSpecialValueFor("volatile_spiderite_radius");

        if (IsServer())
        {
            // Get owner
            this.owner = this.parent.GetOwner() as CDOTA_BaseNPC;
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.ON_DEATH,

                // Talent: Poison Popper: Spiderlings and Spiderites have a x% chance to burst when taking damage, dealing their Volatile Poison damage around them. The damage instance must be greater than y after reductions in order to roll the chance to pop.
                ModifierFunction.ON_TAKEDAMAGE]
    }

    OnDeath(event: ModifierAttackEvent): void
    {
        if (!IsServer()) return;

        // Only apply if the dead unit is the parent
        if (event.unit! != this.parent) return;

        // Only apply if it was not killed by its kill timer expiring
        if (event.attacker == event.unit!) return;

        this.ReimaginedVolatileSpideriteExplosion();
    }

    ReimaginedVolatileSpideriteExplosion()
    {
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

    OnTakeDamage(event: ModifierAttackEvent)
    {
        // Talent: Poison Popper: Spiderlings and Spiderites have a x% chance to burst when taking damage, dealing their Volatile Poison damage around them. The damage instance must be greater than y after reductions in order to roll the chance to pop.
        this.ReimaginedTalentPoisonPopper(event);
    }

    ReimaginedTalentPoisonPopper(event: ModifierAttackEvent)
    {
        if (!IsServer()) return;

        if (this.owner && HasTalent(this.owner, BroodmotherTalents.BroodmotherTalent_1))
        {
            // Initialize values
            if (!this.talent_1_pop_chance) this.talent_1_pop_chance = GetTalentSpecialValueFor(this.owner!, BroodmotherTalents.BroodmotherTalent_1, "pop_chance");
            if (!this.talent_1_min_damage) this.talent_1_min_damage = GetTalentSpecialValueFor(this.owner!, BroodmotherTalents.BroodmotherTalent_1, "min_damage");

            // Only apply on damage taken by the parent
            if (event.unit != this.parent) return;

            // Only apply on damage after reduction is higher than the minimum
            if (event.damage < this.talent_1_min_damage) return;

            // Roll psuedo random chance
            if (RollPseudoRandomPercentage(this.talent_1_pop_chance, PseudoRandom.CUSTOM_GAME_1, this.parent))
            {
                // Explode! without actually dying.
                this.ReimaginedVolatileSpideriteExplosion();
            }
        }
    }
}
