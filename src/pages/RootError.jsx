// Modules
import { useRouteError, Link, useNavigation } from "react-router-dom";
import { LinearProgress } from "../components/Progress";
import Logo from "../components/Logo";
import { ArrowLeft } from "lucide-react";

const RootError = () => {
    const error = useRouteError();
    const navigation = useNavigation();

    return (
        <>
            <div className="min-h-dvh flex flex-col justify-between p-6 sm:p-10 bg-light-background dark:bg-dark-background text-light-onBackground dark:text-dark-onBackground">
                {/* Header */}
                <Link to="/" className="flex items-center gap-2.5">
                    <Logo size={26} />
                    <span className="font-bold text-titleLarge tracking-tight text-light-onSurface dark:text-dark-onSurface leading-none">
                        LexaAI
                    </span>
                </Link>

                {/* Center Content */}
                <div className="my-auto text-center max-w-md mx-auto py-12">
                    <span className="text-displayLarge font-semibold text-light-primary dark:text-dark-primary block mb-2">
                        {error?.status || '404'}
                    </span>
                    <h1 className="text-headlineSmall font-semibold text-light-onSurface dark:text-dark-onSurface">
                        Page not found
                    </h1>
                    <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-2 mb-6">
                        The requested URL could not be found or has moved to a new destination.
                    </p>
                    <Link to="/" className="btn filled primary inline-flex">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        <span>Return to workspace</span>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center text-bodySmall text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50">
                    © 2026 LexaAI Inc. All rights reserved.
                </div>
            </div>

            {navigation.state === 'loading' && (
                <LinearProgress classes="fixed top-0 left-0 right-0 z-50" />
            )}
        </>
    );
};

export default RootError;
