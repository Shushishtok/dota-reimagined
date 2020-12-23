import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class reimagined_antimage_mana_overload extends BaseAbility
{
    // Ability properties
    caster: CDOTA_BaseNPC = this.GetCaster();
    sound_blink_out: string = "Hero_Antimage.Blink_out";
    sound_blink_in: string = "Hero_Antimage.Blink_in";
    particle_blink_start: string = "particles/units/heroes/hero_antimage/antimage_blink_start.vpcf";
    particle_blink_start_fx?: ParticleID;
    modifier_antimage_illusion: string = "modifier_antimage_blink_illusion";
    blink_fragment_illusions: CDOTA_BaseNPC_Hero[] = [];

    // Ability specials
    duration?: number;
    outgoing_damage?: number;
    incoming_damage?: number;

    OnInventoryContentsChanged(): void
    {
        // Check if the caster now has scepter
        if (this.caster.HasScepter())
        {
            this.SetHidden(false);
            if (this.GetLevel() < 1)
            {
                this.SetLevel(1);
            }
        }
        else
        {
            this.SetHidden(true);
        }
    }

    OnUpgrade(): void
    {
        // Ability specials
        this.duration = this.GetSpecialValueFor("duration");
        this.outgoing_damage = this.GetSpecialValueFor("outgoing_damage");
        this.incoming_damage = this.GetSpecialValueFor("incoming_damage");
    }

    OnSpellStart(): void
    {
        // Get target position
        const target_position = this.GetCursorPosition();

        // Play blink-out sound
        this.caster.EmitSound(this.sound_blink_out);

        // Create blink particle
        this.particle_blink_start_fx = ParticleManager.CreateParticle(this.particle_blink_start, ParticleAttachment.WORLDORIGIN, undefined);
        ParticleManager.SetParticleControl(this.particle_blink_start_fx, 0, this.caster.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(this.particle_blink_start_fx);

        // Create illusion at target position and get it (only one)
        const illusion = CreateIllusions(this.caster,
                        this.caster as CDOTA_BaseNPC_Hero,
                        {incoming_damage: this.incoming_damage,
                        outgoing_damage: this.outgoing_damage,
                        duration: this.duration},
                        1,
                        this.caster.GetHullRadius(),
                        false,
                        true)[0];

        // Set illusion at target point
        illusion.SetAbsOrigin(target_position);
        FindClearSpaceForUnit(illusion, target_position, true);
        ResolveNPCPositions(target_position, illusion.GetHullRadius());

        // Set it on the ability to allow Counterspell to target it
        this.blink_fragment_illusions.push(illusion);

        // Remove it after the duration ends
        Timers.CreateTimer(this.duration!, () =>
        {
            this.blink_fragment_illusions.shift();
        })

        // Give illusion the uncontrollable illusion modifier
        illusion.AddNewModifier(this.caster, this, this.modifier_antimage_illusion, {duration: this.duration});

        // Play blink-in sound
        illusion.EmitSound(this.sound_blink_in);
    }
}
