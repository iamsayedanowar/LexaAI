// Modules
import PropTypes from "prop-types";
import Avatar from "./Avatar";
import { useLoaderData } from "react-router-dom";
import { useToggle } from "../hooks/useToggle";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import openFile from "../utils/openFile";
import { Copy, Check, FileText, File, ChevronUp, ChevronDown, X } from "lucide-react";

/**
 * Parse prompt text to separate attached images, file badges, and user text
 */
const parsePromptContent = (rawText) => {
    if (!rawText) return { images: [], files: [], text: '' };

    const images = [];
    const files = [];

    // Extract markdown images: ![alt](data:image/...) or ![alt](http...)
    const imgRegex = /!\[(.*?)\]\((data:image\/[a-zA-Z0-9+.-]+;base64,[^)]+|https?:\/\/[^)]+)\)/g;
    let match;
    let cleanText = rawText;

    while ((match = imgRegex.exec(rawText)) !== null) {
        images.push({ alt: match[1] || 'Attached image', url: match[2] });
    }
    cleanText = cleanText.replace(imgRegex, '');

    // Extract file links with URL: [📎 filename (size)](url)
    const fileLinkRegex = /\[📎 (.*?)\]\(((?:data:[^)]+|https?:\/\/[^)]+|blob:[^)]+))\)/g;
    while ((match = fileLinkRegex.exec(cleanText)) !== null) {
        files.push({ name: match[1], url: match[2] });
    }
    cleanText = cleanText.replace(fileLinkRegex, '');

    // Extract file badges: 📎 **[filename (size)]**
    const fileBadgeRegex = /📎 \*\*\[(.*?)\]\*\*/g;
    while ((match = fileBadgeRegex.exec(cleanText)) !== null) {
        files.push({ name: match[1], url: null });
    }
    cleanText = cleanText.replace(fileBadgeRegex, '');

    return {
        images,
        files,
        text: cleanText.trim()
    };
};

const UserPrompt = ({ text }) => {
    const { user } = useLoaderData() || {};
    const [isExpended, toggleExpended] = useToggle();
    const textBoxRef = useRef(null);
    const [hasMoreContent, setMoreContent] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const { showSnackbar } = useSnackbar();

    const { images, files, text: cleanText } = useMemo(() => parsePromptContent(text), [text]);

    useEffect(() => {
        if (textBoxRef.current) {
            setMoreContent(
                textBoxRef.current.scrollHeight > textBoxRef.current.clientHeight
            );
        } else {
            setMoreContent(false);
        }
    }, [cleanText]);

    const handleCopy = useCallback(async () => {
        try {
            const textToCopy = cleanText || (files.length > 0 ? files.map(f => f.name).join(', ') : 'Attached file');
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy prompt:', err);
        }
    }, [cleanText, files]);

    return (
        <article className="py-4 border-b border-light-outline/10 dark:border-dark-outline/10">
            <div className="flex items-start gap-3 sm:gap-4">
                <Avatar name={user?.name} />

                <div className="min-w-0 flex-1 space-y-2.5">
                    {/* User Name & Time/Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-bodySmall font-semibold text-light-onSurface dark:text-dark-onSurface">
                            {user?.name || 'You'}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`p-1 rounded hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors ${
                                isCopied
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 hover:text-light-onSurface dark:hover:text-dark-onSurface'
                            }`}
                            title={isCopied ? "Copied" : "Copy prompt"}
                            aria-label={isCopied ? "Prompt copied to clipboard" : "Copy prompt"}
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 block" />
                            ) : (
                                <Copy className="w-4 h-4 block" />
                            )}
                        </button>
                    </div>

                    {/* Attached Images */}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-0.5">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(img.url)}
                                    className="block max-w-[240px] sm:max-w-[300px] rounded-md overflow-hidden border border-light-outline/15 dark:border-dark-outline/15 shadow-subtle hover:opacity-95 transition-opacity cursor-zoom-in text-left"
                                    title="Click to view full image"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.alt}
                                        className="w-full max-h-52 object-contain bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Attached Document Badges */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-0.5">
                            {files.map((file, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => openFile(file, showSnackbar)}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest rounded-lg border border-light-outline/15 dark:border-dark-outline/15 text-bodySmall font-medium text-light-onSurface dark:text-dark-onSurface transition-colors cursor-pointer group shadow-subtle text-left"
                                    title={file.url ? `Click to open ${file.name}` : file.name}
                                >
                                    {file.name.toLowerCase().includes('.pdf') ? (
                                        <FileText className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                    ) : (
                                        <File className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                    )}
                                    <span className="group-hover:underline underline-offset-2">{file.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Clean User Text */}
                    {cleanText && (
                        <div>
                            <p
                                className={`text-bodyLarge text-light-onSurface dark:text-dark-onSurface whitespace-pre-wrap break-words leading-relaxed ${!isExpended ? 'line-clamp-6' : ''
                                    }`}
                                ref={textBoxRef}
                            >
                                {cleanText}
                            </p>
                            {hasMoreContent && (
                                <button
                                    type="button"
                                    onClick={toggleExpended}
                                    className="text-bodySmall font-medium text-light-primary dark:text-dark-primary hover:underline mt-1 inline-flex items-center gap-0.5"
                                >
                                    <span>{isExpended ? 'Show less' : 'Show more'}</span>
                                    {isExpended ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="Full preview"
                            className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-elevation5"
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                            aria-label="Close image preview"
                        >
                            <X className="w-5 h-5 block" />
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
};

UserPrompt.propTypes = {
    text: PropTypes.string
};

export default UserPrompt;
