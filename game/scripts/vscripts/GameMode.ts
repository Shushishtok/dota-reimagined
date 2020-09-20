import { reloadable } from "./lib/tstl-utils";

const heroSelectionTime = 30;

declare global 
{
    interface CDOTAGamerules 
    {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode 
{
    public static Precache(this: void, context: CScriptPrecacheContext) 
    {                
        PrecacheResource("soundfile", "soundevents/custom_sounds.vsndevts", context);
    }

    public static Activate(this: void) 
    {
        GameRules.Addon = new GameMode();
    }

    constructor() 
    {
        this.configure();
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
    }

    public configure()
    {

    }

    public OnStateChange(): void 
    {
        const state = GameRules.State_Get();     
    }

    private StartGame(): void 
    {
        print("Game starting!");

        // Do some stuff here
    }

    // Called on script_reload
    public Reload() 
    {
        print("Script reloaded!");

        // Do some stuff here
    }    

    private OnNpcSpawned(event: NpcSpawnedEvent) 
    {
        // After a hero unit spawns, apply modifier_panic for 8 seconds
        // const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // if (unit.IsRealHero()) {
        //     Timers.CreateTimer(1, () => {
        //         unit.AddNewModifier(unit, undefined, "modifier_panic", { duration: 8 });
        //     });

        //     if (!unit.HasAbility("meepo_earthbind_ts_example")) {
        //         // Add lua ability to the unit
        //         unit.AddAbility("meepo_earthbind_ts_example");
        //     }
        // }
    }
}
