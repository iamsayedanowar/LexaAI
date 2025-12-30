// Modules

import { databases } from "../../lib/appwrite";
import { Query } from "appwrite";
import { getAiResponse } from "../../api/geminiAi";
import generateID from "../../utils/generateID";

const conversationAction = async ({ request, params }) => {
    const { conversationId } = params;
    const formData = await request.formData();
    const userPrompt = formData.get('user_prompt');
    let chatHistory = [];
    let aiResponse = '';
    try {
        const response = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            "chats",
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
        console.log(err.message);
    }
    try {
        aiResponse = await getAiResponse(userPrompt, chatHistory);
    } catch (err) {
        console.log(err.message);
    }
    try {
        await databases.createDocument(import.meta.env.VITE_APPWRITE_DATABASE_ID, 'chats', generateID(), {
            user_prompt: userPrompt,
            ai_response: aiResponse,
            conversation: conversationId
        });
    } catch (err) {
        console.log(err.message);
    }
    return null;
};

export default conversationAction;