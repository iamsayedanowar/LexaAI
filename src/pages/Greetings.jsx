// Modules
import { useLoaderData } from "react-router-dom";
import { motion } from "framer-motion";
import { userPromptPreloader } from "../hooks/userPromptPreloader";
import PromptPreloader from "../components/PromptPreloader";
import PropTypes from "prop-types";
import { Terminal, Brain, ScanSearch, Network, ArrowRight } from "lucide-react";

const CAPABILITY_PROMPTS = [
    {
        icon: Terminal,
        category: 'Code & Architecture',
        title: 'Review and refactor a code snippet',
        prompt: 'Analyze this code structure for performance bottlenecks, edge-case bugs, and potential modern refactorings:'
    },
    {
        icon: Brain,
        category: 'Step-by-Step Reasoning',
        title: 'Break down a complex technical tradeoff',
        prompt: 'Compare relational vs document database architectures for a high-concurrency real-time messaging application. Walk through the tradeoffs step by step.'
    },
    {
        icon: ScanSearch,
        category: 'Multimodal Vision',
        title: 'Analyze an attached diagram or UI screenshot',
        prompt: 'Inspect this uploaded image. Describe the user experience flow, visual hierarchy, and actionable points for polish.'
    },
    {
        icon: Network,
        category: 'Synthesis & Research',
        title: 'Synthesize documentation or key findings',
        prompt: 'Summarize the core architectural design principles of clean, unslopped web interfaces with concrete examples.'
    }
];

const Greetings = () => {
    const loaderData = useLoaderData() || {};
    const user = loaderData.user;
    const { promptPreLoaderValue } = userPromptPreloader();

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    const handleSelectPrompt = (promptText) => {
        window.dispatchEvent(new CustomEvent('lexaai:set-prompt', { detail: promptText }));
    };

    if (promptPreLoaderValue) {
        return <PromptPreloader promptValue={promptPreLoaderValue} />;
    }

    return (
        <div className="min-h-full py-8 sm:py-12 flex flex-col justify-center max-w-[800px] mx-auto">
            {/* Header / Intro */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="text-center sm:text-left mb-8"
            >
                {/* Active Network Pill */}


                <h1 className="text-displaySmall sm:text-displayMedium font-semibold tracking-tight text-light-onBackground dark:text-dark-onBackground">
                    Welcome, <span className="capitalize">{firstName}</span>
                </h1>
                <p className="text-bodyLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-2 max-w-xl">
                    Ask questions, upload images or documents, and explore frontier intelligence powered by 100% free models.
                </p>
            </motion.div>

            {/* Curated Capability Starter Cards */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
                {CAPABILITY_PROMPTS.map((card, idx) => {
                    const CardIcon = card.icon;
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPrompt(card.prompt)}
                            className="group text-left p-4 rounded-2xl bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/15 dark:border-dark-outline/15 hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-surfaceContainerHigh/60 dark:hover:bg-dark-surfaceContainerHigh/60 transition-colors shadow-subtle flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="w-8 h-8 rounded-md bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary flex items-center justify-center">
                                        <CardIcon className="w-4 h-4" />
                                    </span>
                                    <span className="text-[11px] font-medium text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 uppercase tracking-wider">
                                        {card.category}
                                    </span>
                                </div>
                                <h2 className="text-titleSmall font-medium text-light-onSurface dark:text-dark-onSurface group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                                    {card.title}
                                </h2>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant pt-2 border-t border-light-outline/10 dark:border-dark-outline/10">
                                <span className="truncate pr-2">Click to load prompt</span>
                                <ArrowRight className="w-4 h-4 text-light-primary dark:text-dark-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
};

Greetings.propTypes = {
    user: PropTypes.object
};

export default Greetings;
