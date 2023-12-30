var config = {
    "token": "TOKEN",
    "guild": "SERVER ID",
    "HUBtxtChannelID": "leaveBlank",
    "HUBvcChannelID": "",
    "DefaultRoleID": "",
    "categoryID": "",
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
config.owners = process.env.OWNERS ? process.env.OWNERS.split(',') : null || ['']

module.exports = { config }
