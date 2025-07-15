const path = require("path");

const supportedLanguages = {
    english: "english.json",
    amharic: "amharic.json",
    afaan_oromoo: "afaan_oromoo.json"
};

const loadLanguage = async (langKey) => {
    try {
        const fileName = supportedLanguages[langKey];
        if (!fileName) throw new Error("Language not supported.");

        const filePath = path.join(__dirname, "../languages", fileName);
        const data = await require(filePath); // Cached on first load
        return data;
    } catch (err) {
        console.error("Translation load error:", err.message);
        return {};
    }
};

module.exports = {
    loadLanguage,
    supportedLanguages
};
