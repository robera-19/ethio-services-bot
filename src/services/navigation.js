// src/languages/navigation.js
function getCategoryButtons(langPack) {
    const categories = langPack.categories;

    return {
        reply_markup: {
            keyboard: Object.values(categories).map(cat => [cat]),
            resize_keyboard: true,
        },
    };
}

function getServiceButtons(langPack, selectedCategoryKey) {
    const services = langPack.services;
    const serviceButtons = Object.entries(services)
        .filter(([key, val]) => val.category === selectedCategoryKey)
        .map(([key, val]) => [val.title]);

    return {
        reply_markup: {
            keyboard: [...serviceButtons, ["🔙 " + langPack.back_to_categories]],
            resize_keyboard: true,
        },
    };
}

function getServiceOptionButtons(langPack) {
    return {
        reply_markup: {
            keyboard: [
                [langPack.learn_button, langPack.requirements_button],
                [langPack.faq_button, "🔙 " + langPack.back],
                ["🏠 " + langPack.main_menu]
            ],
            resize_keyboard: true,
        },
    };
}

function getLanguageButtons() {
    return {
        reply_markup: {
            keyboard: [
                ["English", "አማርኛ", "Afaan Oromoo"]
            ],
            resize_keyboard: true
        }
    };
}

module.exports = {
    getCategoryButtons,
    getServiceButtons,
    getServiceOptionButtons,
    getLanguageButtons
};
