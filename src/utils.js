const fs = require("fs").promises;
const path = require("path");

// Map user-visible language names to internal language keys
const languageMap = {
    English: "english",
    "አማርኛ": "amharic",
    "Afaan Oromoo": "afaan_oromoo",
};

/**
 * Resolve the internal key for a user-selected language
 * @param {string} langText
 * @returns {string|null}
 */
function resolveLanguageKey(langText) {
    return languageMap[langText] || null;
}

/**
 * Load the specified language file as a JSON object
 * @param {string} langKey
 * @returns {Promise<Object|null>}
 */
async function loadLanguageFile(langKey) {
    try {
        const filePath = path.resolve(__dirname, "..", "languages", `${langKey}.json`);
        const file = await fs.readFile(filePath, "utf-8");
        return JSON.parse(file);
    } catch (err) {
        console.error(`❌ Failed to load language file "${langKey}":`, err.message);
        return null;
    }
}

/**
 * Get an array of language options for keyboard markup
 * @returns {string[][]}
 */
function getLanguageOptions() {
    return Object.keys(languageMap).map(name => [name]);
}

/**
 * Convert object keys to displayable button values
 * @param {Object} items
 * @returns {string[][]}
 */
function toKeyboardArray(items) {
    return Object.values(items).map(value => [value]);
}

module.exports = {
    resolveLanguageKey,
    loadLanguageFile,
    getLanguageOptions,
    toKeyboardArray,
};
