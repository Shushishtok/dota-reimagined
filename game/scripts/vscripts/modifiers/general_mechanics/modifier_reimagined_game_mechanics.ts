import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_game_mechanics extends BaseModifier {
	particle_lifesteal: string = "particles/generic_gameplay/generic_lifesteal.vpcf";
	sound_spiderking_death: string = "Broodmother.Spiderking.Death";
	gold_elapsed_time: number = 0;

	IsHidden() {
		return true;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ON_ATTACK_LANDED, ModifierFunction.ON_DEATH, ModifierFunction.ON_ORDER, ModifierFunction.ON_ABILITY_FULLY_CAST, ModifierFunction.ON_TAKEDAMAGE];
	}

	OnAbilityFullyCast(event: ModifierAbilityEvent) {
		if (!IsServer()) return;
		const modifiers = event.unit.FindAllModifiers() as CDOTA_Modifier_Lua[];
		this.ApplyOnAbilityFullyCast(event, modifiers);
	}

	ApplyOnAbilityFullyCast(event: ModifierAbilityEvent, modifiers: CDOTA_Modifier_Lua[]) {
		for (const modifier of modifiers) {
			if (modifier.OnParentCastAbility) {
				modifier.OnParentCastAbility(event);
			}
		}
	}

	OnTakeDamage(event: ModifierInstanceEvent) {
		if (!IsServer()) return;
		this.ApplyOnParentTakeDamage(event);
		this.ApplyOnParentDealDamage(event);
	}

	ApplyOnParentTakeDamage(event: ModifierInstanceEvent) {
		const modifiers = event.unit.FindAllModifiers() as CDOTA_Modifier_Lua[];
		for (const modifier of modifiers) {
			if (modifier.OnParentTakeDamage) {
				modifier.OnParentTakeDamage(event);
			}
		}
	}

	ApplyOnParentDealDamage(event: ModifierInstanceEvent) {
		const modifiers = event.attacker.FindAllModifiers() as CDOTA_Modifier_Lua[];
		for (const modifier of modifiers) {
			if (modifier.OnParentDealDamage) {
				modifier.OnParentDealDamage(event);
			}
		}
	}

	OnAttackLanded(event: ModifierAttackEvent): void {
		if (!IsServer()) return;
		this.ApplyOnAttackLanded(event);
	}

	ApplyOnAttackLanded(event: ModifierAttackEvent): void {
		const modifiers = event.attacker.FindAllModifiers() as CDOTA_Modifier_Lua[];
		for (const modifier of modifiers) {
			if (modifier.OnParentAttackLanded) {
				modifier.OnParentAttackLanded(event);
			}
		}

		this.ApplyLifesteal(event, modifiers);
	}

	ApplyLifesteal(event: ModifierAttackEvent, modifiers: CDOTA_Modifier_Lua[]): void {
		// If there was no damage done, or somehow it's negative, do nothing
		if (event.damage <= 0) return;

		// Ignore buildings
		if (event.target.IsBuilding()) return;

		// Lifesteal handling
		let lifesteal_pct = 0;
		let lifesteal_multiplier = 0;
		let lifesteal = 0;

		for (const modifier of modifiers) {
			// Calculate lifesteal percentage on attacker
			if (modifier.GetModifierLifeStealStacking && modifier.GetModifierLifeStealStacking() > 0) {
				lifesteal_pct += modifier.GetModifierLifeStealStacking();
			}

			// Calculate lifesteal multiplier
			if (modifier.GetModifierLifestealRegenAmplify_Percentage && modifier.GetModifierLifestealRegenAmplify_Percentage() > 0) {
				lifesteal_multiplier += modifier.GetModifierLifestealRegenAmplify_Percentage();
			}
		}

		// Calculate actual lifesteal based on damage dealt
		if (lifesteal_pct > 0) {
			// Multiply using the multiplier, if any
			if (lifesteal_multiplier > 0) {
				lifesteal_pct = lifesteal_pct * (1 + lifesteal_multiplier * 0.01);
			}

			lifesteal = event.damage * lifesteal_pct * 0.01;
			if (lifesteal > 0) {
				// Heal attacker based on lifesteal
				event.attacker.Heal(lifesteal, undefined);

				// Play particle
				const pfx = ParticleManager.CreateParticle(this.particle_lifesteal, ParticleAttachment.ABSORIGIN_FOLLOW, event.attacker);
				ParticleManager.SetParticleControl(pfx, 0, event.attacker.GetAbsOrigin());
				ParticleManager.ReleaseParticleIndex(pfx);
			}
		}
	}

	OnDeath(event: ModifierInstanceEvent) {
		if (!IsServer()) return;

		// Play

		// Play death sounds for custom units
		if (event.unit) {
			switch (event.unit.GetUnitName()) {
				case "npc_dota_reimagined_broodmother_spiderking":
					event.unit.EmitSoundParams(this.sound_spiderking_death, 0, 0.6, 0);
					break;

				default:
					break;
			}
		}
	}

	OnOrder(event: ModifierUnitEvent) {
		if (!IsServer()) return;

		// Buyback: listen to buyback events, turn on the hero's buyback tag
		if (event.order_type == UnitOrder.BUYBACK && event.unit) {
			if (event.unit.IsRealHero()) {
				event.unit.recently_buyback = true;
			}
		}
	}
}
