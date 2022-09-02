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

## 如何安裝及啟動?

1. 下載原始碼
2. 完成 `config.json` 所需要的資料 ( Token、guild、HUBvcChannelID、DefaultRoleID、categoryID、owners )
2. `npm install`
3. `node index.js`

#### 完全無需輸入指令!
除了特定指令(管理員刪除、呼叫控制台)
其餘都是使用 Discord 互動系統 (按鈕、表單、選單)


## 大大大感謝

參考來自Autocode 平台上的 MeltedButter77 所做的 [Temp VCs](https://autocode.com/MeltedButter77/apps/tempvoice/)

## 一些功能演示

![Create VCs](https://media.discordapp.net/attachments/920732721981038712/1015285658857775154/VC1.gif)

![show/hide](https://media.discordapp.net/attachments/920732721981038712/1015285659105230858/VC2.gif?width=512&height=371)

![Lock](https://media.discordapp.net/attachments/920732721981038712/1015285659352711268/VC3.gif?width=512&height=371)

![ChangeRTC](https://cdn.discordapp.com/attachments/920732721981038712/1015291018880487444/VC4s.gif)

![ChangeOwner](https://media.discordapp.net/attachments/920732721981038712/1015285660158005460/VC5.gif?width=512&height=371)

![deleteVC](https://media.discordapp.net/attachments/920732721981038712/1015285660451622983/VC6.gif?width=512&height=371)

![deleteVConDisconnect](https://media.discordapp.net/attachments/920732721981038712/1015285660824895588/VC7.gif?width=512&height=371)
