// Modules

import PageTitle from "./components/PageTitle";
import TopAppBar from "./components/TopAppBar";
import Sidebar from "./components/Sidebar";
import { useToggle } from "./hooks/useToggle";
import Greetings from "./pages/Greetings";
import { motion } from "framer-motion";
import PromptField from "./components/PromptField";
import { Outlet, useParams, useNavigation, useActionData } from "react-router-dom";
import { useSnackbar } from "./hooks/useSnackbar";
import { useEffect, useRef } from "react";
import { userPromptPreloader } from "./hooks/userPromptPreloader";

const App = () => {
  const params = useParams();
  const navigation = useNavigation();
  const actionData = useActionData();
  const chatHistoryRef = useRef();
  const [isSidebarOpen, toggleSidebar] = useToggle();
  const { promptPreLoaderValue } = userPromptPreloader();
  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    const chatHistory = chatHistoryRef.current;
    if (promptPreLoaderValue) {
      chatHistory.scroll({
        top: chatHistory.scrollHeight - chatHistory.clientHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistoryRef, promptPreLoaderValue]);
  useEffect(() => {
    if (actionData?.conversationTitle) {
      showSnackbar({ message: `Deleted ${actionData.conversationTitle}` });
    }
  }, [actionData, showSnackbar]);
  const isNormalLoad = navigation.state === 'loading' && !navigation.formData;
  return (
    <>
      <PageTitle title='LexaAI'></PageTitle>
      <div className='lg:grid lg:grid-cols-[320px_1fr]'>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className='h-dvh grid grid-rows-[max-content,minmax(0,1fr),max-content]'>
          <TopAppBar toggleSidebar={toggleSidebar} />
          <div ref={chatHistoryRef} className='px-5 pb-5 flex flex-col overflow-y-auto'>
            <div className='max-w-[840px] w-full mx-auto grow'>
              {isNormalLoad ? null : params.conversationId ? (<Outlet />) : (<Greetings />)}
            </div>
          </div>
          <div className='bg-light-background dark:bg-dark-background'>
            <div className='max-w-[870px] px-5 w-full mx-auto'>
              <PromptField />
              <motion.p initial={{ opacity: 0, translateY: '-4px' }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 0.2, delay: 0.8, ease: 'easeOut' }} className='text-bodySmall text-center text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant p-3'>
                LexaAI can make mistakes, so double-check it.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;