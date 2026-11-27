// Modules
import { account, databases, CONVERSATIONS_COLLECTION_ID, CHATS_COLLECTION_ID } from "../../lib/appwrite";
import { redirect } from "react-router-dom";
import { Query } from "appwrite";

const conversationLoader = async ({ params }) => {
    const { conversationId } = params;
    const data = {};
    try {
        data.user = await account.get();
    } catch (err) {
        console.error('Appwrite auth error:', err.message);
        return redirect('/login');
    }
    try {
        const conversationDoc = await databases.getDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversationId
        );
        const chatsResponse = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CHATS_COLLECTION_ID,
            [
                Query.equal('conversation', conversationId),
                Query.orderAsc('$createdAt')
            ]
        );
        data.conversation = {
            ...conversationDoc,
            chats: chatsResponse.documents
        };
    } catch (err) {
        console.error('Appwrite get conversation error:', err.message);
        throw err;
    }
    return data;
};

export default conversationLoader;
