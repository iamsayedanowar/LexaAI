// Modules
import { redirect } from "react-router-dom";
import { account, databases, CONVERSATIONS_COLLECTION_ID } from "../../lib/appwrite";
import { Query } from "appwrite";

const appLoader = async () => {
    const data = {};
    try {
        data.user = await account.get();
    } catch (err) {
        console.error('Appwrite auth error:', err.message);
        return redirect('/login');
    }
    try {
        data.conversations = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            [
                Query.select(['$id', 'title']),
                Query.orderDesc('$createdAt'),
                Query.equal('user_id', data.user.$id)
            ]
        );
    } catch (err) {
        console.error('Appwrite list conversations error:', err.message);
        data.conversations = { documents: [] };
    }
    return data;
};

export default appLoader;
