// Modules
import PageTitle from "./components/PageTitle";
import TopAppBar from "./components/TopAppBar";
import Sidebar from "./components/Sidebar";
import { useToggle } from "./hooks/useToggle";
import Greetings from "./pages/Greetings";
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
    if (promptPreLoaderValue && chatHistory) {
      chatHistory.scroll({
        top: chatHistory.scrollHeight - chatHistory.clientHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistoryRef, promptPreLoaderValue]);

  useEffect(() => {
    if (actionData?.error) {
      showSnackbar({ message: actionData.error, type: 'error', timeOut: 8000 });
    }
  }, [actionData, showSnackbar]);

  const isNormalLoad = navigation.state === 'loading' && !navigation.formData;

  return (
    <>
      <PageTitle title="LexaAI • Intelligent Multimodal Chat" />
      <div className="lg:grid lg:grid-cols-[280px_1fr] h-dvh overflow-hidden bg-light-background dark:bg-dark-background">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="h-dvh grid grid-rows-[max-content,minmax(0,1fr),max-content] min-w-0 overflow-hidden relative">
          <TopAppBar toggleSidebar={toggleSidebar} />

          <main ref={chatHistoryRef} className="px-3 sm:px-6 pb-4 flex flex-col overflow-y-auto min-h-0 min-w-0">
            <div className={`max-w-[840px] w-full min-w-0 mx-auto grow flex flex-col ${params.conversationId ? 'justify-start' : 'justify-center'}`}>
              {isNormalLoad ? null : params.conversationId ? <Outlet /> : <Greetings />}
            </div>
          </main>

          <footer className="bg-light-background dark:bg-dark-background border-t border-light-outline/10 dark:border-dark-outline/10 z-10">
            <div className="max-w-[840px] px-3 sm:px-6 py-2.5 w-full mx-auto">
              <PromptField />
              <p className="text-[11px] text-center text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 mt-1.5 select-none">
                LexaAI may produce inaccurate information. Verify critical outputs.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
