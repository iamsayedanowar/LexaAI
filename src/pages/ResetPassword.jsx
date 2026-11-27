// Modules
import { Link, Form, useNavigation, useActionData } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";
import { CircularProgress, LinearProgress } from "../components/Progress";
import { useEffect } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import { AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";
import AuthShowcase from "../components/AuthShowcase";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
    const navigation = useNavigation();
    const error = useActionData();
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        if (error?.message) {
            showSnackbar({ message: error.message, type: 'error' });
        }
    }, [error, showSnackbar]);

    return (
        <>
            <PageTitle title="Set New Password • LexaAI" />
            <div className="relative w-full min-h-dvh grid grid-cols-1 lg:grid-cols-[1fr,1.1fr]">
                {/* Left Column: Set Password Form */}
                <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 max-w-lg w-full mx-auto">
                    {/* Header Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <Logo size={26} />
                        <span className="font-semibold text-titleLarge tracking-tight text-light-onSurface dark:text-dark-onSurface leading-none">
                            LexaAI
                        </span>
                    </Link>

                    {/* Main Form Box */}
                    <div className="my-auto py-8">
                        <h1 className="text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground">
                            Set new password
                        </h1>
                        <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1.5 mb-6">
                            Enter your new password below to secure your account.
                        </p>

                        <Form method="POST" className="grid grid-cols-1 gap-4">
                            <TextField
                                type="password"
                                name="password"
                                label="New password"
                                placeholder="At least 8 characters"
                                required={true}
                                autoFocus={true}
                            />
                            <Button type="submit" disabled={navigation.state === 'submitting'} classes="w-full mt-2">
                                {navigation.state === 'submitting' ? <CircularProgress size="small" /> : 'Save new password'}
                            </Button>
                        </Form>

                        <div className="text-center mt-6">
                            <Link to="/login" className="link text-labelLarge text-light-onSurface dark:text-dark-onSurface font-semibold underline-offset-4 inline-flex items-center gap-1.5">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to sign in</span>
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-bodySmall text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70">
                        © 2026 LexaAI Inc. All rights reserved.
                    </p>
                </div>

                {/* Right Column: Visual Showcase */}
                <AuthShowcase />
            </div>

            <AnimatePresence>
                {navigation.state === 'loading' && (
                    <LinearProgress classes="fixed top-0 left-0 right-0 z-50" />
                )}
            </AnimatePresence>
        </>
    );
};

export default ResetPassword;
