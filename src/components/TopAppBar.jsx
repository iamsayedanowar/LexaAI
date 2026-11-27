// Modules
import { IconBtn } from "./Button";
import { useNavigation, useLoaderData, useParams, useSubmit, useMatches } from "react-router-dom";
import { LinearProgress } from "./Progress";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import PropTypes from "prop-types";
import deleteConversation from "../utils/deleteConversation";
import renameConversation from "../utils/renameConversation";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RenameModal from "./RenameModal";
import ThemeToggle from "./ThemeToggle";
import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, MoreVertical, Pencil, Trash2, FileText, Printer, Download } from "lucide-react";
import { databases, CHATS_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import {
    exportConversationAsDoc,
    exportConversationAsPdf,
    exportConversationAsMarkdown
} from "../utils/exportChat";

const TopAppBar = ({ toggleSidebar }) => {
    const navigation = useNavigation();
    const isNormalLoad = navigation.state === 'loading' && !navigation.formData;
    const loaderData = useLoaderData() || {};
    const conversations = loaderData.conversations;
    const params = useParams();
    const submit = useSubmit();
    const matches = useMatches();

    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showMenu]);

    const activeConversation = conversations?.documents?.find(({ $id }) => params.conversationId === $id);

    // Retrieve conversation chat documents for active conversation
    const getChats = useCallback(async () => {
        const matchedChats = matches.find(m => m.data?.conversation)?.data?.conversation?.chats;
        if (matchedChats && matchedChats.length > 0) {
            return matchedChats;
        }
        if (params.conversationId) {
            try {
                const res = await databases.listDocuments(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    CHATS_COLLECTION_ID,
                    [
                        Query.equal('conversation', params.conversationId),
                        Query.orderAsc('$createdAt')
                    ]
                );
                return res.documents;
            } catch (err) {
                console.error('Error fetching chats for export:', err);
            }
        }
        return [];
    }, [matches, params.conversationId]);

    const handleExportDoc = async () => {
        setShowMenu(false);
        const chats = await getChats();
        if (!chats || chats.length === 0) return;
        exportConversationAsDoc({
            title: activeConversation?.title,
            chats
        });
    };

    const handleExportPdf = async () => {
        setShowMenu(false);
        const chats = await getChats();
        if (!chats || chats.length === 0) return;
        exportConversationAsPdf({
            title: activeConversation?.title,
            chats
        });
    };

    const handleExportMarkdown = async () => {
        setShowMenu(false);
        const chats = await getChats();
        if (!chats || chats.length === 0) return;
        exportConversationAsMarkdown({
            title: activeConversation?.title,
            chats
        });
    };

    const handleRename = () => {
        setShowMenu(false);
        if (!activeConversation) return;
        setShowRenameModal(true);
    };

    const handleDeleteClick = () => {
        setShowMenu(false);
        if (activeConversation) {
            setShowDeleteModal(true);
        }
    };

    return (
        <header className="relative flex items-center justify-between h-14 px-2 sm:px-4 border-b border-light-outline/10 dark:border-dark-outline/10 bg-light-background/80 dark:bg-dark-background/80 backdrop-blur-md z-20">
            {/* Left: Mobile Sidebar Toggle / Desktop Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
                <IconBtn
                    title="Toggle menu"
                    classes="lg:hidden"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-5 h-5" />
                </IconBtn>

                <div className="flex items-center gap-2 min-w-0">
                    <span className="hidden sm:inline-block text-bodySmall font-medium text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60">
                        LexaAI
                    </span>
                    <span className="hidden sm:inline-block text-light-onSurfaceVariant/40 dark:text-dark-onSurfaceVariant/40">/</span>
                    <h2 className="text-bodyMedium font-medium text-light-onSurface dark:text-dark-onSurface truncate max-w-[200px] sm:max-w-[400px]">
                        {activeConversation?.title || 'New chat'}
                    </h2>
                </div>
            </div>

            {/* Right: Theme Toggle & Actions for Active Conversation */}
            <div className="flex items-center gap-1.5 ms-auto">
                <ThemeToggle />

                {params.conversationId && (
                    <div className="relative" ref={menuRef}>
                        <IconBtn
                            title="Chat options"
                            size="small"
                            onClick={() => setShowMenu(prev => !prev)}
                            aria-expanded={showMenu}
                            aria-haspopup="menu"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </IconBtn>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-md shadow-elevation3 py-1 flex flex-col overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={handleExportDoc}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                        <span>Export as Docs (.doc)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportPdf}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                    >
                                        <Printer className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                        <span>Export as PDF (.pdf)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportMarkdown}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                        <span>Export as Markdown (.md)</span>
                                    </button>

                                    <div className="my-1 border-t border-light-outline/10 dark:border-dark-outline/10" />

                                    <button
                                        type="button"
                                        onClick={handleRename}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                    >
                                        <Pencil className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                        <span>Rename chat</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteClick}
                                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-bodySmall font-medium transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                        <span>Delete chat</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Custom Pop-up Rename Dialogue Modal */}
            <RenameModal
                isOpen={showRenameModal}
                currentTitle={activeConversation?.title || ''}
                onCancel={() => setShowRenameModal(false)}
                onSave={(newTitle) => {
                    if (activeConversation && newTitle && newTitle !== activeConversation.title) {
                        renameConversation({ id: params.conversationId, newTitle, submit });
                    }
                    setShowRenameModal(false);
                }}
            />

            {/* Custom Pop-up Delete Confirmation Modal Dialog */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title={activeConversation?.title}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (activeConversation) {
                        deleteConversation({
                            id: params.conversationId,
                            title: activeConversation.title,
                            submit
                        });
                        setShowDeleteModal(false);
                    }
                }}
            />

            <AnimatePresence>
                {isNormalLoad && <LinearProgress classes="absolute top-full left-0 right-0 z-30" />}
            </AnimatePresence>
        </header>
    );
};

TopAppBar.propTypes = {
    toggleSidebar: PropTypes.func
};

export default TopAppBar;
