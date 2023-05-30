const config = {
    "token": "TOKEN",
    "guild": "SERVER ID",
    "HUBtxtChannelID": "leaveBlank",
    "HUBvcChannelID": "HUB CHANNEL ID | VC hub channel u need create by u owne, and put the hub id in here.",
    "DefaultRoleID": "if use @everyone, just put the server id in here. ",
    "categoryID": " a category to Collect your voice channels, u need create by you self, adn put category id here.",
    "status": "",
    "enable_slash": true,
    "prefix": "]",
    "owners": [
        ""
    ]
}
//use env
config.token = process.env.TOKEN || ''
config.guild = process.env.SERVER_ID || ''
config.HUBvcChannelID = process.env.HUB_ID || ''
config.DefaultRoleID = process.env.ROLE_ID || ''
config.categoryID = process.env.CATEGORY_ID || ''
config.prefix = process.env.PREFIX || ']'
config.owners = process.env.OWNERS.split(',') || ['']

module.exports = { config }