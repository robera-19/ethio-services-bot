const { loadLanguage } = require("../services/languages");
const session = require("../session");
const {
    getServicesByCategory,
    getLocalizedServiceName,
    formatTeachText,
    formatGuideText,
    formatFaqsText
} = require("../services/serviceInfo");

// 🔤 Reverse maps localized service name back to its key
const findServiceKeyByName = (lang, name) => {
    return Object.keys(lang.services || {}).find(key => lang.services[key] === name);
};

// 🔤 Reverse maps localized category name back to its key
const findKeyByValue = (obj, value) => {
    return Object.keys(obj || {}).find(k => obj[k] === value);
};

// 🌐 Language selection handler
const handleLanguageSelection = async (bot, chatId, selectedLangKey) => {
    session.set(chatId, "lang", selectedLangKey);
    session.set(chatId, "stage", "category");

    const lang = await loadLanguage(selectedLangKey);
    const categoryButtons = Object.values(lang.categories).map(name => [name]);

    const prompt =
        lang.messages?.select_category ||
        lang.prompts?.category_select ||
        "Please select a service category:";

    bot.sendMessage(chatId, prompt, {
        reply_markup: {
            keyboard: categoryButtons,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// 📂 Category selection handler
const handleCategorySelection = async (bot, chatId, text) => {
    const langKey = session.get(chatId, "lang");
    const lang = await loadLanguage(langKey);
    const categoryKey = findKeyByValue(lang.categories, text);

    if (!categoryKey) {
        bot.sendMessage(chatId, lang.errors?.category_not_found || "Category not found.");
        return;
    }

    session.set(chatId, "category", categoryKey);
    session.set(chatId, "stage", "service");

    const services = await getServicesByCategory(categoryKey);
    const serviceButtons = services.map(s => [getLocalizedServiceName(s.key, lang)]);

    const prompt =
        lang.messages?.select_service ||
        lang.prompts?.service_select ||
        "Please select a specific service:";

    bot.sendMessage(chatId, prompt, {
        reply_markup: {
            keyboard: serviceButtons,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// 🧾 Service selection handler
const handleServiceSelection = async (bot, chatId, text) => {
    const langKey = session.get(chatId, "lang");
    const lang = await loadLanguage(langKey);

    const serviceKey = findServiceKeyByName(lang, text);

    if (!serviceKey) {
        bot.sendMessage(chatId, lang.errors?.service_not_found || "Service not found.");
        return;
    }

    session.set(chatId, "service", serviceKey);
    session.set(chatId, "stage", "details");

    const buttons = [
        [lang.buttons.teach],
        [lang.buttons.guide],
        [lang.buttons.faq],
        [lang.buttons.back],
        [lang.buttons.main_menu]
    ];

    const prompt =
        lang.messages?.select_option ||
        lang.prompts?.option_select ||
        "Please choose an option:";

    bot.sendMessage(chatId, prompt, {
        reply_markup: {
            keyboard: buttons,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// 🔍 Detail selection handler
const handleDetailSelection = async (bot, chatId, text) => {
    const langKey = session.get(chatId, "lang");
    const lang = await loadLanguage(langKey);
    const serviceKey = session.get(chatId, "service");
    const categoryKey = session.get(chatId, "category");

    const services = await getServicesByCategory(categoryKey);
    const service = services.find(s => s.key === serviceKey);

    if (!service) {
        bot.sendMessage(chatId, lang.errors?.service_not_found || "Service not found.");
        return;
    }

    let message = "";

    if (text === lang.buttons.teach) {
        message = formatTeachText(service, lang);
    } else if (text === lang.buttons.guide) {
        message = formatGuideText(service, lang);
    } else if (text === lang.buttons.faq) {
        message = formatFaqsText(service, lang);
    } else if (text === lang.buttons.back) {
        const localizedName = lang.services?.[serviceKey] || serviceKey;
        return handleServiceSelection(bot, chatId, localizedName);
    } else if (text === lang.buttons.main_menu) {
        return handleLanguageSelection(bot, chatId, langKey);
    } else {
        bot.sendMessage(chatId, lang.errors?.invalid_option || "Invalid option. Returning to menu.");
        const localizedName = lang.services?.[serviceKey] || serviceKey;
        return handleServiceSelection(bot, chatId, localizedName);
    }

    bot.sendMessage(chatId, message);
};

module.exports = {
    handleLanguageSelection,
    handleCategorySelection,
    handleServiceSelection,
    handleDetailSelection
};