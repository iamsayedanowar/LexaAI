// Modules
import { useRef, useEffect, useState } from "react";
import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router-dom";
import { useSnackbar } from "../hooks/useSnackbar";
import { CircularProgress, LinearProgress } from "../components/Progress";
import Avatar from "../components/Avatar";
import Logo from "../components/Logo";
import PageTitle from "../components/PageTitle";
import DeleteAccountModal from "../components/DeleteAccountModal";
import DeleteAllChatsModal from "../components/DeleteAllChatsModal";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Trash2, User, Mail, Lock } from "lucide-react";

const Account = () => {
    const { user } = useLoaderData() || {};
    const actionData = useActionData();
    const navigation = useNavigation();
    const { showSnackbar } = useSnackbar();

    const formRefEmail = useRef(null);
    const formRefPassword = useRef(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteAllChatsModalOpen, setIsDeleteAllChatsModalOpen] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            showSnackbar({ message: actionData.message, type: 'info' });
            if (actionData.type === 'email') {
                formRefEmail.current?.reset();
            }
            if (actionData.type === 'password') {
                formRefPassword.current?.reset();
            }
            if (actionData.type === 'delete_all_chats') {
                setIsDeleteAllChatsModalOpen(false);
            }
        }
        if (actionData?.error) {
            showSnackbar({ message: actionData.error, type: 'error', timeOut: 8000 });
        }
    }, [actionData, showSnackbar]);

    const isSubmittingName = navigation.state === 'submitting' && navigation.formData?.get('request_type') === 'update_name';
    const isSubmittingEmail = navigation.state === 'submitting' && navigation.formData?.get('request_type') === 'update_email';
    const isSubmittingPassword = navigation.state === 'submitting' && navigation.formData?.get('request_type') === 'update_password';
    const isSubmittingDeleteAllChats = navigation.state === 'submitting' && navigation.formData?.get('request_type') === 'delete_all_chats';
    const isSubmittingDelete = navigation.state === 'submitting' && navigation.formData?.get('request_type') === 'delete_account';
    const isNormalLoad = navigation.state === 'loading' && !navigation.formData;

    return (
        <>
            <PageTitle title="Account Settings • LexaAI" />

            <div className="min-h-dvh bg-light-background dark:bg-dark-background text-light-onBackground dark:text-dark-onBackground flex flex-col">
                {/* Top Navigation Bar */}
                <header className="h-14 px-2 sm:px-4 border-b border-light-outline/10 dark:border-dark-outline/10 flex items-center justify-between bg-light-surface dark:bg-dark-surface sticky top-0 z-30">
                    <Link to="/" className="flex items-center gap-2.5">
                        <Logo size={26} />
                        <span className="font-bold text-titleLarge tracking-tight text-light-onSurface dark:text-dark-onSurface leading-none">
                            LexaAI
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-bodySmall font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-onSurface dark:hover:text-dark-onSurface px-3 py-1.5 rounded-lg hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                            title="Back to workspace"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to workspace</span>
                        </Link>
                    </div>

                    <AnimatePresence>
                        {isNormalLoad && <LinearProgress classes="absolute top-full left-0 right-0 z-10" />}
                    </AnimatePresence>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground">
                            Account settings
                        </h1>
                        <p className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
                            Manage your profile details, email address, and security.
                        </p>
                    </div>

                    {/* Current Profile Card */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 shadow-subtle">
                        <Avatar name={user?.name || 'User'} />
                        <div className="min-w-0 grow">
                            <h2 className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface truncate">
                                {user?.name || 'User'}
                            </h2>
                            <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant truncate">
                                {user?.email || 'No email attached'}
                            </p>
                        </div>
                    </div>

                    {/* 1. Update Name Card */}
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-2xl p-6 shadow-subtle">
                        <div className="mb-4">
                            <h2 className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface flex items-center">
                                <span>Display name</span>
                            </h2>
                            <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-0.5">
                                Update how your name appears across conversations.
                            </p>
                        </div>

                        <Form key={`name-${user?.name}`} method="POST" className="flex flex-col gap-4">
                            <input type="hidden" name="request_type" value="update_name" />
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="name-field" className="text-labelMedium font-medium text-light-onSurface dark:text-dark-onSurface">
                                    Full name
                                </label>
                                <input
                                    id="name-field"
                                    name="name"
                                    type="text"
                                    defaultValue={user?.name || ''}
                                    required
                                    placeholder="Enter your name"
                                    className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                                />
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={isSubmittingName}
                                    className="h-10 px-5 rounded-md bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary font-medium text-labelLarge shadow-subtle hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmittingName ? <CircularProgress size="small" /> : 'Update name'}
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* 2. Update Email Card */}
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-2xl p-6 shadow-subtle">
                        <div className="mb-4">
                            <h2 className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface flex items-center">
                                <span>Email address</span>
                            </h2>
                            <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-0.5">
                                Update your login and recovery email address.
                            </p>
                        </div>

                        <Form ref={formRefEmail} key={`email-${user?.email}`} method="POST" className="flex flex-col gap-4">
                            <input type="hidden" name="request_type" value="update_email" />
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email-field" className="text-labelMedium font-medium text-light-onSurface dark:text-dark-onSurface">
                                    Email address
                                </label>
                                <input
                                    id="email-field"
                                    name="email"
                                    type="email"
                                    defaultValue={user?.email || ''}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email-password-field" className="text-labelMedium font-medium text-light-onSurface dark:text-dark-onSurface">
                                    Current password
                                </label>
                                <input
                                    id="email-password-field"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Verify with your current password"
                                    className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                                />
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={isSubmittingEmail}
                                    className="h-10 px-5 rounded-md bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary font-medium text-labelLarge shadow-subtle hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmittingEmail ? <CircularProgress size="small" /> : 'Update email'}
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* 3. Update Password Card */}
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-2xl p-6 shadow-subtle">
                        <div className="mb-4">
                            <h2 className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface flex items-center">
                                <span>Password & security</span>
                            </h2>
                            <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-0.5">
                                Ensure your account is using a strong, unique password.
                            </p>
                        </div>

                        <Form ref={formRefPassword} method="POST" className="flex flex-col gap-4">
                            <input type="hidden" name="request_type" value="update_password" />
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="old-password-field" className="text-labelMedium font-medium text-light-onSurface dark:text-dark-onSurface">
                                    Current password
                                </label>
                                <input
                                    id="old-password-field"
                                    name="old_password"
                                    type="password"
                                    placeholder="Enter current password"
                                    className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="new-password-field" className="text-labelMedium font-medium text-light-onSurface dark:text-dark-onSurface">
                                    New password
                                </label>
                                <input
                                    id="new-password-field"
                                    name="new_password"
                                    type="password"
                                    required
                                    minLength={8}
                                    placeholder="At least 8 characters"
                                    className="w-full h-11 px-3.5 rounded-md bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow border border-light-outline/25 dark:border-dark-outline/25 text-light-onSurface dark:text-dark-onSurface text-bodyMedium focus:outline-none focus:border-light-primary dark:focus:border-dark-primary focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors"
                                />
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={isSubmittingPassword}
                                    className="h-10 px-5 rounded-md bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary font-medium text-labelLarge shadow-subtle hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmittingPassword ? <CircularProgress size="small" /> : 'Update password'}
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* 4. Delete All Chats Card */}
                    <div className="bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-2xl p-6 shadow-subtle">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-titleMedium font-semibold text-light-onSurface dark:text-dark-onSurface">
                                    Delete all chats
                                </h2>
                                <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
                                    Permanently delete all your conversation history and messages at once.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteAllChatsModalOpen(true)}
                                className="h-10 px-4 rounded-md bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-500/15 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white font-medium text-bodySmall transition-colors flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete all chats</span>
                            </button>
                        </div>
                    </div>

                    {/* 5. Delete Account Danger Card */}
                    <div className="bg-light-surface dark:bg-dark-surface border border-red-500/20 dark:border-red-500/20 rounded-2xl p-6 shadow-subtle">
                        <div className="mb-4">
                            <h2 className="text-titleMedium font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <span>Danger zone</span>
                            </h2>
                            <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
                                Permanently delete your account, session, and conversation history.
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="h-10 px-4 rounded-md bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-500/15 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white font-medium text-bodySmall transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete account</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="py-6 text-center text-[12px] text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50">
                        © 2026 LexaAI Inc. All rights reserved.
                    </div>
                </main>

                {/* Pop-up Dialogue Modal for Delete All Chats */}
                <DeleteAllChatsModal
                    isOpen={isDeleteAllChatsModalOpen}
                    onClose={() => setIsDeleteAllChatsModalOpen(false)}
                    isSubmitting={isSubmittingDeleteAllChats}
                />

                {/* Pop-up Dialogue Modal for Account Deletion */}
                <DeleteAccountModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    isSubmitting={isSubmittingDelete}
                />
            </div>
        </>
    );
};

export default Account;
