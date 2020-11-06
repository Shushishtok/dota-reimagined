class PickScreen
{
    constructor()
    {        
        this.RemoveTalentIcon();        
    }

    RemoveTalentIcon()
    {
        const heroContainerPanel = this.GetContextPanel().FindChildTraverse("PreGame")!.FindChildTraverse("MainContents")!.FindChildTraverse("ScreenContainer")!.FindChildTraverse("HeroPickScreen")!.FindChildTraverse("HeroPickScreenContents")!.FindChildTraverse("MainHeroPickScreenContents")!.FindChildTraverse("HeroPickRightColumn")!.FindChildTraverse("HeroInspect")!.FindChildTraverse("HeroAbilities")!;
        $.Msg("Found something!");
        if (heroContainerPanel)
        {            
            $.Msg(heroContainerPanel.id)
            $.Msg("Collapsed!");
            $.Schedule(0.03, () => this.LocateTalentIcon(heroContainerPanel))
        }
    }

    LocateTalentIcon(heroContainerPanel: Panel)
    {
        // If the game state changed, stop trying
        if (!Game.GameStateIs(DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION))
        {
            return;
        }

        // Try to find the StatBranch class element.
        const talentIcon = heroContainerPanel.FindChildrenWithClassTraverse("StatBranch")![0];
        if (talentIcon)
        {
            // Found it? Great! Make it invisible.
            talentIcon.style.visibility = "collapse";

            // But keep trying in case it appears again! (whenever another hero is chosen)
            $.Schedule(0.03, () => this.LocateTalentIcon(heroContainerPanel));
        }
        else
        {
            // Nope.... try again.
            $.Schedule(0.03, () => this.LocateTalentIcon(heroContainerPanel));
        }
    }

    GetContextPanel(): Panel
    {
        return $.GetContextPanel().GetParent()!.GetParent()!.GetParent()!
    }
}

let pickscreen = new PickScreen;