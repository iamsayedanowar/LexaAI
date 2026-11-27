// Modules
import { Client, Account, Avatars, Databases } from "appwrite";

const client = new Client();

client.setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID).setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const CONVERSATIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CONVERSATIONS_COLLECTION_ID || 'conversations';
export const CHATS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID || 'chats';

export { account, avatars, databases };
