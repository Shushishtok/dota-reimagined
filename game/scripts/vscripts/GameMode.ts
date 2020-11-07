import { reloadable } from "./lib/tstl-utils";
import { GetTalentAbilityFromNumber, GetTalentNumber, IsTalentAbility, PrepareTalentList } from "./lib/util";

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
    Game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
    last_waiting_talent_num?: number;    

    public static Precache(this: void, context: CScriptPrecacheContext) 
    {           
        print("Precaching sounds");     
        PrecacheResource("soundfile", "soundevents/custom_sounds.vsndevts", context);
    }

    public static Activate(this: void) 
    {
        GameRules.Addon = new GameMode();
    }

    constructor() 
    {
        this.configure();
        
    }

    public configure()
    {
        this.RegisterEvents();
        this.RmgGameRules();
    }

    RegisterEvents()
    {
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
        ListenToGameEvent("dota_player_gained_level", event => this.OnPlayerLevelUp(event), undefined);
        ListenToGameEvent("player_chat", event => this.OnPlayerChat(event), undefined);
        CustomGameEventManager.RegisterListener("learn_talent_event", (_, event) => this.OnLearnTalent(event, 0));
        CustomGameEventManager.RegisterListener("send_currently_selected_unit", (_,event) => this.OnSentCurrentlySelectedUnit(event))
    }

    RmgGameRules()
    {
        // Max level!        
        this.Game.SetCustomXPRequiredToReachNextLevel(
            {             
                [0]: 0, 
                [1]: 230, // total XP to level up to level 2                
                [2]: 600,  // total XP to level up to level 3, etc...
                [3]: 1080,
                [4]: 1660,
                [5]: 2260,
                [6]: 2980,
                [7]: 3730,
                [8]: 4620,
                [9]: 5550,
                [10]: 6520,
                [11]: 7530,
                [12]: 8580,
                [13]: 9805,
                [14]: 11055,
                [15]: 12330,
                [16]: 13630,
                [17]: 14955,
                [18]: 16455,
                [19]: 18045,
                [20]: 19645,
                [21]: 21495,
                [22]: 23595,
                [23]: 25945,
                [24]: 28545,
                [25]: 32045,
                [26]: 36545,
                [27]: 42045,
                [28]: 48545,
                [29]: 56045,
                [30]: 66045,
                [31]: 76045,
                [32]: 86045,
                [33]: 96045,
                [34]: 106045,
                [35]: 116045,
                [36]: 126045,
                [37]: 136045,
                [38]: 146045,
                [39]: 156045,                
            }
        );
        
        this.Game.SetUseCustomHeroLevels(true);
    }

    private OnLearnTalent(event: {ability: EntityIndex; PlayerID: PlayerID}, learned_by_force: 0 | 1)    
    {     
        const ability_handle = EntIndexToHScript(event.ability) as CDOTABaseAbility;
        const caster = (ability_handle.GetCaster() as CDOTA_BaseNPC_Hero)
        const player = PlayerResource.GetPlayer(event.PlayerID)!;           

        // Serverside verification check. Networking 101: don't trust your client
        // If ability was already leveled, do nothing.        
        if (ability_handle.GetLevel() > 0) return;
        
        // Verify ability is actually a talent
        if (!IsTalentAbility(ability_handle)) return;
        
        // If the caster is not a real hero, do nothing
        if (!caster.IsRealHero()) return;                

        const talent_num = GetTalentNumber(ability_handle);        
        if (!talent_num) return;        

        // Only allow to level up talents for yourself, unless this is a forced level, or it is cheat mode        
        if (learned_by_force == 1 || ability_handle.GetCaster() == player.GetAssignedHero() || GameRules.IsCheatMode())
        {                
            // If caster doesn't have any ability points to spend, do nothing
            if (learned_by_force == 0 && caster.GetAbilityPoints() == 0) return;    
            
            // Finished verification!
            // Level up the ability
            ability_handle.SetLevel(1);
    
            // Do not spend an ability point if talent was learned by force
            if (learned_by_force == 0)
            {
                // Otherwise reduce as usual
                caster.SetAbilityPoints(caster.GetAbilityPoints() -1);
            }
            
            // Add talent that was legitimately leveled to the set        
            caster.talents_learned.add(ability_handle);

            print(talent_num, learned_by_force);
            // Send confirmation event to the client        
            CustomGameEventManager.Send_ServerToPlayer(player, "confirm_talent_learned", {talent_num: talent_num, learned_by_force: learned_by_force})
        }
    }

    private ForceLearnTalent(hero: CDOTA_BaseNPC_Hero, talent_num: number, playerID: PlayerID)
    {
        let event: {ability: EntityIndex; PlayerID: PlayerID};        

        // Get ability as talent        
        const ability = GetTalentAbilityFromNumber(hero, talent_num);
        if (ability)
        {
            // Form the event call
            event = {ability: ability.GetEntityIndex(), PlayerID: playerID};

            // Call talent
            this.OnLearnTalent(event, 1);
        }        
    }

    OnSentCurrentlySelectedUnit(event: {unit: EntityIndex, PlayerID: PlayerID})
    {
        const unit = EntIndexToHScript(event.unit) as CDOTA_BaseNPC_Hero;

        // Verification
        if (!GameRules.IsCheatMode()) return;
        if (!unit.IsRealHero()) return;
        if (!this.last_waiting_talent_num) return;

        this.ForceLearnTalent(unit, this.last_waiting_talent_num!, event.PlayerID);

        // Remove last waiting talent
        this.last_waiting_talent_num = undefined;
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
        let unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;

        if (unit.IsRealHero())
        {            
            // Initialize the talents ability map if it's not initialized yet
            if (!(unit as CDOTA_BaseNPC_Hero).talentMap) unit.talentMap = PrepareTalentList(unit);

            // Initialize the talents learned set if it's not initialized yet
            if (!(unit as CDOTA_BaseNPC_Hero).talents_learned) unit.talents_learned = new Set();                    
        }
    }

    private OnPlayerLevelUp(event: DotaPlayerGainedLevelEvent)
    {
        // Handle the stupid automatic level 30 "HAVE ALL TALENTS FOR FREE" talents. Fucking bullshit I swear
        Timers.CreateTimer(FrameTime(), () =>
        {            
            if (event.level == 30)
            {                
                const caster = EntIndexToHScript(event.hero_entindex) as CDOTA_BaseNPC_Hero;                
                
                // Iterate between all caster's abilities
                for (let index = 0; index < caster.GetAbilityCount(); index++) 
                {
                    const ability = caster.GetAbilityByIndex(index);                
                    if (ability)
                    {                        
                        if (ability.GetAbilityName().indexOf("special_bonus") !== -1)
                        {                            
                            if (ability.IsTrained() && !caster.talents_learned.has(ability))
                            {                                
                                ability.SetLevel(0);                                
                            }
                        }
                    }
                }
    
                // Iterate between all caster's modifiers
                for (const modifier of caster.FindAllModifiers())
                {                    
                    if (modifier.GetName().indexOf("special_bonus") !== -1)
                    {                        
                        if (!caster.talents_learned.has(modifier.GetAbility()!))
                        {                            
                            modifier.Destroy();
                        }
                    }
                }
            }
        })
    }

    OnPlayerChat(event: PlayerChatEvent)
    {
        if (!GameRules.IsCheatMode()) return;

        if (event.text.indexOf("-learntalent") !== -1)
        {            
            const numText = event.text.substr(event.text.length-1);            
            if (numText !== "" && numText !== undefined && numText !== null)
            {                
                const talent_num = Number(numText);                
                if (!isNaN(talent_num))
                {                    
                    if (talent_num >= 1 && talent_num <= 8)
                    {                               
                        const player = PlayerResource.GetPlayer(event.playerid)!;
                        this.last_waiting_talent_num = talent_num;

                        CustomGameEventManager.Send_ServerToPlayer(player, "request_currently_selected_unit", {});
                    }
                }
            }
        }
    }
}
