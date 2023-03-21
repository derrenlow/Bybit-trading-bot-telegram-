//Getting data from .env file
require("dotenv").config();
const telekey = process.env.TELE_KEY;
const apikey = process.env.API_KEY;
const secretkey = process.env.SECRET_KEY;
const DiscToken = process.env.DISCORD_TOKEN;
const chatid = process.env.CHAT_ID;
//getting all the modules
const TelegramBot = require('node-telegram-bot-api');
const {UnifiedMarginClient} = require('bybit-api');
const Discord = require('discord.js-selfbot-v13');
const fs = require('fs');
var config = require('./config.json');
const fileName = './config.json';
const file = require(fileName);

const client = new UnifiedMarginClient({ key: apikey, secret: secretkey, pingInterval: 10, reconnectTimeout: 50,recv_window: 5000, enable_time_sync: true,sync_interval_ms: 5000});
const Tbot = new TelegramBot(telekey, { polling: true });
const DiscClient = new Discord.Client({ checkUpdate: false });
const keyword = ["tp’ed","closed here","tp now","closed be","tp'ed","closed"];

//Default configuration
let BtcSize = config.currentConfig.btcSize;
let EthSize = config.currentConfig.ethSize;
let trigger = true;
let time = 1;
let oneTimeClose = true;
let totaltext = "";
let selfTp = true;
let autoOpen = true;
//Checking of config
checkConfig(chatid);

Tbot.on('message', (message => {
    console.log(message);
}));
DiscClient.on('ready', () => {
    console.log(`Logged in as ${DiscClient.user.tag}!`);
});

DiscClient.on("message", (m) => {
    if (m.channelId === "<channelID>") {
        let content = m.content.toLowerCase();
        if(selfTp == true){
            autoTp(content);
        }
        if(autoOpen == true){
            autoOpenPos(content);
        }
    }
});
//callback query for telegram buttons
Tbot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    if (msg.chat.id == chatid) {
        switch (action) {
            case 'CloseBTCUSDT':
                marketClose(msg.chat.id, 'BTCUSDT');
                triggerAll(false);
                break;
            case 'CloseETHUSDT':
                marketClose(msg.chat.id, 'ETHUSDT');
                triggerAll(false);
                break;
            case 'CloseBNBUSDT':
                marketClose(msg.chat.id, 'BNBUSDT');
                triggerAll(false);
                break;
            case 'ViewBtcPrice':
                checkPosition(msg.chat.id,'BTCUSDT');
                break;
            case 'ViewEthPrice':
                checkPosition(msg.chat.id,'ETHUSDT');
                break;
            case 'longMarketBtc':
                MarketClosePos('BTCUSDT', 'Buy', BtcSize, msg.chat.id);
                break;
            case 'shortMarketBtc':
                MarketClosePos('BTCUSDT', 'Sell', BtcSize, msg.chat.id);
                break;
            case 'longMarketEth':
                MarketClosePos('ETHUSDT', 'Buy', EthSize, msg.chat.id);
                break;
            case 'shortMarketEth':
                MarketClosePos('ETHUSDT', 'Sell', EthSize, msg.chat.id);
                break;
                case 'setBtcSize_0.3':
                    updateBtcSize('0.3');
                    updateConfig();
                    break;
                case 'setBtcSize_0.6':
                    updateBtcSize('0.6');
                    updateConfig();
                    break;
                case 'setBtcSize_0.8':
                    updateBtcSize('0.8');
                    updateConfig();
                    break;
                case 'setBtcSize_1':
                    updateBtcSize('1');
                    updateConfig();
                    break;
                case 'setBtcSize_1.2':
                    updateBtcSize('1.2');
                    updateConfig();
                    break;
                case 'setBtcSize_1.4':
                    updateBtcSize('1.4');
                    updateConfig();
                    break;
                case 'setBtcSize_1.6':
                    updateBtcSize('1.6');
                    updateConfig();
                    break;
                case 'setEthSize_3':
                    updateEthSize('3');
                    updateConfig();
                    break;
                case 'setEthSize_6':
                    updateEthSize('6');
                    updateConfig();
                    break;
                case 'setEthSize_8':
                    updateEthSize('8');
                    updateConfig();
                    break;
                case 'setEthSize_10':
                    updateEthSize('10');
                    updateConfig();
                    break;
                case 'setEthSize_12':
                    updateEthSize('12');
                    updateConfig();
                    break;
                case 'setEthSize_14':
                    updateEthSize('14');
                    updateConfig();
                    break;
                case 'setEthSize_16':
                    updateEthSize('16');
                    updateConfig();
                    break;
        }
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/start/, (msg) => {
    checkConfig(chatid);
    Tbot.sendMessage(msg.chat.id, "Please select command", {
        "reply_markup": {
            "keyboard": [["/TotalBalance", "/CheckPrice", "/toggleCheckingPrice"], ["/checkEthOrBtcPosition"], ["/MarketOpenBTC", "/MarketOpenETH"], ["/SetMarketSize", "/AutoConfig","/autoOpen"]]
        }
    });


});
Tbot.onText(/\/TotalBalance/, (msg) => {
    if (msg.chat.id == chatid) {
        checkBalance(msg.chat.id);
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/AutoConfig/, (msg) => {
    if (msg.chat.id == chatid) {
        if (selfTp == false) {
            selfTp = true;
            Tbot.sendMessage(msg.chat.id, `Self Tp Bot: ${selfTp}`);
        } else if (selfTp == true) {
            selfTp = false;
            Tbot.sendMessage(msg.chat.id, `Self Tp Bot: ${selfTp}`);
        }
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/AutoOpen/, (msg) => {
    if (msg.chat.id == chatid) {
        if (autoOpen == false) {
            autoOpen = true;
            Tbot.sendMessage(msg.chat.id, `Auto Open Bot: ${autoOpen}`);
        } else if (autoOpen == true) {
            autoOpen = false;
            Tbot.sendMessage(msg.chat.id, `Auto Open Bot: ${autoOpen}`);
        }
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/CheckPrice/, (msg) => {
    if (msg.chat.id == chatid) {
        if (trigger == true) {
            Tbot.sendMessage(msg.chat.id, 'Connecting.....');
            var interval = setInterval(function () {
                if (time <= 3) {
                    loopBtcPos(msg.chat.id, msg.message_id + 1);
                    time++;
                    time--;
                }
                else {
                    clearInterval(interval);
                }
            }, 1000);
        }else{
            Tbot.sendMessage(msg.chat.id,"Press here to activate checking of price (Auto) -> /toggleCheckingPrice");
        }
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/toggleCheckingPrice/, (msg) => {
    if (msg.chat.id == chatid) {
        if (trigger == true) {
            triggerAll(false);
            Tbot.sendMessage(chatid, "Closing of checking of price (Auto) 1s interval");
        } else {
            triggerAll(true);
            Tbot.sendMessage(chatid, "Activating of checking of price (Auto) 1s interval");
        }
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/checkEthOrBtcPosition/, (msg) => {
    if (msg.chat.id == chatid) {
        Tbot.sendMessage(msg.chat.id, 'Please select what Symbol you would like to view',{reply_markup: {
            inline_keyboard: [[
                {
                    text: 'BTCUSDT',
                    callback_data: 'ViewBtcPrice'
                },
                {
                    text: 'ETHUSDT',
                    callback_data: 'ViewEthPrice'
                }
            ]]
        }});
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/SetMarketSize/, (msg) => {
    if(msg.chat.id == chatid){
        Tbot.sendMessage(msg.chat.id, "Configuring", {
            "reply_markup": {
                "keyboard": [["/SetSizeBTC", "/SetSizeETH","/CheckConfig"], ["/start"]]
            }
        });
    }else{
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/SetSizeBTC/, (msg) => {
    if (msg.chat.id == chatid) {
        Tbot.sendMessage(msg.chat.id, 'Please select what size you would like to set for BTC', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '0.3',
                        callback_data: 'setBtcSize_0.3'
                    },
                    {
                        text: '0.6',
                        callback_data: 'setBtcSize_0.6'
                    },
                    {
                        text: '0.8',
                        callback_data: 'setBtcSize_0.8'
                    },
                    {
                        text: '1',
                        callback_data: 'setBtcSize_1'
                    },
                    {
                        text: '1.2',
                        callback_data: 'setBtcSize_1.2'
                    }
                    ,
                    {
                        text: '1.4',
                        callback_data: 'setBtcSize_1.4'
                    },
                    {
                        text: '1.6',
                        callback_data: 'setBtcSize_1.6'
                    }
                ]]
            }
        });
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/SetSizeETH/, (msg) => {
    if (msg.chat.id == chatid) {
        Tbot.sendMessage(msg.chat.id, 'Please select what size you would like to set for ETH', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '3',
                        callback_data: 'setEthSize_3'
                    },
                    {
                        text: '6',
                        callback_data: 'setEthSize_6'
                    },
                    {
                        text: '8',
                        callback_data: 'setEthSize_8'
                    },
                    {
                        text: '10',
                        callback_data: 'setEthSize_10'
                    },
                    {
                        text: '12',
                        callback_data: 'setEthSize_12'
                    }
                    ,
                    {
                        text: '14',
                        callback_data: 'setEthSize_14'
                    },
                    {
                        text: '16',
                        callback_data: 'setEthSize_16'
                    }
                ]]
            }
        });
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/CheckConfig/, (msg) => {
    if (msg.chat.id == chatid) {
        checkConfig(msg.chat.id);
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/MarketOpenBTC/, (msg) => {
    if (msg.chat.id == chatid) {
        Tbot.sendMessage(msg.chat.id, 'Please select what side you would like to open',{reply_markup: {
            inline_keyboard: [[
                {
                    text: 'Long BTC',
                    callback_data: 'longMarketBtc'
                },
                {
                    text: 'Short BTC',
                    callback_data: 'shortMarketBtc'
                }
            ]]
        }});
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
Tbot.onText(/\/MarketOpenETH/, (msg) => {
    if (msg.chat.id == chatid) {
        Tbot.sendMessage(msg.chat.id, 'Please select what side you would like to open',{reply_markup: {
            inline_keyboard: [[
                {
                    text: 'Long ETH',
                    callback_data: 'longMarketEth'
                },
                {
                    text: 'Short ETH',
                    callback_data: 'shortMarketEth'
                }
            ]]
        }});
    } else {
        Tbot.sendMessage(msg.chat.id, "Invalid owner");
    }
});
//updating of config
function updateConfig(){
    fs.writeFileSync(fileName, JSON.stringify(file));
}
//updating sizing for btc
function updateBtcSize(sizing){
    if(sizing > 0){
        BtcSize = sizing;
        file.currentConfig.btcSize = sizing;
        Tbot.sendMessage(chatid, "Successfully updated Btc Sizing to: "+sizing+ "\nCheck your config here -> /CheckConfig");
    }else{
        Tbot.sendMessage(chatid, "Please check your sizing");
    }
}
//updating sizing for eth
function updateEthSize(sizing){
    if(sizing > 0){
        EthSize = sizing;
        file.currentConfig.ethSize = sizing;
        Tbot.sendMessage(chatid, "Successfully updated Eth Sizing to: "+sizing+ "\nCheck your config here -> /CheckConfig");
    }else{
        Tbot.sendMessage(chatid, "Please check your sizing");
    }
}
//true = turn on false = turn off
function triggerAll(msg) {
    if (msg == true) {
        trigger = true;
        oneTimeClose = true;
        time = 1;
    } else if (msg == false) {
        trigger = false;
        oneTimeClose = false;
        time = 5;
    }
}
//Checking of bybit balance
function checkBalance(msgid) {
    client.getBalances().then(balance => {
        try {

            console.log(balance);
            Tbot.sendMessage(msgid, "Total balance on bybit derative wallet: " + balance.result.totalEquity)
        } catch (e) {}
    });
}
//Checking of current configuration settings
function checkConfig(msgid) {
    let totalmsg = `- Current Configuration -\n\nSizing for btc is currently: ${BtcSize}\nSizing for eth is currently: ${EthSize}\nAuto Tp: ${selfTp}\nAuto Open: ${autoOpen}`;
    Tbot.sendMessage(msgid, totalmsg);
}
//Loop for any position opened (auto update)
function loopBtcPos(msgid, chatid) {
    try {
        client.getPositions({ category: 'linear' }).then(msg => {
            try {
                if (msg.result.list[0].size.replace('-', "") > 0) {
                    let uPnl = parseInt(msg.result.list[0].unrealisedPnl);
                    let pIm = parseInt(msg.result.list[0].positionIM);
                    let totalpnpper = parseFloat((uPnl / pIm) * 100).toFixed(2);
                    const opts = {
                        chat_id: msgid,
                        message_id: chatid,
                    };
                    let totaltext2 = `${msg.result.list[0].side} ${parseFloat(msg.result.list[0].size).toFixed(2)}\nSymbol: ${msg.result.list[0].symbol} \nLeverage: ${msg.result.list[0].leverage}\nEntry: ${parseFloat(msg.result.list[0].entryPrice).toFixed(2)} \nMarket Price: ${parseFloat(msg.result.list[0].markPrice).toFixed(2)}\nUnrealised Pnl: ${parseFloat(msg.result.list[0].unrealisedPnl).toFixed(2)}\n% Gains: ${totalpnpper}%`;
                    if (totaltext != totaltext2) {
                        totaltext = totaltext2;
                        Tbot.editMessageText(totaltext, opts);
                        if (oneTimeClose == true) {
                            oneTimeClose = false;
                            Tbot.sendMessage(msgid, "Close Position?", {
                                reply_markup: {
                                    inline_keyboard: [[
                                        {
                                            text: 'Market Close ' + msg.result.list[0].symbol,
                                            callback_data: 'Close' + msg.result.list[0].symbol
                                        }
                                    ]]
                                }
                            });
                        }
                    }
                }else{
                    triggerAll(false);
                    Tbot.sendMessage(msgid,"There are currently no position open");
                }
            } catch (e) { 
                triggerAll(false);
                Tbot.sendMessage(msgid, "No position open");
            }
        });
    } catch (err) {
        Tbot.sendMessage(msgid, "No position open");
    }
}
//Checking of position for specific symbol
function checkPosition(msgid,symbol){
    try {
        client.getPositions({ category: 'linear', symbol: symbol }).then(msg => {
            try {
                let uPnl = parseInt(msg.result.list[0].unrealisedPnl);
                let pIm = parseInt(msg.result.list[0].positionIM);
                let totalpnpper = parseFloat((uPnl / pIm) * 100).toFixed(2);
                Tbot.sendMessage(msgid, `${msg.result.list[0].side} ${parseFloat(msg.result.list[0].size).toFixed(2)}\nSymbol: ${msg.result.list[0].symbol} \nLeverage: ${msg.result.list[0].leverage}\nEntry: ${parseFloat(msg.result.list[0].entryPrice).toFixed(2)} \nMarket Price: ${parseFloat(msg.result.list[0].markPrice).toFixed(2)}\nUnrealised Pnl: ${parseFloat(msg.result.list[0].unrealisedPnl).toFixed(2)}\n% Gains: ${totalpnpper}%`,
                    {
                        reply_markup: {
                            inline_keyboard: [[
                                {
                                    text: 'Market Close '+msg.result.list[0].symbol,
                                    callback_data: 'Close'+msg.result.list[0].symbol
                                }
                            ]]
                        }
                    });
            } catch (e) { Tbot.sendMessage(msgid, `No ${symbol} position open`); }
        });
    } catch (e) {
        Tbot.sendMessage(msgid, "No position open");
    }
}
//Detecting which direction is the position currently opened
async function marketClose(msgid, nSymbol) {
    try {
        let type = await client.getPositions({ category: 'linear', symbol: nSymbol }).then(msg => {
            return (`${msg.result.list[0].side}`);
        });
        let size = await client.getPositions({ category: 'linear', symbol: nSymbol }).then(msg => {
            return (`${msg.result.list[0].size}`);
        });
        if (type == "Sell") {
            MarketClosePos(nSymbol, 'Buy', size.replace('-', ""), msgid);
            trigger = false;
            oneTimeClose = false;
            time = 5;
        } else if (type == "Buy") {
            MarketClosePos(nSymbol, 'Sell', size.replace('-', ""), msgid);
            trigger = false;
            oneTimeClose = false;
            time = 5;
        }
    } catch (e) {
        Tbot.sendMessage(msgid, "Unable to perform closing of " + nSymbol);
    }
}
//Market Closing/Opening of any position
function MarketClosePos(symbol, side, size, msgid) {
    try {
        client.submitOrder({ category: 'linear', symbol: symbol, side: side, orderType: 'Market', qty: size, timeInForce: 'GoodTillCancel' }).then(msg => {
            Tbot.sendMessage(msgid, "Sucessfully filled " + symbol);
        });
    } catch (e) {
        Tbot.sendMessage(msgid, "Unable to perform fill of " + symbol + " position");
    }
}
//Auto Opening of Position based on keywords
function autoOpenPos(Pcontent){
    let content = Pcontent;
    if(content.includes("btc short")){
        if((content.includes("half") == true)||(content.includes("0.15")) == true){
            let sizing = BtcSize/2;
            MarketClosePos('BTCUSDT', 'Sell', sizing.toString(), chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\nMarket have opened SHORT ${BtcSize/2} BTC (Half Size)`);
        }else{
            MarketClosePos('BTCUSDT', 'Sell', BtcSize, chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\nMarket have opened SHORT ${BtcSize} BTC (Full Size)`);
        }
    }else if(content.includes("btc long")){
        if((content.includes("half") == true)||(content.includes("0.15")) == true){
            let sizing = BtcSize/2;
            MarketClosePos('BTCUSDT', 'Buy', sizing.toString(), chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\nMarket have opened LONG ${BtcSize/2} BTC (Half Size)`);
        }else{
            MarketClosePos('BTCUSDT', 'Buy', BtcSize, chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\nMarket have opened LONG ${BtcSize} BTC (Full Size)`);
        }
    }else if(content.includes("eth short")){
        if((content.includes("half") == true)||(content.includes("1")) == true){
            let sizing = EthSize/2;
            MarketClosePos('ETHUSDT', 'Sell', sizing.toString(), chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\n Market have opened SHORT ${sizing} ETH (Half Size)`);
        }else{
            MarketClosePos('ETHUSDT', 'Sell', EthSize, chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\n Market have opened SHORT ${EthSize} ETH (Full Size)`);
        }
    }else if(content.includes("eth long")){
        if((content.includes("half") == true)||(content.includes("1")) == true){
            let sizing = EthSize/2;
            MarketClosePos('ETHUSDT', 'Buy', sizing.toString(), chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\n Market have opened LONG ${sizing} ETH (Half Size)`);
        }else{
            MarketClosePos('ETHUSDT', 'Buy', EthSize, chatid);
            Tbot.sendMessage(chatid, `-Auto OPEN-\n\n Market have opened LONG ${EthSize} ETH (Full Size)`);
        }
    }
}
async function autoTp(content){
    for(let i = 0; i < keyword.length;i++){
        if(content.includes(keyword[i]) == true){
            await marketClose(chatid, 'BTCUSDT');
            await marketClose(chatid, 'ETHUSDT');
            triggerAll(false);
            Tbot.sendMessage(chatid, "Market have auto closed because of Auto TP");
        }
    }
}
//Logging in discord token
DiscClient.login(DiscToken);