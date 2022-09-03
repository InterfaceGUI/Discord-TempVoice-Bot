//Discord Client
const { Client, Intents, MessageActionRow, MessageButton ,Permissions ,Modal ,TextInputComponent , MessageSelectMenu} = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,"GUILDS",Intents.FLAGS.GUILD_VOICE_STATES] })
const { SlashCommandBuilder } = require('@discordjs/builders');
//Importing Rest & api-types
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

//Loading Config
const config = require('./config.json')
console.log('Config Loaded')
var owners = config.owners

//import LevelUP levelDown 
const { Level } = require('level')
const db = new Level('./db', { valueEncoding: 'json' })

var guild;
var RTCRegions;
var removeTimeouts = {};
var removeTimeoutsMsg = {};

var removeTimeouts2 = {};
var removeTimeoutsMsg2 = {};

//Ready Event
client.on('ready', async () => {
	console.log(`${client.user.tag} is Ready!`)
	
	/*
	client.user.setPresence({
		status: "online",
		activities: [{
			name: config.status,
			type: "LISTENING",
		}]
	})
	*/

	RTCRegions = await client.fetchVoiceRegions()
	guild = await client.guilds.cache.get(config.guild);
	await guild.members.fetch().then(console.log).catch(/*console.error*/);
	await guild.roles.fetch().then(console.log).catch(/*console.error*/);
	/*
	console.log(guild)
	console.log(guild.roles.everyone)
	console.log(RTCRegions)
	*/

	//CreateControlMsg();
	
	//Registering Slash
	if (config.enable_slash) {
		const rest = new REST({ version: '9' }).setToken(config.token)

		const commands = [{
			name: 'vc-fix',
			description: '修復TempVCs',
			default_member_permissions:'0'
		},{
			name: 'vc-hubmsg',
			description: '建立HUB訊息',
			default_member_permissions:'0'
		},{
			name: 'vc-control',
			description: '呼叫主控台'
		}]
		
		try {
			console.log('Started refreshing application (/) commands.')
			
			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: commands },
			);

			console.log('Successfully reloaded application (/) commands.')
		}
		catch (error) {
			console.error(error)
		}
	}

})

client.on('voiceStateUpdate', async (oldMember, newMember) => {
	
	let newUserChannel = newMember.channelId;
	let userid = newMember.id;

	/*
	console.log(newMember)
	console.log('User:',userid)
	console.log('channel:',newUserChannel);   
	console.log('=======')
	*/
	
	let tempVcId = await db.get(`tempVcIdKey_${userid}`).catch(err => {}) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempTimestamp = await db.get(`tempTimestampKey_${userid}`).catch(err => {}) //= await kvs1.get('tempTimestampKey_'+userid);

	/*
	console.log('kvsVCid',tempVcId)
	console.log('kvsTS',tempTimestamp)
	*/

	if (newUserChannel == config.HUBvcChannelID){
		if (typeof tempVcId === 'undefined'){
			setTimeout(MoveUser, 1500, userid,newMember)
			return
		}
	}

	if (typeof tempVcId === 'undefined') return

	if (!newUserChannel || newUserChannel != tempVcId){
		if (typeof tempVcId !== 'undefined'){
			if (removeTimeouts2[userid]) return
			if (removeTimeouts[userid]) return
			let embeds = {
				"type": "rich",
				"title": "房主已離開語音包廂",
				"description": `房主已離開 <#${tempVcId}>。 \n頻道將於 <t:${Math.floor(Date.now() / 1000) + 180}:R> 刪除。 \n如要取消，請重新加入語音頻道。`,
				"color": "0x00B9FF",
				"author": {
				  "name": "拉斯的私人語音包廂助理",
				  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
				}
			}
			
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			if (!Vc){
				await db.del(`tempVcIdKey_${userid}`).catch(err => {console.log('kv del error!')})
				await db.del(`tempmsgIdKey_${userid}`).catch(err => {console.log('kv del error!')})
				await db.del(`tempTimestampKey_${userid}`).catch(err => {console.log('kv del error!')})
				return
			}
			let msg = await Vc.send({content:`<@${newMember.id}>`, embeds: [embeds]})
			let tout = setTimeout(RemoveVTChannels, 180000, userid, tempVcId)
			removeTimeouts[userid] = tout
			removeTimeoutsMsg[userid] = msg.id
		} 
	}

	if (newUserChannel == tempVcId){
		if (removeTimeouts[userid]){
			clearTimeout(removeTimeouts[userid])
			delete removeTimeouts[userid]
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			let Controlmsg = await Vc.messages.fetch(`${removeTimeoutsMsg[userid]}`)
			await Controlmsg.delete().catch(() => {})
		}
	}
	
})
async function RemoveMsg(msg){

	await msg.delete().catch(() => {})

}

async function MoveUser(userid,Member) {
	let newVCid = await CreatVTChannels(userid);
	await Member.setChannel(newVCid).catch(err => {/*remove channel*/} )
}

async function RemoveVTChannels(UserID,VCID){

	delete removeTimeouts2[UserID]
	delete removeTimeouts[UserID]
	let VC = guild.channels.cache.find(channel => channel.id == VCID)
	if (typeof VC !== 'undefined') VC.delete().catch(() => {console.log('VC delete error')})
	await db.del(`tempVcIdKey_${UserID}`).catch(err => {console.log('kv del error!')})
	await db.del(`tempmsgIdKey_${UserID}`).catch(err => {console.log('kv del error!')})
	await db.del(`tempTimestampKey_${UserID}`).catch(err => {console.log('kv del error!')})

}

async function CreatVTChannels(UserID){

	let User = client.users.cache.find(user => user.id == UserID)

	let newTempVoiceChannel = await guild.channels.create(`${User.username}'s VC`, {
		type: 'GUILD_VOICE',
		parent: config.categoryID,
		permissionOverwrites: [
			{
				id: config.DefaultRoleID,
				allow: [Permissions.FLAGS.VIEW_CHANNEL],
			},
			{
				id: UserID,
				allow: [Permissions.FLAGS.CONNECT],
			},
			{
				id: UserID,
				allow: [Permissions.FLAGS.SPEAK],
			},
		],
	});
	await newTempVoiceChannel.lockPermissions().catch(console.error);
	await newTempVoiceChannel.permissionOverwrites.edit(UserID,{SPEAK:true,CONNECT:true,VIEW_CHANNEL:true})
	let msg = await newTempVoiceChannel.send(await CreateControlMsg(UserID,User.username))

	//console.log("newVC",newTempVoiceChannel)
	await db.put(`tempVcIdKey_${UserID}`, newTempVoiceChannel.id).catch(err => {console.log('kv save error!')})
	await db.put(`tempmsgIdKey_${UserID}`, msg.id).catch(err => {console.log('kv save error!')})
	await db.put(`tempTimestampKey_${UserID}`, Date.now()/1000).catch(err => {console.log('kv save error!')})
	return newTempVoiceChannel.id
	//await kvs1.set('tempVcIdKey_'+UserID,newTempVoiceChannel.id);
	//await kvs1.set('tempTcIdKey_'+UserID,newTempTxTChannel.id);
	//await kvs1.set('tempTimestampKey_'+UserID,Date.now());
	
}

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isModalSubmit() && !interaction.isButton() && !interaction.isSelectMenu() && !interaction.isCommand()) return 

	let textchannel = interaction.channel
	let user = interaction.user
	let tempVcId = await db.get(`tempVcIdKey_${user.id}`).catch(err => {}) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempmsgid = await db.get(`tempmsgIdKey_${user.id}`).catch(err => {}) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempTimestamp = await db.get(`tempTimestampKey_${user.id}`).catch(err => {}) //= await kvs1.get('tempVcIdKey_'+userid);

	let VC = guild.channels.cache.find(channel => channel.id == tempVcId)

	if (interaction.isSelectMenu()) 
	{
		
		if (interaction.customId === 'select_ban') 
		{
			
			if (interaction.values[0].startsWith("_R")){
				
				let banrole = guild.roles.cache.find(role => role.id == interaction.values[0].replace("_R",""))

				//console.log(await VC.permissionsFor(banrole.id))
				let VCPermissions = await VC.permissionsFor(banrole.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				
				let viewchannel = VCPermissions.VIEW_CHANNEL?  false: null

				//console.log(VCPermissions)
				await VC.permissionOverwrites.edit(banrole.id,{VIEW_CHANNEL:viewchannel})
				await interaction.update({ content: `OK. The Permission is update.\n${banrole} ${VCPermissions.VIEW_CHANNEL? "Now can see this channel.":"Now cannot see this channel."} `, components: [] });
				

			}
			else
			{

				let kickUser = guild.members.cache.find(user => user.id == interaction.values[0])
				if (kickUser.voice.channelId == VC.id) await kickUser.voice.disconnect()

				let banUserid = client.users.cache.find(user => user.id == interaction.values[0])

				let VCPermissions = await VC.permissionsFor(banUserid.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				
				let viewchannel = VCPermissions.VIEW_CHANNEL?  false: null

				//console.log(VCPermissions)
				await VC.permissionOverwrites.edit(banUserid.id,{VIEW_CHANNEL:viewchannel})
				await interaction.update({ content: `OK. The Permission is update.\n${banUserid} ${VCPermissions.VIEW_CHANNEL? "Now can see this channel.":"Now cannot see this channel."} `, components: [] });
				
			}
			return 
		}
		else if (interaction.customId === 'select_kick') 
		{
			
			let kickUser = guild.members.cache.find(user => user.id == interaction.values[0])
			
			await kickUser.voice.disconnect()
			return await interaction.update({ content: `OK. GoodBye ${kickUser}.`, components: [] });
			 
		}
		else if (interaction.customId === 'select_changeowner') 
		{
			
			let newUser = guild.members.cache.find(user => user.id == interaction.values[0])
			//console.log(`${newUser.nickname?newUser.nickname:newUser.user.username}'s VC`)

			await VC.permissionOverwrites.edit(user.id,{VIEW_CHANNEL:null})

			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			let VCPermissions = await VC.permissionsFor(config.DefaultRoleID).serialize()
			Controlmsg.edit(await CreateControlMsg(newUser.id,newUser.user.username,VCPermissions))
			if (removeTimeouts[user.id]) {
				clearTimeout(removeTimeouts[user.id])
				delete removeTimeouts[userid]
				let Controlmsg = await VC.messages.fetch(`${removeTimeoutsMsg[userid]}`)
				await Controlmsg.delete().catch(() => {})
			}
			
			if (removeTimeouts2[user.id]) return await interaction.update({ content: `No. Vc is delete now.`, components: [] });

			await db.del(`tempVcIdKey_${user.id}`).catch(err => {console.log('kv del error!')})
			await db.del(`tempmsgIdKey_${user.id}`).catch(err => {console.log('kv del error!')})
			await db.del(`tempTimestampKey_${user.id}`).catch(err => {console.log('kv del error!')})

			await db.put(`tempVcIdKey_${newUser.id}`, tempVcId).catch(err => {console.log('kv save error!')})
			await db.put(`tempmsgIdKey_${newUser.id}`, tempmsgid).catch(err => {console.log('kv save error!')})
			await db.put(`tempTimestampKey_${newUser.id}`, tempTimestamp).catch(err => {console.log('kv save error!')}) 
			
			await interaction.update({ content: `OK. GoodBye ${user}.`, components: [] });
			
			await VC.setName(`${newUser.nickname?newUser.nickname:newUser.user.username}'s VC`).catch(err => {console.log('kv save error!')})
			return 
			 
		}
		else if (interaction.customId === 'select_role') 
		{
			
			if (interaction.values[0].startsWith("_R")){
				
				let wrole = guild.roles.cache.find(role => role.id == interaction.values[0].replace("_R",""))

				//console.log(await VC.permissionsFor(wrole.id))
				let VCPermissions = await VC.permissionsFor(wrole.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				
				let viewchannel = VCPermissions.VIEW_CHANNEL? false: true

				//console.log(VCPermissions)
				await VC.permissionOverwrites.edit(wrole.id,{VIEW_CHANNEL:viewchannel})
				await interaction.update({ content: `OK. The Permission is update.\n${wrole} ${VCPermissions.VIEW_CHANNEL? "Now can see this channel.":"Now cannot see this channel."} `, components: [] });
				
			}
			else
			{

				let wUserid = client.users.cache.find(user => user.id == interaction.values[0])

				let VCPermissions = await VC.permissionsFor(wUserid.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				
				let viewchannel = VCPermissions.VIEW_CHANNEL?  false: true

				//console.log(VCPermissions)
				await VC.permissionOverwrites.edit(wUserid.id,{VIEW_CHANNEL:viewchannel})
				await interaction.update({ content: `OK. The Permission is update.\n${wUserid} ${VCPermissions.VIEW_CHANNEL? "Now can see this channel.":"Now cannot see this channel."} `, components: [] });
				
			}
			return 
		}
		else if (interaction.customId === 'select_Region') 
		{
			
			await VC.setRTCRegion(interaction.values[0]=="null"?null:interaction.values[0])
			
			return await interaction.update({ content: `OK. VC RTCRegion now is ${VC.rtcRegion?VC.rtcRegion:"Auto"}.`, components: [] });
			
			 
		}

	}
	else if (interaction.isModalSubmit()) 
	{

		if (interaction.customId === 'modal_limit') {
			
			let inputnum = interaction.fields.getTextInputValue('_value')
			if (isNaN(Number(inputnum))||Number(inputnum) > 99 || Number(inputnum) < 0) return interaction.reply({content: "Please enter the correct value by the owner before pressing the button.\n請輸入正確的數量後再按下按鈕。",ephemeral: true }).catch(err => {VC.send("Unknow Error. Pls try again.")})
			
			await VC.setUserLimit(Number(inputnum))
			return interaction.reply({content: `OK. The UserLimit is set to ${Number(inputnum)}.\n好的，最大語音人數已設定為${Number(inputnum)}.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
		
		}
		else if (interaction.customId === 'modal_ban') 
		{
			await interaction.deferReply({ephemeral: true})
			let value = interaction.fields.getTextInputValue('_value').toLowerCase()
			
			let Krole = await guild.roles.cache.filter(role => String(role.name).toLowerCase().includes(value))

			let banUser = await guild.members.cache.filter(user => String(user.user.username).toLowerCase().includes(value) )
			//console.log(banUser)
			
			
			if (banUser.size < 1 && Krole.size < 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			const row = new MessageActionRow()
			var options = []

			if (banUser.size  >= 1) {
				var index = 0
				banUser.forEach((user) => {
					index += 1
					if(index <= 25) {
						if (user.id == interaction.user.id) return
						options.push({
							label: user.user.username,
							description: user.nickname?user.nickname:user.user.username,
							value: user.id,
						})
					}
				});
			}

			if (Krole.size  >= 1) {
				var index = 0
				Krole.forEach((role) => {
					index += 1
					if(index <= 25) {
						options.push({
							label: role.name,
							description: "Role",
							value: `_R${role.id}`,
						})
					}
				});
			}

				if (options.length < 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
				//console.log(options.size)
				let msmComponents = new MessageSelectMenu()
				.setCustomId('select_ban')
				.setPlaceholder('Nothing selected')
				.addOptions(options)
				row.addComponents(msmComponents);
			
			
			return await interaction.editReply({ content: 'Multiple duplicate names were found, please select the one you want.', components: [row] ,ephemeral: true});
			
		}
		else if (interaction.customId === 'modal_whitelist') 
		{
			await interaction.deferReply({ephemeral: true})
			let value = interaction.fields.getTextInputValue('_value').toLowerCase()
			
			let wUser = await guild.members.cache.filter(user => String(user.user.username).toLowerCase().includes(value) )
			
			let wrole = await guild.roles.cache.filter(role => String(role.name).toLowerCase().includes(value))

			//console.log(banUser)
			if (wUser.size < 1 && wrole.size < 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			const row = new MessageActionRow()
			var options = []
			if (wUser.size  >= 1) {

				
				var index = 0
				wUser.forEach((user) => {
					index += 1
					if(index <= 25) {
						if (user.id == interaction.user.id) return
						options.push({
							label: user.user.username,
							description: user.nickname?user.nickname:user.user.username,
							value: user.id,
						})
					}
				});
			}
			if (wrole.size  >= 1) {
				var index = 0
				wrole.forEach((role) => {
					index += 1
					if(index <= 25) {
						options.push({
							label: role.name,
							description: "Role",
							value: `_R${role.id}`,
						})
					}
				});
			}

			if (options.length < 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			//console.log(options.size)
			let msmComponents = new MessageSelectMenu()
			.setCustomId('select_role')
			.setPlaceholder('Nothing selected')
			.addOptions(options)
			row.addComponents(msmComponents);
			
			
			return await interaction.editReply({ content: 'Multiple duplicate names were found, please select the one you want.', components: [row] ,ephemeral: true});
			
		}
		else if (interaction.customId === 'modal_changename') 
		{
			await interaction.deferReply({ephemeral: true})
			let inputstr = interaction.fields.getTextInputValue('_value')

			await VC.setName(inputstr)
			return interaction.editReply({content: `OK. VC name is set to ${inputstr}.\n好的，已將名子更改為${inputstr}.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
		
		}

	}
	else if (interaction.isButton()) 
	{

		
		if (tempVcId != textchannel.id) {
			return await interaction.reply({content: "Uhhhhh... This is not your VC.",ephemeral: true }).catch(err => {console.log(err)})
		}

		let VCPermissions = await VC.permissionsFor(config.DefaultRoleID).serialize()
		//console.log(VCPermissions)

		if (interaction.customId === "button_lock") {

			await interaction.deferReply({ephemeral: true })
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			var VcPermissions = VCPermissions
			
			//console.log(VCPermissions)
			VcPermissions.CONNECT = !VcPermissions.CONNECT
			await VC.permissionOverwrites.edit(user.id,{CONNECT:true})
			await VC.permissionOverwrites.edit(config.DefaultRoleID,{CONNECT:VcPermissions.CONNECT})
			
			
			await Controlmsg.edit(await CreateControlMsg(user.id ,user.username ,VcPermissions ))
			await interaction.editReply({content: `Now everyone **can${!VcPermissions.CONNECT?"not** ":"** "}connect to this channel.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			return
			
		}
		else if (interaction.customId === "button_hide") 
		{
			await interaction.deferReply({ephemeral: true })
			var VcPermissions = VCPermissions
			VcPermissions.VIEW_CHANNEL = ! VcPermissions.VIEW_CHANNEL
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			//console.log(VCPermissions)
			await VC.permissionOverwrites.edit(user.id,{VIEW_CHANNEL:true})
			await VC.permissionOverwrites.edit(config.DefaultRoleID,{VIEW_CHANNEL:VcPermissions.VIEW_CHANNEL})

			await Controlmsg.edit(await CreateControlMsg(user.id ,user.username ,VcPermissions ))
			await interaction.editReply({content: `Now everyone **can${!VcPermissions.VIEW_CHANNEL?"not** ":"** "}see this channel.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			return
		}
		else if (interaction.customId === "button_mute") 
		{
			await interaction.deferReply({ephemeral: true })

			var VcPermissions = VCPermissions
			VcPermissions.SPEAK = ! VcPermissions.SPEAK
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			
			//console.log(VCPermissions)
			await VC.permissionOverwrites.edit(user.id,{SPEAK:true})
			await VC.permissionOverwrites.edit(config.DefaultRoleID,{SPEAK:VcPermissions.SPEAK})
			
			await Controlmsg.edit(await CreateControlMsg(user.id ,user.username ,VcPermissions ))
			await interaction.editReply({content: `Now new join user **can${VcPermissions.SPEAK?"**":"not**"} Speak.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			return
		}
		else if (interaction.customId === "button_limit") 
		{

			const modal = new Modal()
				.setCustomId('modal_limit')
				.setTitle('Set User limit');
			const MessageInput = new TextInputComponent()
				.setCustomId("_value")
				.setLabel("User limit")
				.setPlaceholder("Type number here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
				.setStyle("SHORT")
			modal.addComponents(new MessageActionRow().addComponents(MessageInput));
			return await interaction.showModal(modal);

		}
		else if (interaction.customId === "button_ban") 
		{

			const modal = new Modal()
				.setCustomId('modal_ban')
				.setTitle('Ban someone');
			const MessageInput = new TextInputComponent()
				.setCustomId("_value")
				.setLabel("User Name")
				.setPlaceholder("Type name here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(4000)
				.setStyle("SHORT")
			modal.addComponents(new MessageActionRow().addComponents(MessageInput));
			return await interaction.showModal(modal);

		}
		else if (interaction.customId === "button_kick") 
		{
			await interaction.deferReply({ephemeral: true})
			let kickUser = VC.members
			
			//console.log(banUser)
			if (kickUser.size <= 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			const row = new MessageActionRow()
			
			if (kickUser.size  > 1) {
				var options = []
				var index = 0
				kickUser.forEach((user) => {
					if (user.id == interaction.user.id) return
					index += 1
					if(index <= 25) {
						options.push({
							label: user.user.username,
							description: user.nickname?user.nickname:user.user.username,
							value: user.id,
						})
					}
				});
				
				let msmComponents = new MessageSelectMenu()
				.setCustomId('select_kick')
				.setPlaceholder('Nothing selected')
				.addOptions(options)
				row.addComponents(msmComponents);
			}
			
			return await interaction.editReply({ content: 'Please select the one you want.', components: [row] ,ephemeral: true});
			

		}
		else if (interaction.customId === "button_changename") 
		{

			const modal = new Modal()
				.setCustomId('modal_changename')
				.setTitle('Change VC Name');
			const MessageInput = new TextInputComponent()
				.setCustomId("_value")
				.setLabel("Name")
				.setPlaceholder("Type name here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(4000)
				.setStyle("SHORT")
			modal.addComponents(new MessageActionRow().addComponents(MessageInput));
			return await interaction.showModal(modal);

		}
		else if (interaction.customId === "button_changeowner") 
		{
			await interaction.deferReply({ephemeral: true})
			let finedUser = VC.members
			//console.log(banUser)
			if (finedUser.size <= 1) return interaction.reply({content: `Error cannot find user.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			const row = new MessageActionRow()
			
			if (finedUser.size  > 1) {
				var options = []
				var index = 0
				finedUser.forEach((user) => {
					
					index += 1
					if(index <= 25) {
						options.push({
							label: user.user.username,
							description: user.nickname?user.nickname:user.user.username,
							value: user.id,
							default:user.id == interaction.user.id,
						})
					}
				});
				
				let msmComponents = new MessageSelectMenu()
				.setCustomId('select_changeowner')
				.setPlaceholder('Nothing selected')
				.addOptions(options)
				row.addComponents(msmComponents);
			}
			
			return await interaction.editReply({ content: 'Please select the one you want.', components: [row] ,ephemeral: true});

			
		}
		else if (interaction.customId === "button_delete") 
		{
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			if(removeTimeouts[user.id]) return
			if (removeTimeouts2[user.id]){
				let embeds = {
					"type": "rich",
					"title": "刪除已取消!",
					"description": `排定的刪除程序已取消!`,
					"color": "0x02cf21",
					"author": {
					  "name": "拉斯的私人語音包廂助理",
					  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
					}
				}
				let cmsg = await Vc.send({embeds: [embeds]})
				setTimeout(RemoveMsg,5000,cmsg)
				let Controlmsg = await Vc.messages.fetch(`${removeTimeoutsMsg2[user.id]}`)
				clearTimeout(removeTimeouts2[user.id])
				delete removeTimeouts2[user.id]
				await Controlmsg.delete().catch(err => {console.log(err)})
				
				
			}else{

				let embeds = {
					"type": "rich",
					"title": "已排定刪除!",
					"description": `房主決定將<#${tempVcId}>刪除。 \n頻道將於 <t:${Math.floor(Date.now() / 1000) + 10}:R> 刪除。 \n如要取消，請再次按下DeleteVC。`,
					"color": "0xff0000",
					"author": {
					  "name": "拉斯的私人語音包廂助理",
					  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
					}
				}

				
				let msg = await Vc.send({embeds: [embeds]})
				let tout = setTimeout(RemoveVTChannels, 10000, user.id, tempVcId)
				removeTimeouts2[user.id] = tout
				removeTimeoutsMsg2[user.id] = msg.id

			}

			return interaction.deferUpdate()
			
		}
		else if (interaction.customId === "button_Region") 
		{
			await interaction.deferReply({ephemeral: true})
			
			//console.log(RTCRegions)
			if (RTCRegions.size < 1) return interaction.reply({content: `Error cannot find RTCRegions.`,ephemeral: true }).catch(err => {VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``)})
			const row = new MessageActionRow()
			
			var options = []
			options.push({
				label: "自動",
				value: "null",
				default: !VC.rtcRegion ,
			})
			RTCRegions.forEach((Region) => {

				options.push({
					label: Region.name,
					value: Region.id,
					default: VC.rtcRegion == Region.id,
				})
			});
			
			let msmComponents = new MessageSelectMenu()
			.setCustomId('select_Region')
			.setPlaceholder('Nothing selected')
			.addOptions(options)
			row.addComponents(msmComponents);
			
			return await interaction.editReply({ content: 'Please select a Region you want.', components: [row] ,ephemeral: true});


		}
		else if (interaction.customId === "button_whitelist") 
		{
			const modal = new Modal()
				.setCustomId('modal_whitelist')
				.setTitle('Add someone to WhiteList');
			const MessageInput = new TextInputComponent()
				.setCustomId("_value")
				.setLabel("User Name")
				.setPlaceholder("Type name here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(4000)
				.setStyle("SHORT")
			modal.addComponents(new MessageActionRow().addComponents(MessageInput));
			return await interaction.showModal(modal);


		}

		return interaction.deferUpdate()
	}
	else if (interaction.isCommand())
	{
		if (interaction.commandName == "vc-fix"){
			await interaction.deferReply()

			if (!config.owners.includes(user.id)) return

			for await (const key of db.keys()) {
				
				if (key.startsWith('tempVcIdKey_')){
					//console.log(key)
					let embeds = {
						"type": "rich",
						"title": "管理員以使用強制清除指令!",
						"description": `頻道將於 <t:${Math.floor(Date.now() / 1000) + 10}:R> 刪除。`,
						"color": "0xe80000",
						"author": {
						  "name": "拉斯的私人語音包廂助理",
						  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
						}
					}
					let uid = key.replace('tempVcIdKey_','')
					
					let tempVcId = await db.get(`tempVcIdKey_${uid}`).catch(err => {}) //= await kvs1.get('tempVcIdKey_'+userid);
	
					let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
					Vc.send({content:`<@${uid}>`, embeds: [embeds]})
					setTimeout(RemoveVTChannels, 10000, uid, tempVcId)
					
				}

			}
			return await interaction.editReply({content: 'OK. 自爆啟動.',ephemeral: true})
		}
		else if (interaction.commandName == "vc-hubmsg")
		{
			await interaction.deferReply()
			if (!config.owners.includes(user.id)) return
			let embeds = {
				"type": "rich",
				"title": "臨時私人語音聊天",
				"description": `加入 <#${config.HUBvcChannelID}> 來創建您自己的Temp VC，您將成為房主。 任何人都可以隨時加入，除非您在加入後在頻道中進行設置。`,
				"color": "0x00B9FF",
				"author": {
				  "name": "Larshagrid",
				  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
				},
				"footer": {
				  "text": "TempVCs by Larshagrid#2620",
				  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
				}
			  }
			  
			return interaction.editReply({ embeds: [embeds]})
		}
		else if (interaction.commandName == "vc-control")
		{
			if (tempVcId != textchannel.id) {
				return await interaction.reply({content: "Uhhhhh... This is not your VC.",ephemeral: true }).catch(err => {console.log(err)})
			}

			await interaction.deferReply({ephemeral: true })

			return interaction.editReply(await CreateControlMsg(user.id ,user.username ,VcPermissions ))
		}
		
	}
})


async function CreateControlMsg(UserID,userName, Permissinos = {"VIEW_CHANNEL": false,"CONNECT": true,"SPEAK": true,}){
	

	let button1 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji(`${Permissinos.CONNECT?"🔒":"🔓"}`)
		.setLabel(`${Permissinos.CONNECT?"Lock":"Unlock"}`)
		.setCustomId("button_lock")
	let button2 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji(`${Permissinos.VIEW_CHANNEL?"👤":"👥"}`)
		.setLabel(`${Permissinos.VIEW_CHANNEL?"Hide":"Show"}`)
		.setCustomId("button_hide")
	let button3 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji(`${Permissinos.SPEAK?"🔇":"🔊"}`)
		.setLabel(`${Permissinos.SPEAK?"Mute":"Unmute"}`)
		.setCustomId("button_mute")
	let button4 = new MessageButton()
		.setStyle("DANGER")
		.setEmoji("🚫")
		.setLabel("Ban/Unban     ")
		.setCustomId("button_ban")
	let button5 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji("🗒️")
		.setLabel("Whitelist/Remove")
		.setCustomId("button_whitelist")
	let button6 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji("⚠️")
		.setLabel(" Limitㅤㅤ")
		.setCustomId("button_limit")
	let button7 = new MessageButton()
		.setStyle("DANGER")
		.setEmoji("📲")
		.setLabel("Change Owner")
		.setCustomId("button_changeowner")
	let button8 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji("📝")
		.setLabel("Change Name")
		.setCustomId("button_changename")
	let button9 = new MessageButton()
		.setStyle("SECONDARY")
		.setEmoji("👂")
		.setLabel("Get Mention")
		.setCustomId("button_getmention")
	let button10 = new MessageButton()
		.setStyle("SECONDARY")
		.setEmoji("📃")
		.setLabel("ㅤW-list Listㅤ")
		.setCustomId("button_w-list")
	let button11 = new MessageButton()
		.setStyle("SECONDARY")
		.setEmoji("📜")
		.setLabel("ㅤBan Listㅤ      ")
		.setCustomId("button_banlist")
	let button12 = new MessageButton()
		.setStyle("DANGER")
		.setEmoji("💢")
		.setLabel("ㅤKickㅤ             ")
		.setCustomId("button_kick")
	let button13 = new MessageButton()
		.setStyle("DANGER")
		.setEmoji("🗑️")
		.setLabel("ㅤDelete VCㅤ   ")
		.setCustomId("button_delete")
	let button14 = new MessageButton()
		.setStyle("PRIMARY")
		.setEmoji("🌎")
		.setLabel("ㅤChange Regionㅤ   ")
		.setCustomId("button_Region")
	let buttonRow1 = new MessageActionRow()
		.addComponents([button4, button12, button7, button13])

	let buttonRow2 = new MessageActionRow()
		.addComponents([button1, button2, button3, button6, button8])

	let buttonRow3 = new MessageActionRow()
		.addComponents([button5, button10, button11, button14])
	


	const controlsEmbed = config.controlsEembed_content
	var vcUserName = userName
	var vcUserAvatarURL = await client.users.cache.find(user => user.id == UserID).avatarURL()
	controlsEmbed.author.name=`${vcUserName} 的包廂`;
	controlsEmbed.author.icon_url=`${vcUserAvatarURL}`;
	//return await client.channels.cache.get(config.HUBtxtChannelID).send({ embeds: [controlsEmbed], components: [buttonRow1, buttonRow2, buttonRow3] })
	return { content: `<@${UserID}>`, embeds: [controlsEmbed], components: [buttonRow1, buttonRow2, buttonRow3] }
}

//Message Event only Listen to owners so make sure to fill the owner array in config
client.on("messageCreate", async (msg) => {
	if (msg.author.bot) return
	if (msg.channel.type === "dm") return
	if (!owners.includes(msg.author.id)) return
	if (msg.content !== `${config.prefix}create`) return
	//console.log("create")
	if (msg.content = `${config.prefix}create`) {
		await msg.delete().catch(() => {})
		let embeds = {
			"type": "rich",
			"title": "臨時私人語音聊天",
			"description": `加入 <#${config.HUBvcChannelID}> 來創建您自己的Temp VC，您將成為房主。 任何人都可以隨時加入，除非您在加入後在頻道中進行設置。`,
			"color": "0x00B9FF",
			"author": {
			  "name": "Larshagrid",
			  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
			},
			"footer": {
			  "text": "TempVCs by Larshagrid#2620",
			  "icon_url": "https://cdn.discordapp.com/attachments/920732721981038712/986987686751506512/-1.jpg"
			}
		  }
		return msg.channel.send({ embeds: [embeds]})

	} else return
})

//Bot Coded By Abdul#5464
//For Support Join Support Server https://discord.gg/sAMznQK2NG
//For Feature Request Open a Pull Request

client.login(config.token).catch(() => console.log('Invalid Token.Make Sure To Fill config.json'))
