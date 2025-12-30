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
            <PageTitle title={`${conversation.title} • LexaAI`} />
            <motion.div className='max-w-[768px] mx-auto !will-change-auto' initial={!location.state?._isRedirect && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}>
                {chats.map((chat) => (
                    <div key={chat.$id} className="">
                        <UserPrompt text={chat.user_prompt} />
                        <AiResponse aiResponse={chat.ai_response} />
                    </div>
                ))}
            </motion.div>
            {promptPreLoaderValue && (<PromptPreloader promptValue={promptPreLoaderValue} />)}
        </>
    );
};

export default Conversation;