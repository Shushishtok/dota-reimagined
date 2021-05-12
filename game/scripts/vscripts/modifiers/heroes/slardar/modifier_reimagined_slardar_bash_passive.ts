import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { CreateBagOfGoldInPosition, CreateItemInPosition, GenerateRandomConsumableItem, IsInRiver, IsStunModifier } from "../../../lib/util";
import "./modifier_reimagined_slardar_bash_crusher_counter";

@registerModifier()
export class modifier_reimagined_slardar_bash_passive extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_bash: string = "Hero_Slardar.Bash";

	// Modifier specials
	bonus_damage?: number;
	duration?: number;
	attack_count?: number;

	// Reimagined properties
	ability_slithereen_crush_name: string = "reimagined_slardar_slithereen_crush";
	modifier_crusher: string = "modifier_reimagined_slardar_bash_crusher_counter";
	particle_basher_chain: string = "particles/heroes/slardar/slardar_basher_chain_proc.vpcf";
	particle_basher_chain_fx?: ParticleID;

	// Reimagined specials
	crusher_proc_count?: number;
	ocean_treasures_gold_bag_count?: number;
	ocean_treasures_gold_bag_gold_min?: number;
	ocean_treasures_gold_bag_gold_max?: number;
	ocean_treasures_item_duration?: number;

	IsHidden() {
		// Only show the counter when the value is not 0
		return this.GetStackCount() == 0;
	}

	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		this.GetAbilitySpecials();
	}

	OnRefresh(): void {
		this.GetAbilitySpecials();
	}

	GetAbilitySpecials(): void {
		// Modifier specials
		this.bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");
		this.duration = this.ability.GetSpecialValueFor("duration");
		this.attack_count = this.ability.GetSpecialValueFor("attack_count");

		// Reimagined specials
		this.crusher_proc_count = this.ability.GetSpecialValueFor("crusher_proc_count");
		this.ocean_treasures_gold_bag_count = this.ability.GetSpecialValueFor("ocean_treasures_gold_bag_count");
		this.ocean_treasures_gold_bag_gold_min = this.ability.GetSpecialValueFor("ocean_treasures_gold_bag_gold_min");
		this.ocean_treasures_gold_bag_gold_max = this.ability.GetSpecialValueFor("ocean_treasures_gold_bag_gold_max");
		this.ocean_treasures_item_duration = this.ability.GetSpecialValueFor("ocean_treasures_item_duration");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [
			ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL,
			ModifierFunction.TOOLTIP,
			// Reimagined: Ocean's Treasures: Killing a unit considered in the river will cause it to drop a random consumable and x bags of gold that last up to y seconds on the ground, or until picked up.
			ModifierFunction.ON_DEATH,
		];
	}

	GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number {
		// Ignores allies, wards or buildings
		if (event.target.IsBuilding()) return 0;
		if (event.target.IsOther()) return 0;
		if (event.target.GetTeamNumber() == this.parent.GetTeamNumber()) return 0;

		// Cannot be used by illusions
		if (this.parent.IsIllusion()) return 0;

		// Cannot be used when broken
		if (this.parent.PassivesDisabled()) return 0;

		// Check if we're in the threshold when attacking
		if (this.GetStackCount() == this.attack_count) {
			// Play bash sound
			this.parent.EmitSound(this.sound_bash);

			// Reimagined: Basher Chain: If the target is already stunned when proccing a bash, Bash of the Deep's stun duration is extended by the longest current stun duration.
			let duration = this.duration!;
			duration = this.ReimaginedBasherChain(duration, event.target);

			// Stun target
			event.target.AddNewModifier(this.caster, this.ability, BuiltInModifier.BASH, { duration: duration });

			// Reset stack count
			this.SetStackCount(0);

			// Reimagined: Crusher: Every x bash procs by this ability also casts Slithereen Crush for free.
			this.ReimaginedCrusherProc();

			// Deal bonus physical damage
			return this.bonus_damage!;
		}

		// Increment stack count
		this.IncrementStackCount();

		return 0;
	}

	OnTooltip(): number {
		return this.attack_count! + 1;
	}

	OnDeath(event: ModifierInstanceEvent) {
		if (!IsServer()) return;

		// // Only apply if the dying unit is an enemy
		// if (event.unit.GetTeamNumber() != this.parent.GetTeamNumber()) return;

		// // Only apply if the attacker is the parent
		// if (event.attacker != this.parent) return;

		// // Only apply if the dying unit is considered in a river terrain
		// if (!IsInRiver(event.unit)) return;

		// CreateBagOfGoldInPosition(10, 20, event.unit.GetAbsOrigin(), 30);
		// CreateItemInPosition(GenerateRandomConsumableItem(5), event.unit.GetAbsOrigin(), 30);
	}

	ReimaginedCrusherProc() {
		// Only procs if the caster has the Slithereen Crush ability and it is learned
		if (!this.parent.HasAbility(this.ability_slithereen_crush_name)) return;
		const ability_slithereen_crush = this.parent.FindAbilityByName(this.ability_slithereen_crush_name);
		if (!ability_slithereen_crush || !ability_slithereen_crush.IsTrained()) return;

		// Add the Crusher modifier
		let modifier_crusher;
		if (!this.parent.HasModifier(this.modifier_crusher)) {
			modifier_crusher = this.parent.AddNewModifier(this.parent, this.ability, this.modifier_crusher, {});
		} else {
			modifier_crusher = this.parent.FindModifierByName(this.modifier_crusher);
		}

		// Give it a stack
		if (modifier_crusher) {
			modifier_crusher.IncrementStackCount();
		}
	}

	ReimaginedBasherChain(current_duration: number, target: CDOTA_BaseNPC): number {
		// Check if the target's already stunned
		if (target.IsStunned()) {
			let modified_duration = false;
			const original_duration = current_duration;

			// Go over all modifiers of the target; find out the length of the longest stun
			for (const modifier of target.FindAllModifiers() as BaseModifier[]) {
				// Ignore "positive" stuns
				if (modifier.IsDebuff()) {
					if (IsStunModifier(modifier.GetName(), false)) {
						// Ignore permanent durations, increase duration to longest stun duration
						const modifier_duration = modifier.GetRemainingTime();
						if (modifier_duration != -1 && modifier_duration > current_duration) {
							current_duration = modifier_duration;
							modified_duration = true;
						}
					}
				}
			}

			// If the duration was modified, extend by the original bash's duration
			if (modified_duration) {
				current_duration += original_duration;

				// Play Basher Chain particle
				this.particle_basher_chain_fx = ParticleManager.CreateParticle(this.particle_basher_chain, ParticleAttachment.CUSTOMORIGIN, target);
				ParticleManager.SetParticleControlEnt(this.particle_basher_chain_fx, 0, target, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, target.GetAbsOrigin(), true);
				ParticleManager.ReleaseParticleIndex(this.particle_basher_chain_fx);
			}
		}

		return current_duration;
	}

	OnDestroy() {
		if (!IsServer()) return;

		// If for some reason this modifier is removed, also remove the crusher counter modifier
		const modifier_crusher = this.parent.FindModifierByName(this.modifier_crusher);
		if (modifier_crusher) {
			modifier_crusher.Destroy();
		}
	}
}
