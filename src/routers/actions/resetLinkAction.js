// Modules

import { account } from "../../lib/appwrite";

const resetLinkAction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    try {
        await account.createRecovery(email, `${location.origin}/reset-password`);
        return { ok: true, message: 'Password recovery email sent. Please check your inbox.' };
    } catch (err) {
        console.log(err.message);
        return { ok: false, message: err.message };
    }
};

export default resetLinkAction;