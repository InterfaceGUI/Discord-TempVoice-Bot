const { Client, PermissionsBitField, Permissions, TextInputComponent, MessageSelectMenu, UserSelectMenuBuilder, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType, RoleSelectMenuBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js')
const { config } = require('./config')

const flooter = {
    "text": "TempVCs by Larshagrid#2620 | ver 2023.5.31",
    "iconURL": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
}

const HubEmbed = new EmbedBuilder()
    .setTitle(`臨時私人語音聊天`)
    .setColor(0x00B9FF)
    .setDescription(
        `加入 <#${config.HUBvcChannelID}> 來創建您自己的Temp VC，您將成為房主。 預設為隱藏，除非手動點選按鈕開啟全線!`,
    )
    .setFooter(flooter)

const AdminForceDelete = new EmbedBuilder()
    .setTitle(`管理員以使用強制清除指令!`)
    .setColor(0xe80000)
    .setFooter(flooter)

const consoleembed = new EmbedBuilder()
    .setTitle("臨時私人語音聊天控制")
    .setDescription("**使用下面的按鈕可以快速更改一些設置！**. \n以下是按鈕的說明:\n\n使用 `Lock/Unlock` 鎖定 VC，以便只有列入白名單的用戶才能連接.\n使用 `Hide/Unhide` 將 VC 設為私有，以便只有列入白名單的用戶才能看到 VC。\n使用 `Mute/Unmute` 只允許白名單用戶發言，只影響新加入的用戶.\n使用 `Ban/Unban` 禁止指定用戶加入VC. \n使用 `Whitelist/Remove` 白名單.\n使用 `Limit` 限制可以加入的用戶數量.\n使用 `Change Owner` 轉讓包廂房主.\n使用 `Change Name` 將 VC 的名稱更改為您想要的任何名稱。 （記得遵守規則）\n使用 `Get Mention` 獲取語音邀請網址，立即邀請他們加入到語音頻道！!\n\n 轉讓房主會將原先的限制權限清除!!。")
    .setColor(0x00B9FF)
    .setFooter(flooter)

const Whitelisttembed = new EmbedBuilder()
    .setTitle('白名單清單')
    .setColor(0xaf40de)
    .setAuthor({
        name: "拉斯的私人語音包廂助理",
        iconURL: "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
    })

const banliste = new EmbedBuilder()
    .setTitle('封鎖清單')
    .setColor(0xaf40de)
    .setAuthor({
        name: "拉斯的私人語音包廂助理",
        iconURL: "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
    })

const predelete_Cancel = new EmbedBuilder()
    .setTitle("刪除已取消!")
    .setDescription(`排定的刪除程序已取消!`)
    .setColor(0x02cf21)
    .setAuthor({
        name: "拉斯的私人語音包廂助理",
        iconURL: "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
    })

const predelete = new EmbedBuilder()
    .setTitle("已排定刪除!")
    .setColor(0xff0000)
    .setAuthor({
        name: "拉斯的私人語音包廂助理",
        iconURL: "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
    })

const ownerLeave = new EmbedBuilder()
    .setTitle("房主已離開語音包廂")
    //.setDescription(`房主已離開 <#${tempVcId}>。 \n頻道將於 <t:${Math.floor(Date.now() / 1000) + 180}:R> 刪除。 \n如要取消，請重新加入語音頻道。`)
    .setColor(0x00B9FF)
    .setFooter(flooter)
    .setAuthor({
        name: "拉斯的私人語音包廂助理",
        iconURL: "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
    })
module.exports = {
    embedFlooter: flooter,
    createHubEmbed: HubEmbed,
    adminDeleteEmbed: AdminForceDelete,
    controlsEmbed: consoleembed,
    whitelist_Embed: Whitelisttembed,
    banlist_Embed: banliste,
    CancelPreDelete_Embed: predelete_Cancel,
    predelete_Embed: predelete,
    ownerLeave_Embed: ownerLeave
}