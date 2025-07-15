const fs = require("fs").promises;
const path = require("path");

/**
 * Load all services from JSON
 * @returns {Promise<object>} services object
 */
async function loadServices() {
    try {
        const filePath = path.resolve(__dirname, "..", "data", "services.json");
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to load services:", error);
        return {};
    }
}

/**
 * Find services by category key
 * @param {string} categoryKey
 * @returns {Promise<Array>} array of services under category
 */
async function getServicesByCategory(categoryKey) {
    const services = await loadServices();
    return Object.entries(services)
        .filter(([key, service]) => service.category === categoryKey)
        .map(([key, service]) => ({ key, ...service }));
}

/**
 * Get localized service name from language pack
 * @param {string} serviceKey
 * @param {object} langPack
 * @returns {string}
 */
function getLocalizedServiceName(serviceKey, langPack) {
    return langPack.services?.[serviceKey] || serviceKey;
}

/**
 * Format "Teach" text about a service
 * @param {object} service
 * @param {object} langPack
 * @returns {string}
 */
function formatTeachText(service, langPack) {
    const fallback = langPack.errors?.missing_info || "Information not available.";
    return langPack[service.lesson] || fallback;
}

/**
 * Format "Guide" text (requirements, fee, location)
 * @param {object} service
 * @param {object} langPack
 * @returns {string}
 */
function formatGuideText(service, langPack) {
    const lines = [];

    const reqHeader = langPack.prompts?.requirements_header || "Requirements:";
    lines.push(`${reqHeader}`);

    if (Array.isArray(service.requirements) && service.requirements.length > 0) {
        service.requirements.forEach(reqKey => {
            const reqText = langPack[reqKey] || `- ${reqKey}`;
            lines.push(`- ${reqText}`);
        });
    } else {
        const noReq = langPack.prompts?.no_requirements || "No specific requirements listed.";
        lines.push(noReq);
    }

    if (service.fee) {
        const feeLabel = langPack.prompts?.fee_label || "Estimated Fee:";
        const feeText = langPack[service.fee] || service.fee;
        lines.push(`\n${feeLabel} ${feeText}`);
    }

    if (service.location) {
        const locationLabel = langPack.prompts?.location_label || "Where to get this service:";
        const locationText = langPack[service.location] || service.location;
        lines.push(`\n${locationLabel}\n${locationText}`);
    }

    return lines.join("\n");
}

/**
 * Format FAQs text for a service
 * @param {object} service
 * @param {object} langPack
 * @returns {string}
 */
function formatFaqsText(service, langPack) {
    if (!Array.isArray(service.faqs) || service.faqs.length === 0) {
        return langPack.prompts?.no_faq || "No FAQs available.";
    }

    const header = langPack.prompts?.faq_header || "Frequently Asked Questions:";
    const lines = [header];

    service.faqs.forEach(({ q, a }) => {
        const question = langPack[q] || q;
        const answer = langPack[a] || a;
        lines.push(`\n❓ ${question}\n💬 ${answer}`);
    });

    return lines.join("\n");
}

module.exports = {
    loadServices,
    getServicesByCategory,
    getLocalizedServiceName,
    formatTeachText,
    formatGuideText,
    formatFaqsText
};
