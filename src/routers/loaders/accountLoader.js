// Modules
import { redirect } from "react-router-dom";
import { account } from "../../lib/appwrite";

const accountLoader = async () => {
    try {
        const user = await account.get();
        return { user };
    } catch (err) {
        console.error('Appwrite auth error in accountLoader:', err.message);
        return redirect('/login');
    }
};

export default accountLoader;
