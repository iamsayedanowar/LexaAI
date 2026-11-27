// Modules
import { useRouteError, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { MessageSquareWarning, Plus } from "lucide-react";

const Error = () => {
    const error = useRouteError();
    console.error("Conversation error:", error);

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <MessageSquareWarning className="w-6 h-6" />
            </span>

            <h1 className="text-headlineSmall font-semibold text-light-onSurface dark:text-dark-onSurface">
                Unable to load conversation
            </h1>

            <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-2 mb-6">
                {error?.message || "This conversation may have been deleted or is temporarily unavailable."}
            </p>

            <Link to="/" className="btn filled primary">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Start new chat</span>
            </Link>
        </div>
    );
};

export default Error;
