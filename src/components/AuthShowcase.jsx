import Logo from "./Logo";
import { Bot, Image as ImageIcon } from "lucide-react";

const AuthShowcase = () => {
    return (
        <div className="hidden lg:flex flex-col justify-between p-8 xl:p-12 bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border-l border-light-outline/10 dark:border-dark-outline/10 overflow-hidden relative">
            {/* Top Brand Bar */}
            <div className="flex items-center gap-2.5">
                <Logo size={26} />
                <span className="font-semibold text-titleLarge tracking-tight text-light-onSurface dark:text-dark-onSurface leading-none">
                    LexaAI
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary ms-2">
                    Free Tier
                </span>
            </div>

            {/* Showcase Center Content */}
            <div className="my-auto max-w-lg py-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-labelSmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>OpenRouter Multi-Model Routing</span>
                </div>

                <h2 className="text-displaySmall font-semibold tracking-tight text-light-onBackground dark:text-dark-onBackground leading-tight">
                    Frontier intelligence with multimodal vision, right in your browser.
                </h2>

                <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-3 leading-relaxed">
                    Access high-throughput reasoning models, inspect code repositories, and analyze complex visual files with zero usage fees.
                </p>

                {/* Simulated Product UI Preview Card */}
                <div className="mt-8 p-4 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 shadow-elevation2 space-y-3 select-none">
                    {/* Model Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-light-outline/10 dark:border-dark-outline/10 text-[11px]">
                        <div className="flex items-center gap-1.5 text-light-primary dark:text-dark-primary font-medium">
                            <Bot className="w-3.5 h-3.5" />
                            <span>openrouter/free</span>
                        </div>
                        <span className="text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 font-medium">
                            200K ctx
                        </span>
                    </div>

                    {/* Chat snippet */}
                    <div className="space-y-2 text-[12px]">
                        <div className="flex items-start gap-2 text-light-onSurface dark:text-dark-onSurface">
                            <span className="w-5 h-5 rounded-full bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest flex items-center justify-center text-[10px] font-semibold shrink-0">
                                U
                            </span>
                            <div className="bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh px-3 py-1.5 rounded-md rounded-tl-xs">
                                <span>Inspect this architecture diagram for race conditions.</span>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-light-primary dark:text-dark-primary font-medium">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>arch-flow.png (240 KB)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-light-onSurface dark:text-dark-onSurface">
                            <span className="w-5 h-5 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary flex items-center justify-center text-[10px] shrink-0 font-bold">
                                L
                            </span>
                            <div className="bg-light-surfaceContainerLowest dark:bg-dark-surfaceContainerLowest border border-light-outline/10 dark:border-dark-outline/10 px-3 py-2 rounded-md rounded-tl-xs space-y-1">
                                <p className="leading-relaxed">
                                    I analyzed the message dispatch pipeline. At step 3, parallel consumers may cause stale state unless partitioned by key.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="flex items-center justify-between text-bodySmall text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 pt-4 border-t border-light-outline/10 dark:border-dark-outline/10">
                <span>© 2026 LexaAI Inc.</span>
                <span>Powered by Appwrite & OpenRouter</span>
            </div>
        </div>
    );
};

export default AuthShowcase;
