// Modules
import PropTypes from "prop-types";
import Logo from "./Logo";
import { ExtendedFab, IconBtn } from "./Button";
import { NavLink, Link, useLoaderData, useSubmit, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import deleteConversation from "../utils/deleteConversation";
import renameConversation from "../utils/renameConversation";
import DeleteConfirmModal from "./DeleteConfirmModal";
import RenameModal from "./RenameModal";
import Avatar from "./Avatar";
import logout from "../utils/logout";
import { useState, useRef, useEffect } from "react";
import { X, MessageSquare, Check, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp, User, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const loaderData = useLoaderData() || {};
    const conversations = loaderData.conversations;
    const user = loaderData.user;
    const conversationData = conversations?.documents || [];
    const { conversationId } = useParams();
    const submit = useSubmit();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Chat 3-dot options menu and inline rename state
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [renameTarget, setRenameTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const chatMenuRef = useRef(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
            if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) {
                setActiveMenuId(null);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowUserMenu(false);
                setActiveMenuId(null);
                setEditingId(null);
            }
        };
        if (showUserMenu || activeMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showUserMenu, activeMenuId]);

    // Auto-focus and select text when entering rename mode
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleRenameSubmit = (e, id, currentTitle) => {
        e?.preventDefault();
        const trimmed = editTitle.trim();
        if (!trimmed || trimmed === currentTitle) {
            setEditingId(null);
            return;
        }
        renameConversation({ id, newTitle: trimmed, submit });
        setEditingId(null);
    };

    return (
        <>
            <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`} aria-label="Sidebar navigation">
                <div className="sidebar-inner">
                    {/* Header Brand Row */}
                    <div className="h-12 flex items-center justify-between mb-3">
                        <Link to="/" className="flex items-center gap-2.5">
                            <Logo size={26} />
                            <span className="font-bold text-titleLarge tracking-tight text-light-onSurface dark:text-dark-onSurface leading-none">
                                LexaAI
                            </span>
                        </Link>
                        <IconBtn
                            title="Close sidebar"
                            size="small"
                            classes="lg:hidden"
                            onClick={toggleSidebar}
                        >
                            <X className="w-4 h-4" />
                        </IconBtn>
                    </div>

                    {/* New Chat Primary Action */}
                    <div className="mb-4">
                        <ExtendedFab
                            href="/"
                            text="New chat"
                            classes="w-full"
                            onClick={() => {
                                if (isSidebarOpen) toggleSidebar();
                            }}
                            disabled={!conversationId}
                        />
                    </div>

                    {/* Chat History List */}
                    <div className="overflow-y-auto -me-1 pe-1 flex-1">
                        <div className="px-2 pb-2 text-[11px] font-medium text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 uppercase tracking-wider">
                            Recent chats
                        </div>

                        {conversationData.length === 0 ? (
                            <div className="px-3 py-6 text-center text-bodySmall text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60">
                                No chats yet. Send a prompt to begin.
                            </div>
                        ) : (
                            <nav className="space-y-0.5">
                                {conversationData.map((item, index) => {
                                    const isEditing = editingId === item.$id;
                                    const isMenuOpen = activeMenuId === item.$id;
                                    const isNearBottom = index >= conversationData.length - 2 && conversationData.length > 3;

                                    if (isEditing) {
                                        return (
                                            <form
                                                key={item.$id}
                                                onSubmit={(e) => handleRenameSubmit(e, item.$id, item.title)}
                                                className="flex items-center gap-1.5 h-9 px-2.5 my-1 bg-light-surface dark:bg-dark-surface rounded-lg shadow-subtle"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MessageSquare className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                                <input
                                                    ref={editInputRef}
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') {
                                                            setEditingId(null);
                                                        }
                                                    }}
                                                    className="bg-transparent text-bodySmall text-light-onSurface dark:text-dark-onSurface focus:outline-none grow min-w-0 font-medium"
                                                    maxLength={100}
                                                />
                                                <button
                                                    type="submit"
                                                    className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                                                    title="Save name"
                                                    aria-label="Save name"
                                                >
                                                    <Check className="w-4 h-4 block" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    className="p-1 rounded text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                                                    title="Cancel"
                                                    aria-label="Cancel rename"
                                                >
                                                    <X className="w-4 h-4 block" />
                                                </button>
                                            </form>
                                        );
                                    }

                                    return (
                                        <div key={item.$id} className={`relative group ${isMenuOpen ? 'z-30' : 'z-0'}`}>
                                            <NavLink
                                                to={item.$id}
                                                className="nav-link !pr-8"
                                                title={item.title}
                                                onClick={() => {
                                                    setActiveMenuId(null);
                                                    if (isSidebarOpen) toggleSidebar();
                                                }}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                                                <span className="truncate text-bodySmall font-medium">{item.title}</span>
                                            </NavLink>

                                            {/* 3-dot More Options Button */}
                                            <div
                                                className={`absolute top-1/2 right-1 -translate-y-1/2 ${isMenuOpen ? 'z-40' : 'z-10'}`}
                                                ref={isMenuOpen ? chatMenuRef : null}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setActiveMenuId(prev => prev === item.$id ? null : item.$id);
                                                    }}
                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-opacity ${isMenuOpen
                                                        ? 'opacity-100 bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface'
                                                        : 'opacity-0 group-hover:opacity-100 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest'
                                                        }`}
                                                    title="Chat options"
                                                    aria-label={`Options for ${item.title}`}
                                                    aria-expanded={isMenuOpen}
                                                    aria-haspopup="menu"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <AnimatePresence>
                                                    {isMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            transition={{ duration: 0.12 }}
                                                            className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} z-50 w-36 bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-md shadow-elevation3 py-1 flex flex-col overflow-hidden`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    setRenameTarget({ id: item.$id, title: item.title });
                                                                }}
                                                                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                                                <span>Rename</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    setDeleteTarget({ id: item.$id, title: item.title });
                                                                }}
                                                                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-bodySmall font-medium transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    {/* Bottom Section: User Account & Copyright */}
                    <div className="mt-auto border-t border-light-outline/10 dark:border-dark-outline/10 pt-2">
                        <div className="relative mb-1" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setShowUserMenu(prev => !prev)}
                                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface transition-colors select-none text-left ${showUserMenu ? 'bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest' : ''
                                    }`}
                                title={user?.name || 'User menu'}
                                aria-label="User menu"
                                aria-expanded={showUserMenu}
                            >
                                <Avatar name={user?.name || 'User'} />
                                <div className="min-w-0 grow">
                                    <div className="text-bodySmall font-semibold truncate">
                                        {user?.name || 'User'}
                                    </div>
                                    <div className="text-[11px] text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 truncate">
                                        {user?.email || 'Active session'}
                                    </div>
                                </div>
                                {showUserMenu ? (
                                    <ChevronDown className="w-4 h-4 text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60" />
                                ) : (
                                    <ChevronUp className="w-4 h-4 text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60" />
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-md shadow-elevation3 p-1 flex flex-col"
                                    >
                                        {/* Theme Quick Selector */}
                                        <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60">
                                            Theme
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 px-1.5 pb-1">
                                            <button
                                                type="button"
                                                onClick={() => setTheme('light')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-[12px] font-medium transition-colors ${theme === 'light'
                                                    ? 'bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary shadow-subtle'
                                                    : 'bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest'
                                                    }`}
                                                title="Light theme"
                                            >
                                                <Sun className="w-3.5 h-3.5" />
                                                <span>Light</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTheme('dark')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-[12px] font-medium transition-colors ${theme === 'dark'
                                                    ? 'bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary shadow-subtle'
                                                    : 'bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest'
                                                    }`}
                                                title="Dark theme"
                                            >
                                                <Moon className="w-3.5 h-3.5" />
                                                <span>Dark</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTheme('system')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-[12px] font-medium transition-colors ${theme === 'system'
                                                    ? 'bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary shadow-subtle'
                                                    : 'bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest'
                                                    }`}
                                                title="System theme"
                                            >
                                                <Monitor className="w-3.5 h-3.5" />
                                                <span>System</span>
                                            </button>
                                        </div>

                                        <div className="my-1 border-t border-light-outline/10 dark:border-dark-outline/10" />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                if (isSidebarOpen) toggleSidebar();
                                                navigate('/account');
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-bodySmall font-medium text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors text-left"
                                        >
                                            <User className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                            <span>Account settings</span>
                                        </button>

                                        <div className="my-1 border-t border-light-outline/10 dark:border-dark-outline/10" />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                logout(navigate);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-bodySmall font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign out</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="px-2 pt-1 pb-1 text-[11px] text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50 flex justify-between items-center">
                            <span>© 2026 LexaAI</span>
                            <span>v1.0.0</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop overlay for mobile */}
            <div
                className={`overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
                aria-hidden="true"
            />

            {/* Custom Pop-up Rename Dialogue Modal */}
            <RenameModal
                isOpen={!!renameTarget}
                currentTitle={renameTarget?.title || ''}
                onCancel={() => setRenameTarget(null)}
                onSave={(newTitle) => {
                    if (renameTarget && newTitle && newTitle !== renameTarget.title) {
                        renameConversation({ id: renameTarget.id, newTitle, submit });
                    }
                    setRenameTarget(null);
                }}
            />

            {/* Custom Pop-up Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                title={deleteTarget?.title}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteConversation({ id: deleteTarget.id, title: deleteTarget.title, submit });
                        setDeleteTarget(null);
                    }
                }}
            />
        </>
    );
};

Sidebar.propTypes = {
    isSidebarOpen: PropTypes.bool,
    toggleSidebar: PropTypes.func
};

export default Sidebar;
