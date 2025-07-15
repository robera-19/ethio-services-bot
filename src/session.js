const sessions = new Map();

/**
 * Get a session value for a user by chatId and key
 * @param {number} chatId 
 * @param {string} key 
 */
function get(chatId, key) {
    const userSession = sessions.get(chatId);
    if (!userSession) return null;
    return userSession[key] ?? null;
}

/**
 * Set a session value for a user by chatId and key
 * @param {number} chatId 
 * @param {string} key 
 * @param {*} value 
 */
function set(chatId, key, value) {
    let userSession = sessions.get(chatId);
    if (!userSession) {
        userSession = {};
        sessions.set(chatId, userSession);
    }
    userSession[key] = value;
}

/**
 * Clear all session data for a user
 * @param {number} chatId 
 */
function clear(chatId) {
    sessions.delete(chatId);
}

module.exports = {
    get,
    set,
    clear,
};
