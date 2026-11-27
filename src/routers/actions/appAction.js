// Modules
import { getAiResponse } from "../../api/openrouterAi";
import { account, databases, CONVERSATIONS_COLLECTION_ID, CHATS_COLLECTION_ID } from "../../lib/appwrite";
import generateID from "../../utils/generateID";
import { redirect } from "react-router-dom";

/**
 * Format prompt text to include attached files for Appwrite storage
 */
export const formatPromptWithAttachments = (prompt, attachments = []) => {
    if (!attachments || attachments.length === 0) return prompt || '';

    let formatted = '';
    attachments.forEach((file) => {
        const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name);
        const sizeStr = file.size ? ` (${Math.round(file.size / 1024)} KB)` : '';
        if (isImage && file.dataUrl) {
            formatted += `![${file.name}](${file.dataUrl})\n\n`;
        } else if (file.dataUrl) {
            formatted += `[📎 ${file.name}${sizeStr}](${file.dataUrl})\n\n`;
        } else {
            formatted += `📎 **[${file.name}${sizeStr}]**\n\n`;
        }
    });

    formatted += prompt || '';
    return formatted.trim();
};

const userPromptAction = async (formData) => {
    const userPrompt = formData.get('user_prompt') || '';
    const model = formData.get('model');
    const rawAttachments = formData.get('attached_files');
    let attachments = [];
    if (rawAttachments) {
        try {
            attachments = JSON.parse(rawAttachments);
        } catch (e) {
            console.error('Failed to parse attachments', e);
        }
    }

    let user = null;
    try {
        user = await account.get();
    } catch (err) {
        console.error('Failed to get account:', err.message);
        return redirect('/login');
    }

    // Instant title derivation (0 latency, 0 extra API calls)
    const safeTitle = (userPrompt ? userPrompt.slice(0, 40) : (attachments[0]?.name ? `File: ${attachments[0].name}` : 'New Chat')).trim().slice(0, 100);

    let conversation = null;
    try {
        conversation = await databases.createDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            generateID(),
            {
                title: safeTitle || 'New Chat',
                user_id: user.$id
            }
        );
    } catch (err) {
        console.error('Appwrite create conversation error:', err);
        return {
            error: `Appwrite Error: ${err.message}. Please check your Conversations table ID in Appwrite Console.`
        };
    }

    if (!conversation?.$id) {
        return {
            error: 'Failed to create conversation document in Appwrite.'
        };
    }

    const aiResponse = await getAiResponse(userPrompt, [], { model, attachments });
    const storedPrompt = formatPromptWithAttachments(userPrompt, attachments);
    const safeAiResponse = aiResponse?.trim() || '*(No response generated)*';

    try {
        await databases.createDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CHATS_COLLECTION_ID,
            generateID(),
            {
                user_prompt: storedPrompt || '...',
                ai_response: safeAiResponse,
                conversation: conversation.$id
            }
        );
    } catch (err) {
        console.error('Appwrite create chat error:', err);
        return {
            error: `Appwrite Error: ${err.message}. Please check your Chats table ID in Appwrite Console.`
        };
    }

    return redirect(`/${conversation.$id}`);
};

const deleteConversationAction = async (formData) => {
    const conversationId = formData.get('conversation_id');
    const conversationTitle = formData.get('conversation_title');
    try {
        await databases.deleteDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversationId
        );
        return { conversationTitle };
    } catch (err) {
        console.error('Appwrite delete conversation error:', err.message);
        return { error: `Failed to delete conversation: ${err.message}` };
    }
};

const renameConversationAction = async (formData) => {
    const conversationId = formData.get('conversation_id');
    const newTitle = formData.get('new_title')?.trim();
    if (!conversationId || !newTitle) {
        return { error: 'Invalid title or conversation ID' };
    }
    try {
        await databases.updateDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversationId,
            {
                title: newTitle.slice(0, 100)
            }
        );
        return { renamedTitle: newTitle.slice(0, 100) };
    } catch (err) {
        console.error('Appwrite rename conversation error:', err.message);
        return { error: `Failed to rename conversation: ${err.message}` };
    }
};

const appAction = async ({ request }) => {
    const formData = await request.formData();
    const requestType = formData.get('request_type');
    if (requestType === 'user_prompt') {
        return await userPromptAction(formData);
    }
    if (requestType === 'delete_conversation') {
        return await deleteConversationAction(formData);
    }
    if (requestType === 'rename_conversation') {
        return await renameConversationAction(formData);
    }
};

export default appAction;
