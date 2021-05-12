import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { GetChargeModifierForAbility } from "../../lib/util";

// Generic Charges Library created by Elfansoer (with modifications) from dota IMBA
// See the reference at https://github.com/Elfansoer/dota-2-lua-abilities/blob/master/scripts/vscripts/lua_abilities/generic/modifier_generic_charges.lua

@registerModifier()
export class modifier_reimagined_charges extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	timer?: string;
	equipped_scepter: boolean = false;

	IsHidden() {
		if (IsServer()) return true;
		if (this.parent.GetTeamNumber() == GetLocalPlayerTeam()) return false;
		else return true;
	}

	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}
	DestroyOnExpire() {
		return false;
	}
	RemoveOnDeath() {
		return false;
	}
	GetAttributes(): ModifierAttribute {
		return ModifierAttribute.MULTIPLE;
	}

	OnCreated() {
		if (!IsServer()) return;

		if (!IsValidEntity(this.ability)) this.Destroy();

		// Do not allow illusions to have this modifier
		if (this.parent.IsIllusion()) {
			this.Destroy();
			return;
		}

		this.MaximizeChargeCount();
	}

	OnCasterEquippedScepter(): void {
		if (!IsValidEntity(this.ability)) this.Destroy();

		// Find all charge modifiers
		const modifier = GetChargeModifierForAbility(this.ability as CDOTA_Ability_Lua);
		if (modifier) {
			// If the user gets a scepter for the first time, grant him bonus charges for the difference between current and scepter counts
			if (!this.equipped_scepter) {
				this.equipped_scepter = true;

				// Grant bonus charges
				const bonus_charges = this.ability.GetSpecialValueFor("max_charges_scepter") - this.ability.GetSpecialValueFor("max_charges");
				modifier.OnRefresh({ bonus_charges: bonus_charges });
			}
			// Other times simply refresh the calculation
			else {
				modifier.OnRefresh({});
			}
		}
	}

	// Triggered by the ability when inventory content changed and caster doesn't have a scepter effect anymore
	OnCasterUnequippedScepter(): void {
		if (!IsValidEntity(this.ability)) this.Destroy();

		// If the charges requires a scepter, destroy it
		if (this.ability.RequiresScepterForCharges && this.ability.RequiresScepterForCharges()) {
			this.Destroy();
		} else {
			// Check if the charges should adjust (read: decrease) due to removing scepter
			if (this.ability.GetSpecialValueFor("max_charges") < this.ability.GetSpecialValueFor("max_charges_scepter")) {
				if (this.GetStackCount() >= this.ability.GetSpecialValueFor("max_charges")) {
					this.SetStackCount(this.ability.GetSpecialValueFor("max_charges"));
					this.RemoveCurrentTimer();
					this.SetDuration(-1, true);
					this.CalculateCharge();
				}
			}
		}
	}

	OnRefresh(params: { bonus_charges?: number }) {
		if (!IsServer()) return;

		if (!IsValidEntity(this.ability)) this.Destroy();

		let max_charges = this.ability.GetSpecialValueFor("max_charges");
		if (this.caster.HasScepter() && this.ability.GetSpecialValueFor("max_charges_scepter") != 0) {
			max_charges = this.ability.GetSpecialValueFor("max_charges_scepter");
		}

		if (GameRules.Addon.wtf_mode_enabled) {
			this.SetStackCount(max_charges);
		} else if (params && params.bonus_charges) {
			this.SetStackCount(math.min(this.GetStackCount() + params.bonus_charges, max_charges));
		}

		this.CalculateCharge();
	}

	MaximizeChargeCount() {
		let max_charges = 0;
		if (this.caster.HasScepter() && this.ability.GetSpecialValueFor("max_charges_scepter") > 0) {
			max_charges = this.ability.GetSpecialValueFor("max_charges_scepter");
		} else if (this.ability.GetSpecialValueFor("max_charges") > 0) {
			max_charges = this.ability.GetSpecialValueFor("max_charges");
		}

		this.SetStackCount(max_charges);
		this.RemoveCurrentTimer();
		this.CalculateCharge();
	}

	// Modifier Effects
	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ON_ABILITY_FULLY_CAST, ModifierFunction.TOOLTIP];
	}

	OnTooltip(): number {
		let charge_time = this.ability.GetSpecialValueFor("charge_restore_time") * this.parent.GetCooldownReduction();

		if (this.parent.HasScepter() && this.ability.GetSpecialValueFor("charge_restore_time_scepter") && this.ability.GetSpecialValueFor("charge_restore_time_scepter") > 0) {
			charge_time = this.ability.GetSpecialValueFor("charge_restore_time_scepter") * this.parent.GetCooldownReduction();
		}

		return charge_time;
	}

	OnAbilityFullyCast(event: ModifierAbilityEvent) {
		if (event.unit != this.parent) return;

		// Remove this modifier if the ability no longer exists
		if (!this.ability || this.ability.IsNull()) {
			this.Destroy();
			return;
		}

		if (event.ability == this.ability) {
			// Ignore cases where WTF mode is turned on
			if (!GameRules.Addon.wtf_mode_enabled) {
				this.DecrementStackCount();
				this.CalculateCharge();
			}
		} else if (event.ability.GetName() == "item_refresher" || event.ability.GetName() == "item_refresher_shard") {
			this.RemoveCurrentTimer();
			this.SetDuration(-1, true);

			if (this.caster.HasScepter() && this.ability.GetSpecialValueFor("max_charges_scepter") != 0) {
				this.SetStackCount(this.ability.GetSpecialValueFor("max_charges_scepter"));
			} else {
				this.SetStackCount(this.ability.GetSpecialValueFor("max_charges"));
			}
		}
	}

	CalculateCharge() {
		if (!IsValidEntity(this.ability)) this.Destroy();

		if (
			(this.caster.HasScepter() && this.ability.GetSpecialValueFor("max_charges_scepter") != 0 && this.GetStackCount() >= this.ability.GetSpecialValueFor("max_charges_scepter")) ||
			(!this.parent.HasScepter() && this.ability.GetSpecialValueFor("max_charges") > 0 && this.GetStackCount() >= this.ability.GetSpecialValueFor("max_charges"))
		) {
			// stop charging
			this.SetDuration(-1, true);
			this.RemoveCurrentTimer();
		} else {
			// Not currently charging
			if (this.GetRemainingTime() <= 0) {
				// start charging
				let charge_time = this.ability.GetSpecialValueFor("charge_restore_time") * this.parent.GetCooldownReduction();

				if (this.parent.HasScepter() && this.ability.GetSpecialValueFor("charge_restore_time_scepter") && this.ability.GetSpecialValueFor("charge_restore_time_scepter") > 0) {
					charge_time = this.ability.GetSpecialValueFor("charge_restore_time_scepter") * this.parent.GetCooldownReduction();
				}

				this.SetDuration(charge_time, true);
				this.timer = Timers.CreateTimer(charge_time, () => {
					// Verify the caster, the parent, the ability, and the modifier still exist as valid entities
					if (IsValidEntity(this.caster) && IsValidEntity(this.parent) && IsValidEntity(this.ability) && !CBaseEntity.IsNull.call(this as any)) {
						this.IncrementStackCount();
						this.CalculateCharge();
					}
				});
			}

			// set on cooldown if no charges are left
			if (this.GetStackCount() == 0) {
				this.ability.EndCooldown();
				this.ability.StartCooldown(this.GetRemainingTime());
			}
		}
	}

	RemoveCurrentTimer() {
		if (this.timer) {
			Timers.RemoveTimer(this.timer);
			this.timer = undefined;
		}
	}

	OnWTFModeTriggered() {
		this.MaximizeChargeCount();
		this.RemoveCurrentTimer();
		this.SetDuration(-1, true);
	}

	SetCurrentCharges(charges: number) {
		this.SetStackCount(charges);
		this.CalculateCharge();
	}
}
