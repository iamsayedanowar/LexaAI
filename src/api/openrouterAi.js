// Modules
import { callOpenRouterChat, getValidModelId, FREE_MODELS } from "../lib/openrouter";

/**
 * Generate a concise title for a new conversation
 * @param {string} userPrompt
 * @param {string} [model]
 * @returns {Promise<string>}
 */
const getConversationTitle = async (userPrompt, model) => {
    const validModel = getValidModelId(model);
    const trimmedPrompt = (userPrompt || '').trim();

    if (!trimmedPrompt || trimmedPrompt === 'New Chat') {
        return 'New Chat';
    }

    try {
        const titlePrompt = `Given this initial message, generate a concise title (3 to 6 words) summarizing it. Output plain text only without quotes or punctuation:\n\n${trimmedPrompt.slice(0, 300)}`;
        
        const rawTitle = await callOpenRouterChat({
            model: validModel,
            messages: [
                {
                    role: 'system',
                    content: 'You generate concise chat titles. Return only the plain title, max 6 words, no quotes.'
                },
                {
                    role: 'user',
                    content: titlePrompt
                }
            ],
            temperature: 0.3
        });

        const cleanedTitle = rawTitle.replace(/^["'`\s]+|["'`\s]+$/g, '').trim();
        const finalTitle = cleanedTitle || trimmedPrompt.slice(0, 30);
        return finalTitle.slice(0, 100);
    } catch (err) {
        console.error('Failed to generate title:', err.message);
        return (trimmedPrompt.slice(0, 30) || 'New Chat').slice(0, 100);
    }
};

/**
 * Sanitize historical user messages so massive Base64 strings from prior turns
 * do not exhaust model context or token budgets.
 * @param {string} text
 * @returns {string}
 */
const sanitizeHistoryText = (text) => {
    if (!text) return '';
    // Replace markdown image base64 data URLs with a lightweight tag
    return text.replace(/!\[([^\]]*)\]\(data:image\/[^)]+\)/g, '[Attached image: $1]');
};

/**
 * Generate AI response with conversation history and multimodal attachments
 * @param {string} userPrompt - Current user prompt
 * @param {Array} [chats=[]] - Previous chats { user_prompt, ai_response }
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.model] - Model ID to query
 * @param {Array} [options.attachments] - Array of { name, type, size, dataUrl, textContent }
 * @returns {Promise<string>}
 */
const getAiResponse = async (userPrompt, chats = [], options = {}) => {
    const validModel = getValidModelId(options.model);
    const modelMeta = FREE_MODELS.find(m => m.id === validModel) || FREE_MODELS[0];
    const supportsVision = !!modelMeta.supportsVision;
    const attachments = options.attachments || [];

    const messages = [];

    // Append conversation history with sanitized text (Base64 stripped)
    chats.forEach(({ user_prompt, ai_response }) => {
        if (user_prompt) {
            messages.push({
                role: 'user',
                content: sanitizeHistoryText(user_prompt)
            });
        }
        if (ai_response) {
            messages.push({
                role: 'assistant',
                content: ai_response
            });
        }
    });

    // Format current turn with attachments
    if (attachments && attachments.length > 0) {
        const contentParts = [];
        const textParts = [];

        attachments.forEach((file) => {
            const isImage = (file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name)) && !file.name.toLowerCase().endsWith('.svg');
            const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

            if (supportsVision && isImage && file.dataUrl) {
                contentParts.push({
                    type: 'image_url',
                    image_url: { url: file.dataUrl }
                });
            } else if (supportsVision && isPdf && file.dataUrl) {
                contentParts.push({
                    type: 'file',
                    file: {
                        filename: file.name,
                        file_data: file.dataUrl
                    }
                });
            } else if (file.textContent) {
                textParts.push(`--- File: ${file.name} ---\n${file.textContent}\n--- End of ${file.name} ---`);
            } else {
                // If model does not support vision or file is non-PDF binary, inform model in text
                textParts.push(`[Attached file: ${file.name} (${Math.round((file.size || 0) / 1024)} KB)]`);
            }
        });

        // Combine user text and attached text blocks
        const combinedText = [userPrompt?.trim(), ...textParts].filter(Boolean).join('\n\n');

        // Add text part (ensure at least a default prompt if user only sent images/files)
        contentParts.unshift({
            type: 'text',
            text: combinedText || 'Please analyze the attached file(s).'
        });

        // If only text parts exist, send as simple string
        if (contentParts.length === 1 && contentParts[0].type === 'text') {
            messages.push({ role: 'user', content: contentParts[0].text });
        } else {
            messages.push({ role: 'user', content: contentParts });
        }
    } else {
        messages.push({
            role: 'user',
            content: userPrompt || 'Hello'
        });
    }

    try {
        return await callOpenRouterChat({
            model: validModel,
            messages,
            temperature: 0.7
        });
    } catch (err) {
        if (err.name === 'AbortError' || err.message?.toLowerCase().includes('aborted')) {
            console.log('Generation stopped by user.');
            return '*(Generation stopped by user)*';
        }
        console.error('getAiResponse error:', err.message);
        return `⚠️ **Error generating response (${validModel}):**\n${err.message}`;
    }
};

export { getConversationTitle, getAiResponse };
