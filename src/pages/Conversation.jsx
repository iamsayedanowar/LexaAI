// Modules
import { motion } from "framer-motion";
import PageTitle from "../components/PageTitle";
import { useLoaderData, useLocation } from "react-router-dom";
import UserPrompt from "../components/UserPrompt";
import AiResponse from "../components/AiResponse";
import PromptPreloader from "../components/PromptPreloader";
import { userPromptPreloader } from "../hooks/userPromptPreloader";

const Conversation = () => {
    const { conversation } = useLoaderData() || {};
    const chats = conversation?.chats || [];
    const { promptPreLoaderValue } = userPromptPreloader();
    const location = useLocation();

    return (
        <>
            <PageTitle title={`${conversation?.title || 'Chat'} • LexaAI`} />
            <motion.div
                className="max-w-[800px] w-full min-w-0 mx-auto py-2"
                initial={!location.state?._isRedirect && { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {chats.map((chat) => (
                    <div key={chat.$id}>
                        <UserPrompt text={chat.user_prompt} />
                        <AiResponse aiResponse={chat.ai_response} />
                    </div>
                ))}
            </motion.div>
            {promptPreLoaderValue && <PromptPreloader promptValue={promptPreLoaderValue} />}
        </>
    );
};

export default Conversation;
