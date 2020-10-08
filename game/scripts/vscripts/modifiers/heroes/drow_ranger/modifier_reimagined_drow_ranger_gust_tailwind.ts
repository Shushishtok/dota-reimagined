import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_drow_ranger_gust_tailwind extends BaseModifier
{
    // Modifier properties
    caster: CDOTA_BaseNPC = this.GetCaster()!;
    ability: CDOTABaseAbility = this.GetAbility()!; 
    parent: CDOTA_BaseNPC = this.GetParent();
    particle_tailwind = "particles/heroes/drow_ranger/gust_tailwind.vpcf";
    particle_tailwind_fx?: ParticleID;
    velocity?: Vector;

    // Modifier specials
    silence_duration?: number;
    tailwind_speed?: number;    
    tailwind_silence_radius?: number;

    IsHidden() {return false}
    IsDebuff() {return false}
    IsPurgable() {return false}

    OnCreated(): void
    {
        if (!IsServer()) return;

        // Modifier specials
        this.silence_duration = this.ability.GetSpecialValueFor("silence_duration");
        this.tailwind_speed = this.ability.GetSpecialValueFor("tailwind_speed");        
        this.tailwind_silence_radius = this.ability.GetSpecialValueFor("tailwind_silence_radius");

        // Play particle
        this.particle_tailwind_fx = ParticleManager.CreateParticle(this.particle_tailwind, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
        ParticleManager.SetParticleControl(this.particle_tailwind_fx, 0, this.parent.GetAbsOrigin());                
        this.AddParticle(this.particle_tailwind_fx, false, false, -1, false, false);

        this.StartIntervalThink(FrameTime());
    }

    OnIntervalThink()
    {        
        // Check if the caster wasn't caught: being stunned, out of world etc. will remove the modifier
        if (this.parent.IsStunned() || this.parent.IsOutOfGame() || this.parent.IsHexed() || this.parent.IsCurrentlyHorizontalMotionControlled() || this.parent.IsCurrentlyVerticalMotionControlled())
        {
            this.Destroy();
            return;
        }

        // Update particle location
        ParticleManager.SetParticleControl(this.particle_tailwind_fx!, 0, this.parent.GetAbsOrigin());

        // Move the parent in the direction it's currently facing
        let new_pos = (this.parent.GetAbsOrigin() + this.parent.GetForwardVector() * this.tailwind_speed! * FrameTime()) as Vector;
        new_pos = GetGroundPosition(new_pos, this.parent); 
        this.parent.SetAbsOrigin(new_pos);

        // Destroy trees in AoE
        GridNav.DestroyTreesAroundPoint(this.parent.GetAbsOrigin(), this.parent.GetHullRadius(), true);        

        // Apply silence on nearby enemies in AoE
        const enemies = FindUnitsInRadius(this.parent.GetTeamNumber(),
                                          this.parent.GetAbsOrigin(),
                                        undefined,
                                        this.tailwind_silence_radius!,
                                        UnitTargetTeam.ENEMY,
                                        UnitTargetType.HERO + UnitTargetType.BASIC,
                                        UnitTargetFlags.NONE,
                                        FindOrder.ANY,
                                        false);

        for (const enemy of enemies)
        {
            enemy.AddNewModifier(this.parent, this.ability, BuiltInModifier.SILENCE, {duration: this.silence_duration});    
        }                                        
    }

    DeclareFunctions(): ModifierFunction[]
    {
        return [ModifierFunction.OVERRIDE_ANIMATION,
                ModifierFunction.ON_ORDER]
    }

    GetOverrideAnimation(): GameActivity
    {
        return GameActivity.DOTA_FLAIL
    }

    OnOrder(event: ModifierUnitEvent): void
    {        
        if (!IsServer()) return;

        // Only apply if the parent is the one who issued the order
        if (event.unit != this.parent) return;        

        // Only apply on a stop command
        if (event.order_type == UnitOrder.HOLD_POSITION)
        {            
            this.Destroy();
        }
    }

    CheckState(): Partial<Record<ModifierState, boolean>>
    {
        return {[ModifierState.DISARMED]: true,
                [ModifierState.ROOTED]: true,
                [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true}
    }

    OnDestroy()
    {
        if (!IsServer()) return;

        if (this.parent.IsCurrentlyHorizontalMotionControlled() || this.parent.IsCurrentlyVerticalMotionControlled()) return;

        // Set the caster at a valid position
        FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), true);
        ResolveNPCPositions(this.parent.GetAbsOrigin(), this.parent.GetHullRadius());
    }
}