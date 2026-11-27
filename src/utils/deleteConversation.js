// Modules

/**
 * Submits the deletion request to the Appwrite backend action
 * @param {Object} params
 * @param {string} params.id - Conversation Document ID
 * @param {string} params.title - Conversation Title
 * @param {Function} params.submit - React Router useSubmit hook function
 */
const deleteConversation = ({ id, title, submit }) => {
    if (!id) return;
    submit(
        {
            request_type: 'delete_conversation',
            conversation_id: id,
            conversation_title: title
        },
        {
            method: 'DELETE',
            encType: 'application/x-www-form-urlencoded',
            action: '/'
        }
    );
};

export default deleteConversation;
