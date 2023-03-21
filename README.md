# Bybit-trading-bot-telegram-
This bybit trading bot consist of auto opening of position/auto closing based on keywords from what the users post in the discord please read through the code before using the bot there's alot of configuration needed

DO NOTE THAT THIS WOULD ONLY WORK ON BYBIT UNIFIED MARGIN ACCOUNT

Thing you would require before using this bot:

1. Api token from the telegram bot
2. Your discord auth token
3. ChatID for your telegram chat
4. Discord chat id from your discord text channel
5. Bybit api/secret key

Install all the package needed

1. npm i dotenv (https://www.npmjs.com/package/dotenv)
2. npm i discord.js-selfbot-v13 (https://www.npmjs.com/package/discord.js-selfbot-v13)
3. npm i node-telegram-bot-api (https://www.npmjs.com/package/node-telegram-bot-api)
4. npm i bybit-api (https://www.npmjs.com/package/bybit-api)
5. npm i fs (https://www.npmjs.com/package/fs)

node app.js to start the bot

Functions for telegram

/start - to get every commands

/totalbalance - to get total balance of the unified margin account

/AutoConfig - enabling/disabling self take profit based on discord message keywords

/checkprice - this would post live data on the current position that is currently active on your telegram message

/toggleCheckingPrice - toggling if checkprice will be auto updated

/SetSizeBTC - set sizing for btc

/SetSizeETH - set sizing for eth

/checkEthOrBtcPosition - this is to check the current eth/btc position once it will only post once and wouldn't be updated

/SetMarketSize - this is to set the market size to enter into a position this must be manually set by you

/CheckConfig - this is to get the current configuration

/MarketOpenBTC - market opening btc with the sizing you have set you're able to choose to go long/short

/MarketOpenETH - market opening eth with the sizing you have set you're able to choose to go long/short
