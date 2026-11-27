// Modules
import PropTypes from "prop-types";
import UserPrompt from "./UserPrompt";
import AiResponse from "./AiResponse";
import Skeleton from "./Skeleton";

const PromptPreloader = ({ promptValue }) => {
    return (
        <div className="max-w-[800px] w-full mx-auto py-2">
            <UserPrompt text={promptValue} />
            <AiResponse>
                <div className="space-y-2 py-2">
                    {/* <div className="flex items-center gap-2 text-bodySmall font-medium text-light-primary dark:text-dark-primary mb-3">
                        <span className="w-2 h-2 rounded-full bg-light-primary dark:bg-dark-primary animate-ping" />
                        <span>Generating response...</span>
                    </div> */}
                    <Skeleton />
                </div>
            </AiResponse>
        </div>
    );
};

PromptPreloader.propTypes = {
    promptValue: PropTypes.string
};

export default PromptPreloader;
