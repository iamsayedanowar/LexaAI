// Modules

/**
 * Submits a rename conversation request to the backend action
 * @param {Object} params
 * @param {string} params.id - Conversation Document ID
 * @param {string} params.newTitle - New Title for the conversation
 * @param {Function} params.submit - React Router useSubmit hook function
 */
const renameConversation = ({ id, newTitle, submit }) => {
    const trimmedTitle = (newTitle || '').trim();
    if (!id || !trimmedTitle) return;

    submit(
        {
            request_type: 'rename_conversation',
            conversation_id: id,
            new_title: trimmedTitle
        },
        {
            method: 'POST',
            encType: 'application/x-www-form-urlencoded',
            action: '/'
        }
    );
};

export default renameConversation;
