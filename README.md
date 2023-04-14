<details> <summary>中文說明</summary>

# Discord 語音包廂 BOT

## 概述
想要在Discord裡面有個不被打擾或是不想給別人加入的語音頻道
但是又不想麻煩管理員為了你而特別開設頻道?
或是語音地區出問題? 想更換但管理員都不再線上
又或者有破壞規矩、故意騷擾的用戶在，想要將他踢出語音頻道?

這Bot剛好可以達成您的需求!
私人語音包廂可以讓一般使用者無需特別權限就能建立語音頻道

並且有獨立的控制專區，可以讓開房的房主做到:
1. 踢人 
2. Ban人(對某人隱藏語音頻道)
3. 隱藏頻道
4. 頻道上鎖 (看的到 但無法加入)
5. 自訂頻道名稱
6. 更改語音地區 
7. 白名單 
8. 限制人數
9. 禁音其他人 (對後來加入的有效)

對伺服器主人有:
1. 限定預設身分組
2. 一鍵清除所有包廂
3. 房主離開超過3分鐘自動清除語音頻道
4. Log紀錄


#### 完全無需輸入指令!
除了特定指令(管理員刪除、呼叫控制台)
其餘都是使用 Discord 互動系統 (按鈕、表單、選單)

## 如何安裝及啟動?

1. 下載原始碼
2. 完成 `config.json` 所需要的資料 ( Token、guild、HUBvcChannelID、DefaultRoleID、categoryID、owners )
2. 安裝必要元件 `npm install`
3. 啟動bot `node tempVCs.js`



## 大感謝

靈感來自Autocode 平台上的 MeltedButter77 所做的 [Temp VCs](https://autocode.com/MeltedButter77/apps/tempvoice/)

<hr><br><br>

</details>

# Discord Temp Voice Channel Bot

This BOT allows the average user to create channels, edit names, numbers, visibility,etc.
without the need for administrator intervention!

And with the independent control interface, users can do:
1. Kick the user out of the voice channel.
2. Block the user from the voice channel.
3. Set a maximum number of users.
4. Change the region of the voice channel.
5. Change the name of the voice channel.
6. Set a whitelist.
7. Mute new users who join after the mute has been applied.
8. Hide the channel.
9. Lock the channel.

Server owners can:
1. Set the default role.
2. Clear all temp vcs
3. Log

And all temp vc will automatically clear the voice channel when the user leaves for more than 3 minutes


## Install

1. Download Repository
2. Fill in the necessary information in `config.json` <br> ( Token、guild、HUBvcChannelID、DefaultRoleID、categoryID、owners )
2. `npm install`
3. `node tempVCs.js`


This program is inspired by  [Temp VCs](https://autocode.com/MeltedButter77/apps/tempvoice/) made by MeltedButter77 on the Autocode platform


## Docker compose
```yml
version: "3.9"
services:
  DiscordWelcomeBot:
    image: "ghcr.io/interfacegui/discord-temp-vc-bot:latest"
    environment:
      TOKEN: "YOUR Discord TOKEN"
      SERVER_ID: "YOUR Discord ServerID"
      CATEGORY_ID: "Your category ID"
      HUB_ID: "Your HUB Voice Channel ID"
      ROLE_ID: "Defualt role | if you use @everyone pls put server id here"
      PREFIX: "["
      OWNERS: "123456,123456 "
```

### Environmental Variables

* `TOKEN`
Discord bot token

* `SERVER_ID`
Your server ID

* `CATEGORY_ID`
Category ID

* `HUB_ID`
Hub voice channel ID<br>

* `ROLE_ID`
Defualt role<br>
VC Show/Lock will use this role<br>
If you want to use `@everyone` please place the ServerID here

* `PREFIX`
The command perfix to create Hub text.

* `OWNERS`
Administrator ID
If there are more than one, please separate them with a comma(`,`)<br>
Note: There must not be any spaces!

## Demo

![Create VCs](https://media.discordapp.net/attachments/920732721981038712/1015285658857775154/VC1.gif)

![show/hide](https://media.discordapp.net/attachments/920732721981038712/1015285659105230858/VC2.gif?width=512&height=371)

![Lock](https://media.discordapp.net/attachments/920732721981038712/1015285659352711268/VC3.gif?width=512&height=371)

![ChangeRTC](https://cdn.discordapp.com/attachments/920732721981038712/1015291018880487444/VC4s.gif)

![ChangeOwner](https://media.discordapp.net/attachments/920732721981038712/1015285660158005460/VC5.gif?width=512&height=371)

![deleteVC](https://media.discordapp.net/attachments/920732721981038712/1015285660451622983/VC6.gif?width=512&height=371)

![deleteVConDisconnect](https://media.discordapp.net/attachments/920732721981038712/1015285660824895588/VC7.gif?width=512&height=371)
