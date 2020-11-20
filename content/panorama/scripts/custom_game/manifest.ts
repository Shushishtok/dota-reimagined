interface CustomGameEventDeclarations
{
    custom_chat_message: {isTeam: boolean, textData: string, playerID: PlayerID, ability_name: string | undefined}
}

class CustomChat
{
    hudPanel?: Panel
    chatContainerPanel?: Panel
    NON_BREAKING_SPACE = "\u00A0";
    BASE_MESSAGE_INDENT = this.NON_BREAKING_SPACE.repeat(19);

    constructor()
    {
        this.GetHudPanel();
        this.GetChatContainerPanel();
        this.RegisterEvents()
    }

    RegisterEvents()
    {
        GameEvents.Subscribe("custom_chat_message", (event) => this.OnChatMessage(event));
    }

    GetHudPanel()
    {
        let currentPanel = $.GetContextPanel();
        while (currentPanel.id !== "DotaHud")
        {
            currentPanel = currentPanel.GetParent()!;
        }
        this.hudPanel = currentPanel;
    }

    GetChatContainerPanel()
    {
        this.chatContainerPanel = this.hudPanel!.FindChildTraverse("ChatLinesPanel")!;
    }

    OnChatMessage(event: {isTeam: 0 | 1, textData: string, playerID: PlayerID, ability_name: string | undefined})
    {
        let text = this.BASE_MESSAGE_INDENT;

        const message = $.CreatePanelWithProperties("Label", this.chatContainerPanel!, "",
        {
            class: "ChatLine",
            html: "true",
            selectionpos: "auto",
            hittest: "false",
            hittestchildren: "false",
        });
        message.style.flowChildren = "right";
        message.style.color = "#faeac9";
        message.style.opacity = 1;
        $.Schedule(7, () =>
        {
            message.style.opacity = null;
        });

        if (event.playerID > -1)
        {
            const playerInfo = Game.GetPlayerInfo(event.playerID);
            const playerColor = "#" + this.intToARGB(Players.GetPlayerColor(event.playerID));


            text += event.isTeam ? `[${$.Localize("#DOTA_ChatCommand_GameAllies_Name")}] ` : this.NON_BREAKING_SPACE;
            text += `<font color='${playerColor}'>${playerInfo.player_name}</font>: `;

            $.CreatePanelWithProperties("Panel", message, "", { class: "HeroBadge", selectionpos: "auto" });

            const heroIcon = $.CreatePanelWithProperties("Image", message, "", { class: "HeroIcon", selectionpos: "auto" });
            heroIcon.SetImage("file://{images}/heroes/" + playerInfo.player_selected_hero + ".png");
        }
        else
        {
            text += event.isTeam ? `[${$.Localize("#DOTA_ChatCommand_GameAllies_Name")}] ` : this.NON_BREAKING_SPACE;
        }

        text += event.textData.replace(/%%\d*(.+?)%%/g, (_, token) => $.Localize(token));
        if (event.ability_name != undefined)
        {
            text = GameUI.ReplaceDOTAAbilitySpecialValues(event.ability_name, text)!;
        }

        message.text = text;
	    var inlineImages = message.FindChildrenWithClassTraverse("InlineImage")
        for(let chatIcon of inlineImages)
        {
		    chatIcon.AddClass( "ChatWheelIcon" )
	    }
    }

    intToARGB(i: number): string
    {
        return ('00' + ( i & 0xFF).toString( 16 ) ).substr( -2 ) +
                ('00' + ( ( i >> 8 ) & 0xFF ).toString( 16 ) ).substr( -2 ) +
                ('00' + ( ( i >> 16 ) & 0xFF ).toString( 16 ) ).substr( -2 ) +
                ('00' + ( ( i >> 24 ) & 0xFF ).toString( 16 ) ).substr( -2 );
    }
}

let customChat = new CustomChat();
