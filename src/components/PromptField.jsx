// Modules
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSubmit, useNavigation, useParams } from "react-router-dom";
import { FREE_MODELS, DEFAULT_MODEL_ID, getValidModelId, abortCurrentRequest } from "../lib/openrouter";
import { useSnackbar } from "../hooks/useSnackbar";
import openFile from "../utils/openFile";
import {
    FileText,
    File,
    X,
    Paperclip,
    Bot,
    MessageSquare,
    ChevronUp,
    ChevronDown,
    Search,
    CheckCircle2,
    Image as ImageIcon,
    Info,
    Square,
    ArrowUp,
    LayoutGrid,
    Eye,
    Zap,
    Code,
    Brain
} from "lucide-react";

const FILTER_TABS = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'vision', label: 'Vision', icon: Eye },
    { id: 'text', label: 'Text Only', icon: FileText },
    { id: '1m', label: '1M Context', icon: Zap },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'reasoning', label: 'Reasoning', icon: Brain }
];

const PromptField = () => {
    const inputField = useRef(null);
    const inputFieldContainer = useRef(null);
    const fileInputRef = useRef(null);
    const modelMenuRef = useRef(null);
    const filterChipsRef = useRef(null);

    const submit = useSubmit();
    const navigation = useNavigation();
    const { conversationId } = useParams();
    const { showSnackbar } = useSnackbar();

    const [placeholderShown, setPlaceholderShown] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipTimeoutRef = useRef(null);

    // Compute filter counts for each tab
    const filterCounts = useMemo(() => ({
        all: FREE_MODELS.length,
        vision: FREE_MODELS.filter(m => m.supportsVision).length,
        text: FREE_MODELS.filter(m => !m.supportsVision).length,
        '1m': FREE_MODELS.filter(m => m.contextLength === '1M').length,
        coding: FREE_MODELS.filter(m => m.tags?.includes('coding')).length,
        reasoning: FREE_MODELS.filter(m => m.tags?.includes('reasoning')).length,
    }), []);

    // Filter models by selected tab criteria and search query
    const filteredModels = useMemo(() => {
        return FREE_MODELS.filter((model) => {
            if (selectedFilter === 'vision' && !model.supportsVision) return false;
            if (selectedFilter === 'text' && model.supportsVision) return false;
            if (selectedFilter === '1m' && model.contextLength !== '1M') return false;
            if (selectedFilter === 'coding' && !model.tags?.includes('coding')) return false;
            if (selectedFilter === 'reasoning' && !model.tags?.includes('reasoning')) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesName = model.name.toLowerCase().includes(query);
                const matchesProvider = model.provider.toLowerCase().includes(query);
                const matchesDesc = (model.description || '').toLowerCase().includes(query);
                const matchesCtx = (model.contextLength || '').toLowerCase().includes(query);
                const matchesFormats = (model.supportedFormats || '').toLowerCase().includes(query);
                return matchesName || matchesProvider || matchesDesc || matchesCtx || matchesFormats;
            }

            return true;
        });
    }, [selectedFilter, searchQuery]);

    const showTooltip = (e, model) => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        setActiveTooltip({
            model,
            coords: {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right
            }
        });
    };

    const hideTooltip = () => {
        tooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(null);
        }, 150);
    };

    const cancelHideTooltip = () => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };

    // Close tooltip on Escape key, window resize, or scroll
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveTooltip(null);
                setShowModelMenu(false);
            }
        };
        const handleScroll = () => {
            setActiveTooltip(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        };
    }, []);

    const getTooltipStyle = (coords) => {
        if (!coords) return {};
        const isMobile = window.innerWidth < 640;
        const padding = 12;
        const tooltipWidth = isMobile ? Math.min(window.innerWidth - (padding * 2), 300) : 320;
        const tooltipHeight = 170;

        let left = 0;
        if (isMobile) {
            left = Math.max(padding, (window.innerWidth - tooltipWidth) / 2);
        } else {
            const hasSpaceRight = coords.right + tooltipWidth + padding <= window.innerWidth;
            if (hasSpaceRight) {
                left = coords.right + padding;
            } else {
                left = Math.max(padding, coords.left - tooltipWidth - padding);
            }
        }

        let top = coords.top - 40;
        if (top + tooltipHeight + padding > window.innerHeight) {
            top = Math.max(padding, window.innerHeight - tooltipHeight - padding);
        }
        if (top < padding) {
            top = padding;
        }

        return {
            top: `${top}px`,
            left: `${left}px`
        };
    };

    // Persist selected model in localStorage
    const [selectedModel, setSelectedModel] = useState(() => {
        try {
            const saved = localStorage.getItem('lexaai_selected_model');
            return getValidModelId(saved);
        } catch {
            return DEFAULT_MODEL_ID;
        }
    });

    const activeModelObj = FREE_MODELS.find(m => m.id === selectedModel) || FREE_MODELS[0];
    const hasContent = inputValue.trim().length > 0 || attachments.length > 0;
    const isGenerating = navigation.state === 'submitting' || (navigation.state === 'loading' && Boolean(navigation.formData));

    const handleStop = (e) => {
        e?.stopPropagation();
        abortCurrentRequest();
    };

    const handleModelSelect = (modelId) => {
        const valid = getValidModelId(modelId);
        setSelectedModel(valid);
        try {
            localStorage.setItem('lexaai_selected_model', valid);
        } catch (e) {
            console.error('Failed to save model to localStorage:', e);
        }
        setShowModelMenu(false);
        setActiveTooltip(null);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
                setShowModelMenu(false);
                setActiveTooltip(null);
            }
        };
        if (showModelMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showModelMenu]);

    // Convert mouse wheel scroll into horizontal scrolling on filter chips
    useEffect(() => {
        if (!showModelMenu) return;
        const chipsContainer = filterChipsRef.current;
        if (!chipsContainer) return;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                chipsContainer.scrollLeft += e.deltaY;
            }
        };

        chipsContainer.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            chipsContainer.removeEventListener('wheel', handleWheel);
        };
    }, [showModelMenu]);

    const handleInputChange = useCallback(() => {
        if (!inputField.current) return;
        if (inputField.current.innerText === '\n') inputField.current.innerHTML = '';
        const trimmed = inputField.current.innerText.trim();
        setPlaceholderShown(!trimmed);
        setInputValue(trimmed);
    }, []);

    const moveCursorToEnd = useCallback(() => {
        const editableElem = inputField.current;
        if (!editableElem) return;
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableElem);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, []);

    // Listen to custom set-prompt event from Greetings starter cards
    useEffect(() => {
        const handleSetPrompt = (e) => {
            const text = e.detail;
            if (text && inputField.current) {
                inputField.current.innerText = text;
                setInputValue(text);
                setPlaceholderShown(false);
                inputField.current.focus();
                moveCursorToEnd();
            }
        };
        window.addEventListener('lexaai:set-prompt', handleSetPrompt);
        return () => window.removeEventListener('lexaai:set-prompt', handleSetPrompt);
    }, [moveCursorToEnd]);

    // Handle File Selection
    const handleFiles = useCallback((fileList) => {
        const maxSingleFileSize = 10 * 1024 * 1024; // 10MB
        const maxTotalSize = 15 * 1024 * 1024; // 15MB total

        let currentTotalSize = attachments.reduce((sum, a) => sum + (a.size || 0), 0);

        Array.from(fileList).forEach(file => {
            if (file.size > maxSingleFileSize) {
                showSnackbar({ message: `File "${file.name}" exceeds 10MB limit.`, type: 'error', timeOut: 3000 });
                return;
            }

            if (currentTotalSize + file.size > maxTotalSize) {
                showSnackbar({ message: `Total attachments cannot exceed 15MB.`, type: 'error', timeOut: 3000 });
                return;
            }

            currentTotalSize += file.size;
            const reader = new FileReader();

            reader.onerror = () => {
                showSnackbar({ message: `Failed to read "${file.name}".`, type: 'error', timeOut: 3000 });
            };

            const isTextOrSvg = file.type.startsWith('text/') ||
                file.type === 'image/svg+xml' ||
                /\.(txt|py|js|jsx|ts|tsx|json|csv|md|html|css|yaml|yml|xml|sql|svg)$/i.test(file.name);

            if (isTextOrSvg) {
                reader.onload = (event) => {
                    const text = event.target.result;
                    setAttachments(prev => [
                        ...prev,
                        {
                            id: `${file.name}-${Date.now()}-${Math.random()}`,
                            name: file.name,
                            size: file.size,
                            type: file.type || 'text/plain',
                            textContent: text,
                            dataUrl: `data:${file.type || 'text/plain'};charset=utf-8,${encodeURIComponent(text)}`
                        }
                    ]);
                };
                reader.readAsText(file);
            } else {
                reader.onload = (event) => {
                    setAttachments(prev => [
                        ...prev,
                        {
                            id: `${file.name}-${Date.now()}-${Math.random()}`,
                            name: file.name,
                            size: file.size,
                            type: file.type || 'application/octet-stream',
                            dataUrl: event.target.result,
                            textContent: null
                        }
                    ]);
                };
                reader.readAsDataURL(file);
            }
        });
    }, [attachments, showSnackbar]);

    const handlePaste = useCallback((e) => {
        if (e.clipboardData?.files?.length) {
            e.preventDefault();
            handleFiles(e.clipboardData.files);
            return;
        }
        e.preventDefault();
        if (inputField.current) {
            inputField.current.innerText += e.clipboardData.getData('text');
            handleInputChange();
            moveCursorToEnd();
        }
    }, [handleFiles, handleInputChange, moveCursorToEnd]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    };

    const removeAttachment = (id) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const handleSubmit = useCallback(() => {
        if ((!inputValue && attachments.length === 0) || isGenerating) return;

        submit(
            {
                user_prompt: inputValue,
                model: selectedModel,
                attached_files: JSON.stringify(attachments),
                request_type: 'user_prompt'
            },
            {
                method: 'POST',
                encType: 'application/x-www-form-urlencoded',
                action: `/${conversationId || ''}`
            }
        );

        if (inputField.current) {
            inputField.current.innerHTML = '';
        }
        setAttachments([]);
        handleInputChange();
    }, [handleInputChange, inputValue, attachments, isGenerating, submit, conversationId, selectedModel]);

    return (
        <div
            className="relative flex flex-col p-3 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-outline/20 dark:border-dark-outline/20 shadow-elevation1 focus-within:border-light-primary/50 dark:focus-within:border-dark-primary/50 focus-within:shadow-elevation2 transition-colors cursor-text"
            ref={inputFieldContainer}
            onClick={(e) => {
                if (e.target === inputFieldContainer.current) {
                    inputField.current?.focus();
                }
            }}
        >
            {/* 1. Attached Files Preview Chips */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2.5 border-b border-light-outline/10 dark:border-dark-outline/10 max-h-36 overflow-y-auto">
                    {attachments.map((file) => {
                        const isImg = file.dataUrl && (file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name));
                        return (
                            <div
                                key={file.id}
                                onClick={() => openFile(file, showSnackbar)}
                                className="flex items-center gap-1.5 bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurface dark:text-dark-onSurface px-1 py-1 rounded-lg text-bodySmall border border-light-outline/15 dark:border-dark-outline/15 shadow-subtle hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors cursor-pointer group/chip select-none"
                                title={`Click to open ${file.name}`}
                            >
                                {isImg ? (
                                    <img src={file.dataUrl} alt="" className="w-4 h-4 object-cover rounded" />
                                ) : file.type?.includes('pdf') || file.name.toLowerCase().endsWith('.pdf') ? (
                                    <FileText className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                ) : (
                                    <File className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                )}
                                <span className="max-w-[130px] truncate font-medium">
                                    {file.name}
                                </span>
                                <span className="text-[11px] opacity-60">
                                    ({Math.round((file.size || 0) / 1024)} KB)
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeAttachment(file.id);
                                    }}
                                    className="opacity-50 hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ml-0.5 transition-opacity"
                                    title="Remove attachment"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="w-3.5 h-3.5 block" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 2. Text Input Area */}
            <div className="w-full relative px-1 py-0.5">
                <div
                    className="outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none min-h-[44px] max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words text-bodyLarge text-light-onSurface dark:text-dark-onSurface leading-relaxed relative"
                    contentEditable={true}
                    role="textbox"
                    aria-multiline={true}
                    aria-label="Ask LexaAI"
                    style={{ outline: 'none', boxShadow: 'none' }}
                    ref={inputField}
                    onInput={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />

                {placeholderShown && (
                    <div className="absolute left-1 top-0.5 pointer-events-none text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50 text-bodyLarge select-none">
                        Ask LexaAI, attach images or code, or switch models...
                    </div>
                )}
            </div>

            {/* 3. Bottom Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-light-outline/10 dark:border-dark-outline/10 mt-1">
                {/* Left Side: Attach Button + Model Selector Pill */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,.pdf,.txt,.py,.js,.jsx,.ts,.tsx,.json,.csv,.md,.html,.css,.yaml,.yml,.xml,.sql,.svg"
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest hover:text-light-onSurface dark:hover:text-dark-onSurface transition-colors"
                        title="Attach files (Images, PDFs, Text/Code)"
                        aria-label="Attach files"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Model Selector Pill */}
                    <div className="static sm:relative flex items-center" ref={modelMenuRef}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModelMenu(prev => !prev);
                            }}
                            className="flex items-center gap-1.5 h-7 px-2.5 bg-light-surfaceContainerHigh/90 dark:bg-dark-surfaceContainerHigh/90 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest rounded-lg border border-light-outline/15 dark:border-dark-outline/15 text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                            title="Select Free OpenRouter Model"
                            aria-expanded={showModelMenu}
                            aria-haspopup="listbox"
                        >
                            {activeModelObj.supportsVision ? (
                                <Bot className="w-3.5 h-3.5 text-light-primary dark:text-dark-primary" />
                            ) : (
                                <MessageSquare className="w-3.5 h-3.5 text-light-primary dark:text-dark-primary" />
                            )}
                            <span className="max-w-[120px] sm:max-w-[170px] truncate text-[12px] font-medium">
                                {activeModelObj.name}
                            </span>
                            {showModelMenu ? (
                                <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                            )}
                        </button>

                        {/* Model Dropdown Menu */}
                        <AnimatePresence>
                            {showModelMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                    transition={{ duration: 0.14, ease: 'easeOut' }}
                                    className="absolute bottom-full mb-2 left-0 right-0 sm:right-auto sm:left-0 z-50 w-full sm:w-96 max-w-sm sm:max-w-none bg-light-surface dark:bg-dark-surface border border-light-outline/20 dark:border-dark-outline/20 rounded-2xl shadow-elevation3 pt-2 pb-0 overflow-hidden flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header: Title, Price Badge, Search Input, Filter Tabs */}
                                    <div className="px-3 pb-2 border-b border-light-outline/10 dark:border-dark-outline/10 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-light-primary dark:text-dark-primary">
                                                Free OpenRouter Models
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded">
                                                100% Free
                                            </span>
                                        </div>

                                        {/* Search Filter Input */}
                                        <div className="relative flex items-center">
                                            <Search className="w-3.5 h-3.5 text-light-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50 absolute left-2.5 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search models, providers, context..."
                                                className="w-full h-7 pl-8 pr-7 bg-light-surfaceContainerHigh/60 dark:bg-dark-surfaceContainerHigh/60 rounded-sm text-[12px] text-light-onSurface dark:text-dark-onSurface placeholder:text-light-onSurfaceVariant/50 dark:placeholder:text-dark-onSurfaceVariant/50 border border-light-outline/15 dark:border-dark-outline/15 focus:outline-none focus:border-light-primary dark:focus:border-dark-primary transition-colors"
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-2 text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 hover:text-light-onSurface dark:hover:text-dark-onSurface"
                                                    aria-label="Clear search"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Filter Chips */}
                                        <div
                                            ref={filterChipsRef}
                                            onWheel={(e) => {
                                                if (e.deltaY !== 0 && filterChipsRef.current) {
                                                    filterChipsRef.current.scrollLeft += e.deltaY;
                                                }
                                            }}
                                            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 overscroll-x-contain"
                                        >
                                            {FILTER_TABS.map((tab) => {
                                                const isActive = selectedFilter === tab.id;
                                                const count = filterCounts[tab.id];
                                                const TabIcon = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setSelectedFilter(tab.id)}
                                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium transition-colors shrink-0 ${isActive
                                                            ? 'bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary'
                                                            : 'bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest'
                                                            }`}
                                                    >
                                                        <TabIcon className="w-3 h-3 shrink-0" />
                                                        <span>{tab.label}</span>
                                                        <span className="text-[10px] opacity-70">
                                                            ({count})
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Models List */}
                                    <div className="max-h-60 overflow-y-auto py-1">
                                        {filteredModels.length === 0 ? (
                                            <div className="py-6 px-4 text-center">
                                                <p className="text-[12px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant font-medium">
                                                    No models match your filter.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFilter('all');
                                                        setSearchQuery('');
                                                    }}
                                                    className="mt-1 text-[11px] font-semibold text-light-primary dark:text-dark-primary hover:underline"
                                                >
                                                    Reset filters
                                                </button>
                                            </div>
                                        ) : (
                                            filteredModels.map((model) => {
                                                const isSelected = model.id === selectedModel;
                                                return (
                                                    <div
                                                        key={model.id}
                                                        onClick={() => handleModelSelect(model.id)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                handleModelSelect(model.id);
                                                            }
                                                        }}
                                                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors cursor-pointer ${isSelected ? 'bg-light-surfaceContainerHigh/80 dark:bg-dark-surfaceContainerHigh/80' : ''
                                                            }`}
                                                    >
                                                        {isSelected ? (
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-light-primary dark:text-dark-primary" />
                                                        ) : model.supportsVision ? (
                                                            <ImageIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                                                        )}
                                                        <div className="grow min-w-0">
                                                            <div className="flex items-center justify-between gap-1.5">
                                                                <span className="text-bodySmall font-semibold text-light-onSurface dark:text-dark-onSurface truncate">
                                                                    {model.name}
                                                                </span>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <span className="text-[10px] px-1 bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest rounded text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant font-medium">
                                                                        {model.contextLength}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (activeTooltip?.model?.id === model.id) {
                                                                                setActiveTooltip(null);
                                                                            } else {
                                                                                showTooltip(e, model);
                                                                            }
                                                                        }}
                                                                        onMouseEnter={(e) => showTooltip(e, model)}
                                                                        onMouseLeave={hideTooltip}
                                                                        className="p-0.5 rounded text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 hover:text-light-primary dark:hover:text-dark-primary"
                                                                        title={`Info for ${model.name}`}
                                                                        aria-label={`View capabilities for ${model.name}`}
                                                                    >
                                                                        <Info className="w-3.5 h-3.5 block" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-[11px] text-light-onSurfaceVariant/80 dark:text-dark-onSurfaceVariant/80 truncate">
                                                                {model.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Side: Stop or Submit Button */}
                <div className="flex items-center shrink-0">
                    {isGenerating ? (
                        <button
                            type="button"
                            onClick={handleStop}
                            className="w-8 h-8 rounded-md flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors shadow-subtle active:scale-95"
                            title="Stop generation"
                            aria-label="Stop generation"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!hasContent || navigation.state === 'submitting'}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${hasContent && navigation.state !== 'submitting'
                                ? 'bg-light-primary text-light-onPrimary dark:bg-dark-primary dark:text-dark-onPrimary shadow-subtle hover:opacity-90 active:scale-95'
                                : 'bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurfaceVariant/40 dark:text-dark-onSurfaceVariant/40 cursor-not-allowed'
                                }`}
                            title="Send prompt"
                            aria-label="Send prompt"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Model Info Tooltip Popover */}
            {activeTooltip && createPortal(
                <div
                    role="tooltip"
                    onMouseEnter={cancelHideTooltip}
                    onMouseLeave={hideTooltip}
                    style={{
                        position: 'fixed',
                        ...getTooltipStyle(activeTooltip.coords)
                    }}
                    className="z-[9999] w-[calc(100vw-24px)] max-w-[300px] sm:max-w-none sm:w-80 bg-light-surface dark:bg-dark-surface border border-light-outline/25 dark:border-dark-outline/25 rounded-2xl shadow-elevation4 p-3.5 text-light-onSurface dark:text-dark-onSurface backdrop-blur-md pointer-events-auto select-text animate-in fade-in zoom-in-95"
                >
                    <div className="flex items-center justify-between gap-2 border-b border-light-outline/10 dark:border-dark-outline/10 pb-2 mb-2">
                        <div className="min-w-0">
                            <h4 className="text-bodyMedium font-bold text-light-onSurface dark:text-dark-onSurface truncate">
                                {activeTooltip.model.name}
                            </h4>
                            <span className="text-[11px] text-light-primary dark:text-dark-primary font-medium">
                                {activeTooltip.model.provider}
                            </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest font-semibold">
                            {activeTooltip.model.contextLength} ctx
                        </span>
                    </div>

                    <div className="mb-2 text-[12px]">
                        <span className="font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">Vision support: </span>
                        <span className={activeTooltip.model.supportsVision ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'opacity-70'}>
                            {activeTooltip.model.supportsVision ? 'Images & PDFs' : 'Text only'}
                        </span>
                    </div>

                    <div className="text-[11px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant leading-relaxed bg-light-surfaceContainerHigh/50 dark:bg-dark-surfaceContainerHigh/50 p-2 rounded-lg">
                        {activeTooltip.model.details || activeTooltip.model.description}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PromptField;
