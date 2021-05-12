import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_crystal_maiden_arcane_aura_aura extends BaseModifier {
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!;
    parent: CDOTA_BaseNPC = this.GetParent();
    radius: number = 25000;
    modifier_aura_buff: string = "modifier_reimagined_crystal_maiden_arcane_aura_buff";
    modifier_aura_focused_arcane: string = "modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane";
    modifier_aura_blueheart: string = "modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery";

    // Reimagined specials
    focused_arcane_radius?: number;
    blueheart_mastery_duration?: number;

    IsHidden() {
        return true;
    }
    IsDebuff() {
        return false;
    }
    IsPurgable() {
        return false;
    }
    RemoveOnDeath() {
        return false;
    }

    OnCreated(): void {
        // Reimagined specials
        this.focused_arcane_radius = this.ability.GetSpecialValueFor("focused_arcane_radius");
        this.blueheart_mastery_duration = this.ability.GetSpecialValueFor("blueheart_mastery_duration");
    }

    OnRefresh() {
        this.OnCreated();
    }

    IsAura(): boolean {
        // Does nothing when caster is disabled
        if (this.parent.PassivesDisabled()) {
            return false;
        }

        return true;
    }

    IsAuraActiveOnDeath() {
        return true;
    }
    GetAuraDuration() {
        return 0.5;
    }
    GetAuraRadius(): number {
        // Reimagination: Focused Arcane: Can be no-target cast to reduce the aura range from global to 1200 but also increase magical resistance and spell amp of nearby allies
        if (this.ReimaginationFocusedArcane()) {
            return this.focused_arcane_radius!;
        }

        return this.radius;
    }

    ReimaginationFocusedArcane(): boolean {
        if (this.parent.HasModifier(this.modifier_aura_focused_arcane)) {
            return true;
        }

        return false;
    }

    GetAuraSearchFlags(): UnitTargetFlags {
        return UnitTargetFlags.NONE;
    }
    GetAuraSearchTeam(): UnitTargetTeam {
        return UnitTargetTeam.FRIENDLY;
    }
    GetAuraSearchType(): UnitTargetType {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }
    GetModifierAura(): string {
        return this.modifier_aura_buff;
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_TAKEDAMAGE, // Reimagined: Blueheart Mastery: Dealing damage to enemy units improves Crystal Maiden's aura's mana regeneration for each damage instance she inflicts. Stacks infinitely, independent stacks. Each stack lasts 3 seconds.
        ];
    }

    OnTakeDamage(event: ModifierInstanceEvent): void {
        if (!IsServer()) return;

        // Does nothing if the aura is disabled
        if (this.parent.PassivesDisabled()) {
            return;
        }

        // Does nothing if the attacker is not the caster
        if (this.parent != event.attacker) {
            return;
        }

        // Does nothing if the target is an ally, building or ward
        if (
            this.parent.GetTeamNumber() == event.unit!.GetTeamNumber() ||
            event.unit!.IsBuilding() ||
            event.unit!.IsOther()
        ) {
            return;
        }

        // Add and increment a stack for Blueheart Mastery
        if (!this.parent.HasModifier(this.modifier_aura_blueheart)) {
            this.parent.AddNewModifier(this.caster!, this.ability, this.modifier_aura_blueheart, {
                duration: this.blueheart_mastery_duration!,
            });
        }

        const modifier = this.parent.FindModifierByName(this.modifier_aura_blueheart);
        if (modifier) {
            modifier.IncrementStackCount();
        }
    }
}
