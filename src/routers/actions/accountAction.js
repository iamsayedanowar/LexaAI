// Modules
import { account, databases, CONVERSATIONS_COLLECTION_ID, CHATS_COLLECTION_ID } from "../../lib/appwrite";
import { Query } from "appwrite";
import { redirect } from "react-router-dom";

const accountAction = async ({ request }) => {
    const formData = await request.formData();
    const requestType = formData.get('request_type');

    if (requestType === 'update_name') {
        const name = formData.get('name')?.trim();
        if (!name) {
            return { error: 'Name cannot be empty.', type: 'name' };
        }
        try {
            await account.updateName(name);
            return { success: true, message: 'Display name updated successfully!', type: 'name' };
        } catch (err) {
            console.error('Appwrite updateName error:', err.message);
            return { error: err.message, type: 'name' };
        }
    }

    if (requestType === 'update_email') {
        const email = formData.get('email')?.trim();
        const password = formData.get('password');
        if (!email) {
            return { error: 'Email cannot be empty.', type: 'email' };
        }
        if (!password) {
            return { error: 'Current password is required to update email.', type: 'email' };
        }
        try {
            await account.updateEmail(email, password);
            return { success: true, message: 'Email address updated successfully!', type: 'email' };
        } catch (err) {
            console.error('Appwrite updateEmail error:', err.message);
            return { error: err.message, type: 'email' };
        }
    }

    if (requestType === 'update_password') {
        const newPassword = formData.get('new_password');
        const oldPassword = formData.get('old_password');
        if (!newPassword || newPassword.length < 8) {
            return { error: 'New password must contain at least 8 characters.', type: 'password' };
        }
        try {
            await account.updatePassword(newPassword, oldPassword || undefined);
            return { success: true, message: 'Password updated successfully!', type: 'password' };
        } catch (err) {
            console.error('Appwrite updatePassword error:', err.message);
            return { error: err.message, type: 'password' };
        }
    }

    if (requestType === 'delete_all_chats') {
        try {
            const user = await account.get();
            if (!user?.$id) {
                return { error: 'User session not found.', type: 'delete_all_chats' };
            }

            let hasMore = true;
            while (hasMore) {
                const convs = await databases.listDocuments(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    CONVERSATIONS_COLLECTION_ID,
                    [Query.equal('user_id', user.$id), Query.limit(100)]
                );

                if (!convs.documents || convs.documents.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const conv of convs.documents) {
                    try {
                        const chats = await databases.listDocuments(
                            import.meta.env.VITE_APPWRITE_DATABASE_ID,
                            CHATS_COLLECTION_ID,
                            [Query.equal('conversation', conv.$id), Query.limit(100)]
                        );
                        for (const chat of chats.documents) {
                            await databases.deleteDocument(
                                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                                CHATS_COLLECTION_ID,
                                chat.$id
                            ).catch(() => {});
                        }
                    } catch (e) {
                        console.error('Error deleting chat document:', e);
                    }
                    await databases.deleteDocument(
                        import.meta.env.VITE_APPWRITE_DATABASE_ID,
                        CONVERSATIONS_COLLECTION_ID,
                        conv.$id
                    ).catch(() => {});
                }

                if (convs.documents.length < 100) {
                    hasMore = false;
                }
            }

            return {
                success: true,
                message: 'All chats have been permanently deleted.',
                type: 'delete_all_chats'
            };
        } catch (err) {
            console.error('Appwrite delete_all_chats error:', err.message);
            return { error: `Failed to delete all chats: ${err.message}`, type: 'delete_all_chats' };
        }
    }

    if (requestType === 'delete_account') {
        try {
            const user = await account.get();
            if (user?.$id) {
                // 1. Delete all conversations and chats belonging to this user
                try {
                    const convs = await databases.listDocuments(
                        import.meta.env.VITE_APPWRITE_DATABASE_ID,
                        CONVERSATIONS_COLLECTION_ID,
                        [Query.equal('user_id', user.$id)]
                    );
                    for (const conv of convs.documents) {
                        try {
                            const chats = await databases.listDocuments(
                                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                                CHATS_COLLECTION_ID,
                                [Query.equal('conversation', conv.$id)]
                            );
                            for (const chat of chats.documents) {
                                await databases.deleteDocument(
                                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                                    CHATS_COLLECTION_ID,
                                    chat.$id
                                ).catch(() => {});
                            }
                        } catch (e) {
                            console.error('Error deleting chat document:', e);
                        }
                        await databases.deleteDocument(
                            import.meta.env.VITE_APPWRITE_DATABASE_ID,
                            CONVERSATIONS_COLLECTION_ID,
                            conv.$id
                        ).catch(() => {});
                    }
                } catch (e) {
                    console.error('Error listing user conversations during deletion:', e);
                }

                // 2. Block/Deactivate account status
                try {
                    await account.updateStatus();
                } catch (e) {
                    console.error('Error updating account status:', e);
                }

                // 3. Delete all active sessions
                try {
                    await account.deleteSessions();
                } catch {
                    await account.deleteSession('current').catch(() => {});
                }
            }
            return redirect('/login');
        } catch (err) {
            console.error('Appwrite delete_account error:', err.message);
            return { error: `Failed to delete account: ${err.message}`, type: 'delete' };
        }
    }

    return null;
};

export default accountAction;
