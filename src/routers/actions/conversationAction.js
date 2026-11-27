// Modules
import { databases, CHATS_COLLECTION_ID } from "../../lib/appwrite";
import { Query } from "appwrite";
import { getAiResponse } from "../../api/openrouterAi";
import generateID from "../../utils/generateID";
import { formatPromptWithAttachments } from "./appAction";

const conversationAction = async ({ request, params }) => {
    const { conversationId } = params;
    const formData = await request.formData();
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

    let chatHistory = [];
    try {
        const response = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CHATS_COLLECTION_ID,
            [
                Query.equal("conversation", conversationId),
                Query.orderAsc("$createdAt")
            ]
        );
        chatHistory = response.documents.map((chat) => ({
            user_prompt: chat.user_prompt,
            ai_response: chat.ai_response
        }));
    } catch (err) {
        console.error('Appwrite list documents error:', err.message);
    }

    const aiResponse = await getAiResponse(userPrompt, chatHistory, { model, attachments });
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
                conversation: conversationId
            }
        );
    } catch (err) {
        console.error('Appwrite create chat error:', err.message);
        return {
            error: `Appwrite Chats Error: ${err.message}`
        };
    }

    return null;
};

export default conversationAction;
