import "../vscripts/modifiers/general_mechanics/modifier_reimagined_charges";
import "../vscripts/modifiers/general_mechanics/modifier_reimagined_courier_passive_bonuses";
import "../vscripts/modifiers/general_mechanics/modifier_reimagined_game_mechanics";
import { BaseTalent } from "./lib/talents";
import { reloadable } from "./lib/tstl-utils";
import { GetAllChargesModifiersForUnit, GetAllPlayers, GetTalentAbilityFromNumber, GetTalentNumber, IsRoshan, IsTalentAbility, PrepareTalentList, RegisterFunctionOverrides } from "./lib/util";
import "../vscripts/lib/better_cooldown";

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
    // Game Properties
    Game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
    wtf_mode_enabled: boolean = false;

    // Talents
    talent_count: number = 8;
    last_waiting_talent_num?: number;
    talent_ping_map: Map<PlayerID, number> = new Map();

    // XP and gold
    xp_multiplier = 250;
    gold_multiplier = 250;
    gold_per_tick: number = 1;
    gold_interval: number = 0.35;

    // Respawn rules
    minimum_respawn_timer_neutral_death: number = 26;
    respawn_increase_interval: number = 5; // Minutes
    respawn_increase_scale: number = 3;
    level_respawn_time: Map<number, number> = new Map();
    max_respawn_time: number = 100; // Does not includes buyback or Reaper's Scythe respawn increase
    buyback_respawn_timer_increase = 15;

    // Rune rules
    bounty_runes_spawn_interval = 5 // Minutes
    power_runes_spawn_interval = 2 // Minutes
    power_runes_next_spawner: number = RandomInt(1, 2);
    first_power_runes_time: number = 4 // Minutes
    runespawnerMap: Map<EntityIndex, number> = new Map();

    // Buyback rules
    buyback_cooldown: number = 240;

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
        this.AssignMechanicsModifier();
        this.PrepareRespawnTimers();
        this.RegisterFilters();
        RegisterFunctionOverrides();
    }

    RegisterEvents()
    {
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);
        ListenToGameEvent("dota_player_gained_level", event => this.OnPlayerLevelUp(event), undefined);
        ListenToGameEvent("player_chat", event => this.OnPlayerChat(event), undefined);
        ListenToGameEvent("server_pre_shutdown", event => this.OnServerPreShutdown(event), undefined);
        ListenToGameEvent("server_shutdown", event => this.OnServerShutdown(event), undefined);
        ListenToGameEvent("entity_killed", event => this.OnEntityKilled(event), undefined);
        CustomGameEventManager.RegisterListener("learn_talent_event", (_, event) => this.OnLearnTalent(event, 0));
        CustomGameEventManager.RegisterListener("send_currently_selected_unit", (_,event) => this.OnSentCurrentlySelectedUnit(event))
        CustomGameEventManager.RegisterListener("ping_talent", (_,event) => this.OnPingTalent(event))
    }

    RegisterFilters()
    {
        this.Game.SetModifyExperienceFilter(event => this.ExperienceModifiedFilter(event), this);
        this.Game.SetModifyGoldFilter(event => this.GoldModifiedFilter(event), this);
        this.Game.SetRuneSpawnFilter(event => this.RuneSpawnFilter(event), this);
        this.Game.SetExecuteOrderFilter(event => this.ExecuteOrderFilter(event), this)
    }

    ExperienceModifiedFilter(event: ModifyExperienceFilterEvent): boolean
    {
        // Only multiply XP given by kills
        if (event.reason_const == ModifyXpReason.CREEP_KILL || event.reason_const == ModifyXpReason.HERO_KILL || event.reason_const == ModifyXpReason.ROSHAN_KILL)
        {
            event.experience = event.experience * this.xp_multiplier * 0.01;
        }

        return true;
    }

    GoldModifiedFilter(event: ModifyGoldFilterEvent): boolean
    {
        // Only multiply gold given by kills
        if (event.reason_const == ModifyGoldReason.HERO_KILL || event.reason_const == ModifyGoldReason.WARD_KILL || event.reason_const == ModifyGoldReason.CREEP_KILL || event.reason_const == ModifyGoldReason.ROSHAN_KILL || event.reason_const == ModifyGoldReason.COURIER_KILL || event.reason_const == ModifyGoldReason.NEUTRAL_KILL)
        {
            event.gold = event.gold * this.gold_multiplier * 0.01;
        }

        return true;
    }

    // This actually seems to completely ignore bounty runes, which sucks
    RuneSpawnFilter(event: RuneSpawnFilterEvent): boolean
    {
        const spawner = EntIndexToHScript(event.spawner_entindex_const);
        let classname;
        if (spawner) classname = spawner.GetClassname();

        // Map the power rune spawners
        if (!this.runespawnerMap.has(event.spawner_entindex_const))
        {
            this.runespawnerMap.set(event.spawner_entindex_const, this.runespawnerMap.size + 1);
        }

        // Ignore any power runes that try to appear before the first runes should show up
        if (GameRules.GetGameTime() < this.first_power_runes_time * 60) return false;

        // Get the mapped index
        const spawnerIndex = this.runespawnerMap.get(event.spawner_entindex_const);
        if (spawnerIndex != this.power_runes_next_spawner) return false;

        // Generate a new location for the next rune
        this.power_runes_next_spawner = RandomInt(1, 2);

        return true;
    }

    ExecuteOrderFilter(event: ExecuteOrderFilterEvent): boolean
    {
        const units: CDOTA_BaseNPC[] = []
        for (const [string, entityIndex] of Object.entries(event.units))
        {
            const unit = EntIndexToHScript(entityIndex) as CDOTA_BaseNPC;
            if (unit)
            {
                units.push(unit);
            }
        }

        // Abilities: Check if ability exists in the order
        if (event.entindex_ability)
        {
            // Ability-specific orders - only triggerd on single units
            if (units.length == 1)
            {
                // Transform into ability entity
                const ability = EntIndexToHScript(event.entindex_ability) as CDOTABaseAbility;

                // Check if the ability has ExecuteOrderFilter defined, if so, return its result
                if (ability && ability.ExecuteOrderFilter)
                {
                    return ability.ExecuteOrderFilter(event);
                }
            }
        }

        return true;
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
        this.Game.SetCustomDireScore(0);
        this.Game.SetFreeCourierModeEnabled(true);
        this.Game.SetRuneEnabled(RuneType.BOUNTY, true);
        this.Game.SetRuneEnabled(RuneType.ARCANE, true);
        this.Game.SetRuneEnabled(RuneType.DOUBLEDAMAGE, true);
        this.Game.SetRuneEnabled(RuneType.HASTE, true);
        this.Game.SetRuneEnabled(RuneType.ILLUSION, true);
        this.Game.SetRuneEnabled(RuneType.INVISIBILITY, true);
        this.Game.SetRuneEnabled(RuneType.REGENERATION, true);
        this.Game.SetRuneEnabled(RuneType.XP, false);
        this.Game.SetMaximumAttackSpeed(1400);
        this.Game.SetMinimumAttackSpeed(75);
        this.Game.SetCustomScanCooldown(120);
        this.Game.SetFountainPercentageHealthRegen(10);
        this.Game.SetFountainPercentageManaRegen(20);
        this.Game.SetRandomHeroBonusItemGrantDisabled(true);
        this.Game.SetUseDefaultDOTARuneSpawnLogic(true);
        GameRules.SetStartingGold(1200);
        GameRules.EnableCustomGameSetupAutoLaunch(true);
        GameRules.SetCustomGameSetupAutoLaunchDelay(0);
        GameRules.SetCustomGameSetupRemainingTime(0);
        GameRules.SetCustomGameSetupTimeout(30);
        GameRules.SetHeroSelectionTime(30);
        GameRules.SetHeroSelectPenaltyTime(15);
        GameRules.SetCustomGameBansPerTeam(5);
        GameRules.SetPostGameTime(30);
        GameRules.SetPreGameTime(30);
        GameRules.SetSameHeroSelectionEnabled(false);
        GameRules.SetShowcaseTime(0);
        GameRules.SetStrategyTime(10);
        GameRules.SetTreeRegrowTime(240);
    }

    AssignMechanicsModifier(): void
    {
        // Find the good team's fountain
        const fountain = Entities.FindAllByName("ent_dota_fountain_good")[0] as CDOTA_BaseNPC;
        if (fountain)
        {
            fountain.AddNewModifier(fountain, undefined, "modifier_reimagined_game_mechanics", {});
        }
    }

    PrepareRespawnTimers()
    {
        const level_respawn_times =
        [
            3, // level 1
            4, // level 2
            5, // level 3
            6, // level 4
            7, // level 5
            8, // level 6
            9, // level 7
            10, // level 8
            11, // level 9
            12, // level 10
            14, // level 11
            16, // level 12
            18, // level 13
            20, // level 14
            22, // level 15
            24, // level 16
            26, // level 17
            28, // level 18
            30, // level 19
            32, // level 20
            35, // level 21
            38, // level 22
            41, // level 23
            44, // level 24
            47, // level 25
            50, // level 26
            53, // level 27
            56, // level 28
            59, // level 29
            60, // level 30
            60, // level 31
            60, // level 32
            60, // level 33
            60, // level 34
            60, // level 35
            60, // level 36
            60, // level 37
            60, // level 38
            60, // level 39
            60 // level 40
        ]

        // Set the map
        for (let level = 1; level <= level_respawn_times.length; level++)
        {
            const respawn_time = level_respawn_times[level - 1];
            this.level_respawn_time.set(level, respawn_time);
        }
    }

    GetTimeToRespawn(level: number): number
    {
        let respawn_time: number = 3;

        // Fetch value based on level
        if (this.level_respawn_time.has(level))
        {
            respawn_time = this.level_respawn_time.get(level)!;
        }

        // Increase respawn timer based on game time
        let gametime = GameRules.GetGameTime();
        gametime = gametime / 60; // Turn into minutes

        // Check how many instances of game time has elapsed, rounded down.
        const instances = math.floor(gametime / this.respawn_increase_interval);

        // Calculate how many seconds should be added to the respawn time
        const game_time_increase = instances * this.respawn_increase_scale;
        respawn_time += game_time_increase;

        // Up to a maximum value
        respawn_time = math.min(respawn_time, this.max_respawn_time);

        return respawn_time;
    }

    SetRespawnTimeForHero(hero: CDOTA_BaseNPC_Hero, attacker: EntityIndex)
    {
        // If hero is going to reincarnate, leave it alone
        if (hero.IsReincarnating()) return;

        // Set the death timer
        const hero_level = hero.GetLevel();
        let respawn_time = this.GetTimeToRespawn(hero_level);

        // Check if the death was due to a neutral creep: if so, set the minimum value
        let killer;
        if (attacker)
        {
            killer = EntIndexToHScript(attacker);

            if (killer && killer.IsBaseNPC())
            {
                if (killer.IsNeutralUnitType() || IsRoshan(killer))
                {
                    respawn_time = math.max(respawn_time, this.minimum_respawn_timer_neutral_death);
                }
            }
        }

        // If the hero recently bought back, increase timer and remove the tag
        if (hero.recently_buyback)
        {
            respawn_time += this.buyback_respawn_timer_increase;
            hero.recently_buyback = false;
        }

        hero.SetTimeUntilRespawn(respawn_time);
    }

    OnEntityKilled(event: EntityKilledEvent)
    {
        if (event.entindex_killed)
        {
            const killed_unit = EntIndexToHScript(event.entindex_killed);
            if (!killed_unit) return;

            if (killed_unit.IsBaseNPC())
            {
                if (killed_unit.IsRealHero())
                {
                    this.SetRespawnTimeForHero(killed_unit, event.entindex_attacker);
                }
            }
        }

        if (event.entindex_attacker)
        {
            const killing_unit = EntIndexToHScript(event.entindex_attacker)
            if (!killing_unit) return;

            if (killing_unit.IsBaseNPC())
            {
                if (killing_unit.IsRealHero())
                {
                    if (killing_unit.GetTeamNumber() == DotaTeam.BADGUYS)
                    {
                        GameRules.GetGameModeEntity().SetCustomDireScore(GetTeamHeroKills(DotaTeam.BADGUYS));
                    }
                }
            }
        }
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

    private ForceUnlearnTalent(hero: CDOTA_BaseNPC_Hero, talent_num: number)
    {
        // Unlearning talents can only be done in cheats mode!
        if (!GameRules.IsCheatMode()) return;

        // Get ability as talent
        const ability = GetTalentAbilityFromNumber(hero, talent_num) as BaseTalent
        if (ability && ability.IsTrained() && ability.isTalentAbility)
        {
            // Remove the ability
            ability.SetLevel(0);

            // Remove its associated modifier
            const modifier_name: string = "modifier_" + ability.GetAbilityName();
            if (modifier_name)
            {
                const modifier_handle = hero.FindModifierByName(modifier_name);
                if (modifier_handle)
                {
                    modifier_handle.Destroy();
                }
            }
        }
    }

    OnSentCurrentlySelectedUnit(event: {unit: EntityIndex, PlayerID: PlayerID})
    {
        const unit = EntIndexToHScript(event.unit) as CDOTA_BaseNPC_Hero;

        // Verification
        if (!GameRules.IsCheatMode()) return;
        if (!unit.IsRealHero()) return;
        if (!this.last_waiting_talent_num) return;

        // 10 signals "learn all talents"
        if (this.last_waiting_talent_num == 10)
        {
            for (let index = 1; index <= this.talent_count; index++)
            {
                this.ForceLearnTalent(unit, index, event.PlayerID);
            }
        }
        // -10 signals "unlearn all talents"
        else if (this.last_waiting_talent_num == -10)
        {
            for (let index = 1; index < this.talent_count; index++)
            {
                this.ForceUnlearnTalent(unit, index);
            }
        }
        // Negative talent number signals "unlearn this talent"
        else if (this.last_waiting_talent_num < 0)
        {
            this.ForceUnlearnTalent(unit, this.last_waiting_talent_num! * (-1))
        }
        else // Learn a single talent
        {
            this.ForceLearnTalent(unit, this.last_waiting_talent_num!, event.PlayerID);
        }

        // Remove last waiting talent
        this.last_waiting_talent_num = undefined;
    }

    public OnStateChange(): void
    {
        const state = GameRules.State_Get();

        if (state == GameState.TEAM_SHOWCASE)
        {
            this.ForceRandomHeroForPlayersWithoutHeroes();
        }

        if (state == GameState.PRE_GAME)
        {
            this.BuybackRules();
            this.GrantItemsForRandomHeroes();
        }

        if (state == GameState.GAME_IN_PROGRESS)
        {
            this.Game.SetBountyRuneSpawnInterval(this.bounty_runes_spawn_interval * 60);
            this.Game.SetPowerRuneSpawnInterval(this.power_runes_spawn_interval * 60);

            // Rune reveal
            Timers.CreateTimer(() =>
            {
                this.RevealBountyRunes();
                return this.bounty_runes_spawn_interval;
            })

            // Gold Tick system
            this.StartGoldTick();
        }
    }

    StartGoldTick()
    {
        Timers.CreateTimer(this.gold_interval, () =>
        {
            const players = GetAllPlayers();
            const heroes = players.map(player => player.GetAssignedHero());
            for (const hero of heroes)
            {
                // Just some verifications, can't be too sure
                if (hero && IsValidEntity(hero) && hero.IsRealHero() && !hero.IsNull())
                {
                    if (hero.courier && hero.courier.IsAlive())
                    {
                        hero.ModifyGold(this.gold_per_tick, true, ModifyGoldReason.GAME_TICK);
                    }
                }
            }

            return this.gold_interval;
        })
    }

    ForceRandomHeroForPlayersWithoutHeroes(): void
    {
        for (const player of GetAllPlayers())
        {
            if (player)
            {
                if (!PlayerResource.HasSelectedHero(player.GetPlayerID()))
                {
                    player.MakeRandomHeroSelection();
                    PlayerResource.SetHasRandomed(player.GetPlayerID());
                }
            }
        }
    }

    GrantItemsForRandomHeroes(): void
    {
        for (const player of GetAllPlayers())
        {
            if (player)
            {
                if (PlayerResource.HasRandomed(player.GetPlayerID()))
                {
                    let attempts = 0;

                    Timers.CreateTimer(FrameTime(), () =>
                    {
                        if (player.GetAssignedHero())
                        {
                            player.GetAssignedHero().AddItemByName("item_reimagined_enchanted_mango");
                            player.GetAssignedHero().AddItemByName("item_reimagined_enchanted_mango");
                            player.GetAssignedHero().AddItemByName("item_faerie_fire");

                            return undefined;
                        }

                        // If you tried more than 100 times, just give up, that's not going to happen
                        attempts++;
                        if (attempts > 100) return undefined;

                        return FrameTime();
                    })
                }
            }
        }
    }

    RevealBountyRunes(): void
    {
        const bounty_spawners = Entities.FindAllByClassname("dota_item_rune_spawner_bounty");
        for (const bounty_spawner of bounty_spawners)
        {
            AddFOWViewer(DotaTeam.GOODGUYS, bounty_spawner.GetAbsOrigin(), 100, FrameTime(), true);
            AddFOWViewer(DotaTeam.BADGUYS, bounty_spawner.GetAbsOrigin(), 100, FrameTime(), true);
        }
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

        // Real heroes
        if (unit.IsRealHero())
        {
            // Initialize the talents ability map if it's not initialized yet
            if (!(unit as CDOTA_BaseNPC_Hero).talentMap) unit.talentMap = PrepareTalentList(unit);

            // Initialize the talents learned set if it's not initialized yet
            if (!(unit as CDOTA_BaseNPC_Hero).talents_learned) unit.talents_learned = new Set();
        }

        // Couriers
        if (unit.IsCourier())
        {
            Timers.CreateTimer(FrameTime(), () =>
            {
                // Assign to hero of the same player
                const playerID = unit.GetPlayerOwnerID();
                if (playerID && PlayerResource.IsValidTeamPlayer(playerID))
                {
                    const player = PlayerResource.GetPlayer(playerID);
                    if (player)
                    {
                        const hero = player.GetAssignedHero();
                        if (!hero.courier) hero.courier = unit;
                    }
                }

                // Replace the passive bonuses modifiers with the reimagined modifier
                if (unit.HasModifier("modifier_courier_passive_bonus"))
                {
                    unit.RemoveModifierByName("modifier_courier_passive_bonus");
                    unit.AddNewModifier(undefined, undefined, "modifier_reimagined_courier_passive_bonuses", {});
                }
            })
        }

        // Dummies
        if (unit.GetUnitName() == "reimagined_npc_dummy_unit")
        {
            // Find dummy ability
            if (unit.HasAbility("reimagined_dummy_unit_state"))
            {
                const dummy_ability = unit.FindAbilityByName("reimagined_dummy_unit_state");
                if (dummy_ability)
                {
                    dummy_ability.SetLevel(1);
                }
            }
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

        // Refresh the modifier of the courier assigned to the hero
        const hero = EntIndexToHScript(event.hero_entindex) as CDOTA_BaseNPC;
        if (hero.IsRealHero())
        {
            if (hero.courier)
            {
                const modifier = hero.courier.FindModifierByName("modifier_reimagined_courier_passive_bonuses");
                if (modifier)
                {
                    modifier.ForceRefresh();
                }
            }
        }
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
                    if (talent_num >= 1 && talent_num <= this.talent_count)
                    {
                        const player = PlayerResource.GetPlayer(event.playerid)!;
                        this.last_waiting_talent_num = talent_num;

                        CustomGameEventManager.Send_ServerToPlayer(player, "request_currently_selected_unit", {});
                    }
                }
            }
        }
        // For learning all talents, we use 10 as code
        else if (event.text.indexOf("-learnalltalents") !== -1)
        {
            const player = PlayerResource.GetPlayer(event.playerid)!;
            this.last_waiting_talent_num = 10;

            CustomGameEventManager.Send_ServerToPlayer(player, "request_currently_selected_unit", {});
        }

        // For unlearning a talent, we use negative talent number values
        else if (event.text.indexOf("-unlearntalent") !== -1)
        {
            const numText = event.text.substr(event.text.length-1);
            if (numText !== "" && numText !== undefined && numText !== null)
            {
                const talent_num = Number(numText);
                if (!isNaN(talent_num))
                {
                    if (talent_num >= 1 && talent_num <= this.talent_count)
                    {
                        const player = PlayerResource.GetPlayer(event.playerid)!;
                        this.last_waiting_talent_num = talent_num * (-1);

                        CustomGameEventManager.Send_ServerToPlayer(player, "request_currently_selected_unit", {});
                    }
                }
            }
        }
        // For unlearning all talents, we use negative talents -10 as code
        else if (event.text.indexOf("-unlearnalltalents") !== -1)
        {
            const player = PlayerResource.GetPlayer(event.playerid)!;
            this.last_waiting_talent_num = -10;

            CustomGameEventManager.Send_ServerToPlayer(player, "request_currently_selected_unit", {});
        }
        // Refresh - extend to charges
        else if (event.text === "-refresh")
        {
            // Get the player's hero
            const player = PlayerResource.GetPlayer(event.playerid)!;
            const hero = player.GetAssignedHero();

            // Find all its charges modifiers, if any
            const charge_modifiers = GetAllChargesModifiersForUnit(hero);
            if (charge_modifiers)
            {
                for (const charge_modifier of charge_modifiers)
                {
                    // Refresh them
                    charge_modifier.MaximizeChargeCount();
                }
            }
        }
        // Apply the flag for wtf mode
        else if (event.text === "-wtf")
        {
            if (this.wtf_mode_enabled) return;

            this.wtf_mode_enabled = true;

            // Get the player's hero
            const player = PlayerResource.GetPlayer(event.playerid)!;
            const hero = player.GetAssignedHero();

            // Find all its charges modifiers, if any
            const charge_modifiers = GetAllChargesModifiersForUnit(hero);
            if (charge_modifiers)
            {
                for (const charge_modifier of charge_modifiers)
                {
                    // Trigger WTF mode on charges
                    charge_modifier.OnWTFModeTriggered();
                }
            }
        }
        else if (event.text === "-unwtf")
        {
            if (!this.wtf_mode_enabled) return;

            this.wtf_mode_enabled = false;
        }
    }

    OnPingTalent(event: {ability: EntityIndex, status: TalentStatus, PlayerID: PlayerID}): void
    {
        // Get information
        const ability_handle = EntIndexToHScript(event.ability) as CDOTABaseAbility;
        const caster = ability_handle.GetCaster() as CDOTA_BaseNPC_Hero;
        const player = PlayerResource.GetPlayer(event.PlayerID)!;

        // Validation
        if (!IsValidEntity(ability_handle)) return;

        // Spam prevention
        if (this.talent_ping_map.has(event.PlayerID))
        {
            let spam_times = this.talent_ping_map.get(event.PlayerID)!;
            if (spam_times >= 3)
            {
                return;
            }
            else
            {
                spam_times++;
                this.talent_ping_map.set(event.PlayerID, spam_times);
                if (spam_times >= 3)
                {
                    Timers.CreateTimer(3, () =>
                    {
                        this.talent_ping_map.set(event.PlayerID, 0);
                    })
                }
            }
        }
        else
        {
            this.talent_ping_map.set(event.PlayerID, 1);
        }

        // Make the text based on the type of the ability form
        const ability_name = ability_handle.GetAbilityName();
        let talent_status_string;
        switch (event.status)
        {
            case TalentStatus.LEARNED:
                talent_status_string = "#DOTA_Reimagined_Talent_Learned";
                break;

            case TalentStatus.CAN_BE_LEARNED:
                talent_status_string = "#DOTA_Reimagined_Talent_Can_Be_Learned";
                break;

            case TalentStatus.NOT_LEARNED:
                talent_status_string = "#DOTA_Reimagined_Talent_Not_Learned";
                break;

            case TalentStatus.UNLEARNABLE:
                talent_status_string = "#DOTA_Reimagined_Talent_Cannot_Be_Learned";
                break;
            default:
                break;
        }

        // In the custom chat message event, everything in "%%x%%" will be localized clientside
        let text = "";
        if (caster != player.GetAssignedHero())
        {
            if (caster.GetTeamNumber() != player.GetTeamNumber())
            {
                text = "%%#DOTA_Reimagined_Talent_Ping_Enemy%% " + "%%" + caster.GetUnitName() + "%%" + "'s talent ";
            }
            else
            {
                text = "%%#DOTA_Reimagined_Talent_Ping_Ally%% " + "%%" + caster.GetUnitName() + "%%" + "'s talent ";
            }
        }

        // Form the final text and send
        text += "%%#DOTA_Tooltip_Ability_" + ability_name + "%% " + '<img src="file://{images}/control_icons/chat_wheel_icon.png" style="margin-top: 4px; width:10px;height:10px" width="10" height="10" > ' + " %%" + talent_status_string + "%%";
        CustomGameEventManager.Send_ServerToTeam(player.GetTeamNumber(), "custom_chat_message", {textData: text, playerID: event.PlayerID, isTeam: true, ability_name: ability_name});
    }

    OnServerPreShutdown(event: ServerPreShutdownEvent)
    {
        print(event.reason);
    }

    OnServerShutdown(event: ServerShutdownEvent)
    {
        print(event.reason);
    }

    BuybackRules()
    {
        this.Game.SetBuybackEnabled(true);
        this.Game.SetCustomBuybackCooldownEnabled(true);

        for (const player of GetAllPlayers())
        {
            PlayerResource.SetCustomBuybackCooldown(player.GetPlayerID(), this.buyback_cooldown);
        }
    }
}
