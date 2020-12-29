import { BaseModifierMotionHorizontal, registerModifier } from "../../../lib/dota_ts_adapter";
import { FindUnitsAroundUnit } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_slardar_sprint_finish_strong extends BaseModifierMotionHorizontal
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    distance_traveled: number = 0;
    enemies_moved_set: Set<CDOTA_BaseNPC> = new Set();

    // Modifier specials
    finish_strong_distance?: number;
    finish_strong_radius?: number;
    finish_strong_damage?: number;
    finish_strong_stun_duration?: number;

    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        // Modifier specials
        this.finish_strong_distance = this.ability.GetSpecialValueFor("finish_strong_distance");
        this.finish_strong_radius = this.ability.GetSpecialValueFor("finish_strong_radius");
        this.finish_strong_damage = this.ability.GetSpecialValueFor("finish_strong_damage");
        this.finish_strong_stun_duration = this.ability.GetSpecialValueFor("finish_strong_stun_duration");

        if (!IsServer()) return;

        // Check if the parent is currently affected by motion controllers - do nothing if so
        if (this.parent.IsCurrentlyVerticalMotionControlled() || this.parent.IsCurrentlyHorizontalMotionControlled()) this.Destroy();

        // Apply motion controller
        if (!this.ApplyHorizontalMotionController()) return;
    }

    UpdateHorizontalMotion(parent: CDOTA_BaseNPC, interval: number)
    {
        if (!IsServer()) return;

        const distance_per_frame = this.finish_strong_distance! / this.GetDuration() * interval;

        if (this.distance_traveled < this.finish_strong_distance!)
        {
            // Move yourself forward
            const direction = this.parent.GetForwardVector();
            const caster_new_pos = (this.parent.GetAbsOrigin() + direction * distance_per_frame) as Vector;
            this.parent.SetAbsOrigin(caster_new_pos);

            // Find all enemies in AoE to drag with you
            const enemies = FindUnitsAroundUnit(this.parent,
                                                this.parent,
                                                this.finish_strong_radius!,
                                                UnitTargetTeam.ENEMY,
                                                UnitTargetType.HERO + UnitTargetType.BASIC,
                                                UnitTargetFlags.NONE);

            for (const enemy of enemies)
            {
                // Move enemy forward
                const enemy_new_position = (enemy.GetAbsOrigin() + direction * distance_per_frame) as Vector;
                enemy.SetAbsOrigin(enemy_new_position);

                // Add enemy to the set if not there already for later to make sure it has a proper position
                if (!this.enemies_moved_set.has(enemy))
                {
                    this.enemies_moved_set.add(enemy);
                }
            }
        }
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,
                ModifierFunction.DISABLE_TURNING]
    }

    GetModifierDisableTurning(): 0 | 1
    {
        return 1;
    }

    GetActivityTranslationModifiers(): string
    {
	    return "forcestaff_friendly";
    }

    OnDestroy(): void
    {
        if (!IsServer()) return;

        // Find a clear position for the caster
        FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), true);

        // Run over the set, and find a clear position for enemies that were affected over the duration
        for (const enemy of this.enemies_moved_set.values())
        {
            if (IsValidEntity(enemy) && enemy.IsAlive())
            {
                FindClearSpaceForUnit(enemy, enemy.GetAbsOrigin(), true);
            }
        }

        // Deal damage and stun all enemies in radius
        const enemies = FindUnitsAroundUnit(this.parent,
                                            this.parent,
                                            this.finish_strong_radius!,
                                            UnitTargetTeam.ENEMY,
                                            UnitTargetType.HERO + UnitTargetType.BASIC,
                                            UnitTargetFlags.NONE);

        for (const enemy of enemies)
        {
            // Deal damage to the enemy
            ApplyDamage(
            {
                attacker: this.parent,
                damage: this.finish_strong_damage!,
                damage_type: DamageTypes.PHYSICAL,
                victim: enemy,
                ability: this.ability,
                damage_flags: DamageFlag.NONE
            });

            // Stun target
            enemy.AddNewModifier(this.parent, this.ability, BuiltInModifier.STUN, {duration: this.finish_strong_stun_duration!});
        }
    }
}
