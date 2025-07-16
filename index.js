require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
    handleLanguageSelection,
    handleCategorySelection,
    handleServiceSelection,
    handleDetailSelection
} = require("./src/bot/handlers");
const { get, set, clear } = require("./src/session");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 🌍 Language Selection Keyboard
const languageOptions = {
    reply_markup: {
        keyboard: [["English"], ["አማርኛ"], ["Afaan Oromoo"]],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

// 📌 Language Map
const langMap = {
    "English": "english",
    "አማርኛ": "amharic",
    "Afaan Oromoo": "afaan_oromoo"
};

// 🌟 Start Command
bot.onText(/^\/start$/, msg => {
    const chatId = msg.chat.id;
    clear(chatId); // Reset previous session

    bot.sendMessage(chatId, "Welcome! Please select your language / እባክዎ ቋንቋዎን ይምረጡ / Afaan filadhu", languageOptions);
});

// 📥 Message Router
bot.on("message", async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const currentStage = get(chatId, "stage");
    const selectedLang = get(chatId, "lang");

    // 🚀 Language Selection Handler
    if (!selectedLang) {
        const langKey = langMap[text];
        if (langKey) {
            set(chatId, "lang", langKey);
            set(chatId, "stage", "category");
            await handleLanguageSelection(bot, chatId, langKey);
        } else {
            bot.sendMessage(chatId, "Please select a language to continue.", languageOptions);
        }
        return;
    }

    // 🔁 Route by Current Stage
    switch (currentStage) {
        case "category":
            await handleCategorySelection(bot, chatId, text);
            break;
        case "service":
            await handleServiceSelection(bot, chatId, text);
            break;
        case "details":
            await handleDetailSelection(bot, chatId, text);
            break;
        default:
            bot.sendMessage(chatId, "Please type /start to begin.");
            break;
    }
});
