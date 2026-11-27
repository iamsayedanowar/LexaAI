// Modules
import PropTypes from "prop-types";
import { iconLogo } from "../assets/assets";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { hopscotch, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toTitleCase from "../utils/toTitleCase";
import { IconBtn } from "./Button";
import { Copy, Volume2, VolumeX, X, MoreHorizontal, Download, Check, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

// Clean markdown syntax for natural text-to-speech reading
const cleanTextForSpeech = (markdown) => {
    if (!markdown) return '';
    return markdown
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/^\s*>\s+/gm, '')
        .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const LANGUAGE_EXTENSIONS = {
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    python: 'py',
    py: 'py',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    csharp: 'cs',
    cs: 'cs',
    go: 'go',
    rust: 'rs',
    rs: 'rs',
    ruby: 'rb',
    rb: 'rb',
    php: 'php',
    swift: 'swift',
    kotlin: 'kt',
    kt: 'kt',
    sql: 'sql',
    bash: 'sh',
    sh: 'sh',
    shell: 'sh',
    zsh: 'sh',
    markdown: 'md',
    md: 'md',
    yaml: 'yaml',
    yml: 'yml',
    xml: 'xml',
    dockerfile: 'dockerfile',
    graphql: 'graphql',
    r: 'r',
    dart: 'dart',
    lua: 'lua',
    perl: 'pl'
};

const getExtensionForLanguage = (lang) => {
    if (!lang) return 'txt';
    const lower = lang.toLowerCase();
    return LANGUAGE_EXTENSIONS[lower] || lower;
};

/**
 * Convert markdown text into cleanly styled HTML for Word (.doc) and PDF export
 */
const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre style="background:#f4f7f5;border:1px solid #dce4e0;border-radius:6px;padding:12px;font-family:'JetBrains Mono',Consolas,monospace;font-size:12px;overflow-x:auto;"><code>${escaped}</code></pre>`;
    });

    // Tables
    html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableBlock) => {
        const lines = tableBlock.trim().split(/\r?\n/).filter(line => line.includes('|'));
        if (lines.length < 2) return tableBlock;

        let tableHtml = '<table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:13px;border:1px solid #dce4e0;">';
        let isHeader = true;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(line)) {
                isHeader = false;
                continue;
            }

            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            const tag = isHeader ? 'th' : 'td';
            const cellStyle = isHeader
                ? 'background-color:#edf2ef;font-weight:600;padding:10px 14px;border:1px solid #dce4e0;text-align:left;color:#131a18;'
                : 'padding:8px 14px;border:1px solid #dce4e0;text-align:left;color:#131a18;';

            tableHtml += '<tr>';
            for (const cell of cells) {
                tableHtml += `<${tag} style="${cellStyle}">${cell}</${tag}>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        return tableHtml;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:16px;font-weight:600;margin-top:16px;margin-bottom:8px;color:#131a18;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:18px;font-weight:600;margin-top:20px;margin-bottom:8px;color:#131a18;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:22px;font-weight:700;margin-top:24px;margin-bottom:10px;color:#0d7a68;">$1</h1>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:#edf2ef;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;">$1</code>');

    // Lists
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li style="margin-left:20px;line-height:1.6;">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li style="margin-left:20px;line-height:1.6;">$1</li>');

    // Paragraphs
    html = html.split(/\n\s*\n/).map(block => {
        if (/^<(?:h[1-6]|table|pre|ul|ol|li)/i.test(block.trim())) return block;
        return `<p style="line-height:1.6;margin-bottom:12px;">${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
};

/**
 * Custom Markdown Table component with horizontal overflow containment,
 * mouse-wheel horizontal scrolling support, and direct CSV export button.
 */
const TableBlock = ({ children, ...rest }) => {
    const tableWrapperRef = useRef(null);
    const [isExported, setIsExported] = useState(false);

    useEffect(() => {
        const el = tableWrapperRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (el.scrollWidth > el.clientWidth && e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
                const canScrollLeft = el.scrollLeft > 0;
                if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
                    e.preventDefault();
                    el.scrollLeft += e.deltaY;
                }
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const handleDownloadTableCsv = (e) => {
        e.stopPropagation();
        const el = tableWrapperRef.current;
        if (!el) return;

        const table = el.querySelector('table');
        if (!table) return;

        const rows = [];
        const trElements = table.querySelectorAll('tr');
        trElements.forEach(tr => {
            const cells = [];
            tr.querySelectorAll('th, td').forEach(cell => {
                cells.push(`"${cell.innerText.trim().replace(/"/g, '""')}"`);
            });
            if (cells.length > 0) {
                rows.push(cells.join(','));
            }
        });

        if (rows.length === 0) return;
        const csvContent = rows.join('\r\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `table-data-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsExported(true);
        setTimeout(() => setIsExported(false), 2000);
    };

    return (
        <div className="my-4 w-full max-w-full rounded-xl border border-light-outline/15 dark:border-dark-outline/15 bg-light-surfaceContainerLow dark:bg-dark-surfaceContainerLow shadow-subtle overflow-hidden">
            <div className="flex justify-between items-center px-1.5 py-1.5 border-b border-light-outline/10 dark:border-dark-outline/10 bg-light-surfaceContainer/50 dark:bg-dark-surfaceContainer/50 text-[11px] font-medium text-light-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70 select-none">
                <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Table</span>
                </span>
                <button
                    type="button"
                    onClick={handleDownloadTableCsv}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-onSurface dark:hover:text-dark-onSurface hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                    title="Export table as CSV/Excel"
                >
                    {isExported ? (
                        <>
                            <span>Exported</span>
                        </>
                    ) : (
                        <>
                            <span>Export CSV</span>
                        </>
                    )}
                </button>
            </div>
            <div
                ref={tableWrapperRef}
                className="w-full max-w-full overflow-x-auto overscroll-x-contain"
            >
                <table className="w-full min-w-full text-left border-collapse text-bodySmall sm:text-bodyMedium" {...rest}>
                    {children}
                </table>
            </div>
        </div>
    );
};

TableBlock.propTypes = {
    children: PropTypes.node
};

const AiResponse = ({ aiResponse, children }) => {
    const { resolvedTheme } = useTheme();
    const codeTheme = resolvedTheme === 'dark' ? hopscotch : oneDark;
    const [showMenu, setShowMenu] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isResponseCopied, setIsResponseCopied] = useState(false);
    const [copiedCodeId, setCopiedCodeId] = useState(null);
    const [downloadedCodeId, setDownloadedCodeId] = useState(null);
    const menuRef = useRef(null);
    const speechUtteranceRef = useRef(null);

    // Close options menu on outside click or Escape
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
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showMenu]);

    // Cancel speech on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsResponseCopied(true);
            setTimeout(() => setIsResponseCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy response:', err);
        }
    }, []);

    const handleCopyCode = async (codeText, blockId) => {
        try {
            await navigator.clipboard.writeText(codeText);
            setCopiedCodeId(blockId);
            setTimeout(() => setCopiedCodeId(null), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleDownloadCode = (codeText, lang, blockId) => {
        try {
            const ext = getExtensionForLanguage(lang);
            const fileName = ext === 'dockerfile' ? 'Dockerfile' : `snippet.${ext}`;
            const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setDownloadedCodeId(blockId);
            setTimeout(() => setDownloadedCodeId(null), 2000);
        } catch (err) {
            console.error('Failed to download code:', err);
        }
    };

    // Export response as Word (.doc) document
    const handleExportWord = () => {
        setShowMenu(false);
        if (!aiResponse) return;
        try {
            const bodyContent = markdownToHtml(aiResponse);
            const wordDocument = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>LexaAI Export</title>
                    <style>
                        body { font-family: "Calibri", "Segoe UI", Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e2925; padding: 24px; }
                        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
                        th, td { border: 1px solid #c2ccc7; padding: 8px 12px; text-align: left; }
                        th { background-color: #e7ece9; font-weight: bold; color: #002e25; }
                        pre { background: #f4f7f5; border: 1px solid #dce4e0; padding: 12px; font-family: "Consolas", monospace; font-size: 10pt; }
                        code { font-family: "Consolas", monospace; background: #edf2ef; padding: 2px 4px; font-size: 10pt; }
                        h1 { font-size: 20pt; font-weight: bold; color: #0d7a68; margin-top: 18pt; margin-bottom: 8pt; }
                        h2 { font-size: 16pt; font-weight: bold; color: #131a18; margin-top: 14pt; margin-bottom: 6pt; }
                        h3 { font-size: 13pt; font-weight: bold; color: #131a18; margin-top: 12pt; margin-bottom: 4pt; }
                        p { margin: 8pt 0; }
                        li { margin: 4pt 0; }
                    </style>
                </head>
                <body>
                    ${bodyContent}
                </body>
                </html>
            `;

            const blob = new Blob(['\ufeff' + wordDocument], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lexaai-response-${new Date().toISOString().slice(0, 10)}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export Word document:', err);
        }
    };

    // Export response tables / data as Excel (.csv) spreadsheet
    const handleExportExcel = () => {
        setShowMenu(false);
        if (!aiResponse) return;
        try {
            const lines = aiResponse.split(/\r?\n/);
            const rows = [];
            let inTable = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmed)) {
                    continue;
                }
                if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                    inTable = true;
                    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
                    rows.push(cells.map(c => `"${c.replace(/"/g, '""')}"`).join(','));
                } else if (inTable) {
                    rows.push('');
                    inTable = false;
                }
            }

            let csvContent;
            if (rows.length > 0) {
                csvContent = rows.join('\r\n');
            } else {
                csvContent = lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\r\n');
            }

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lexaai-data-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export Excel/CSV:', err);
        }
    };

    // Export response as PDF document (triggers formatted browser print / Save as PDF)
    const handleExportPdf = () => {
        setShowMenu(false);
        if (!aiResponse) return;
        try {
            const bodyContent = markdownToHtml(aiResponse);
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                window.print();
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>LexaAI Export</title>
                    <style>
                        @page { margin: 15mm; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Google Sans", sans-serif;
                            font-size: 13px;
                            line-height: 1.6;
                            color: #131a18;
                            padding: 16px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 16px 0;
                            page-break-inside: avoid;
                        }
                        th, td {
                            border: 1px solid #dce4e0;
                            padding: 8px 12px;
                            text-align: left;
                        }
                        th {
                            background-color: #edf2ef;
                            font-weight: 600;
                        }
                        pre {
                            background: #f4f7f5;
                            border: 1px solid #dce4e0;
                            border-radius: 6px;
                            padding: 12px;
                            font-family: "JetBrains Mono", Consolas, monospace;
                            font-size: 12px;
                            white-space: pre-wrap;
                            word-break: break-all;
                        }
                        code {
                            font-family: "JetBrains Mono", Consolas, monospace;
                            background: #edf2ef;
                            padding: 2px 4px;
                            border-radius: 4px;
                            font-size: 12px;
                        }
                        h1 { font-size: 22px; font-weight: 700; color: #0d7a68; margin-top: 20px; }
                        h2 { font-size: 18px; font-weight: 600; margin-top: 16px; }
                        h3 { font-size: 15px; font-weight: 600; margin-top: 12px; }
                        p { margin: 8px 0; }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            border-bottom: 2px solid #0d7a68;
                            padding-bottom: 8px;
                            margin-bottom: 20px;
                            font-size: 12px;
                            color: #6b7a74;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <strong>LexaAI Export</strong>
                        <span>${new Date().toLocaleDateString()}</span>
                    </div>
                    ${bodyContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 300);
        } catch (err) {
            console.error('Failed to export PDF:', err);
        }
    };

    // Export response as a markdown file
    const handleExportMarkdown = () => {
        setShowMenu(false);
        if (!aiResponse) return;
        try {
            const blob = new Blob([aiResponse], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lexaai-response-${new Date().toISOString().slice(0, 10)}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export markdown:', err);
        }
    };

    // Text-to-speech reading
    const handleStopSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const handleListen = () => {
        setShowMenu(false);
        if (!('speechSynthesis' in window)) {
            return;
        }

        if (isSpeaking) {
            handleStopSpeech();
            return;
        }

        const plainText = cleanTextForSpeech(aiResponse);
        if (!plainText) {
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
        };

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const code = ({ children, className, ...rest }) => {
        const match = className?.match(/language-(\w+)/);
        const codeText = String(children).replace(/\n$/, '');
        const blockId = String(codeText).slice(0, 30);
        const isCopied = copiedCodeId === blockId;
        const isDownloaded = downloadedCodeId === blockId;
        const lang = match ? match[1] : '';

        return match ? (
            <>
                <div className="code-block">
                    <div className="p-4 pb-0 font-sans text-bodyMedium text-light-onSurface dark:text-dark-onSurface select-none">
                        {toTitleCase(match[1])}
                    </div>

                    <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        language={match[1]}
                        style={codeTheme || hopscotch}
                        customStyle={{
                            marginBlock: '0',
                            padding: '2px',
                            background: 'transparent',
                            fontFamily: '"JetBrains Mono", monospace'
                        }}
                        codeTagProps={{
                            style: {
                                padding: '14px',
                                fontFamily: '"JetBrains Mono", monospace',
                                background: 'transparent'
                            }
                        }}
                    >
                        {codeText}
                    </SyntaxHighlighter>
                </div>

                <div className="bg-light-surfaceContainer dark:bg-dark-surfaceContainer rounded-t-extraSmall rounded-b-medium flex justify-end items-center gap-1.5 h-11 font-sans text-bodyMedium ps-4 pe-2 mb-4">
                    <IconBtn
                        size="small"
                        onClick={() => handleDownloadCode(codeText, lang, blockId)}
                        title={isDownloaded ? "Downloaded" : `Download .${getExtensionForLanguage(lang)} file`}
                        aria-label={isDownloaded ? "Code downloaded" : "Download code file"}
                    >
                        {isDownloaded ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Download className="w-3.5 h-3.5" />
                        )}
                    </IconBtn>

                    <IconBtn
                        size="small"
                        onClick={() => handleCopyCode(codeText, blockId)}
                        title={isCopied ? "Copied" : "Copy code"}
                        aria-label={isCopied ? "Code copied to clipboard" : "Copy code to clipboard"}
                    >
                        {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </IconBtn>
                </div>
            </>
        ) : (
            <code className={className}>{children}</code>
        );
    };

    return (
        <article className="py-4 border-b border-light-outline/10 dark:border-dark-outline/10 min-w-0 max-w-full">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 max-w-full">
                {/* Assistant Logo Mark */}
                <div className="w-8 h-8 rounded-full bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh flex items-center justify-center p-1.5 shrink-0 border border-light-outline/15 dark:border-dark-outline/15 shadow-subtle">
                    <img src={iconLogo} width={20} height={20} alt="LexaAI" />
                </div>

                {/* Content Area */}
                <div className="min-w-0 flex-1 space-y-2 max-w-full">
                    <div className="h-8 flex items-center justify-between">
                        <span className="text-bodySmall font-semibold text-light-primary dark:text-dark-primary leading-none">
                            LexaAI
                        </span>

                        {/* Listening Active Pill */}
                        {isSpeaking && (
                            <button
                                type="button"
                                onClick={handleStopSpeech}
                                className="flex items-center gap-1 h-6 px-2 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary text-[11px] font-medium hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                title="Stop speech"
                            >
                                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                <span>Speaking</span>
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Preloader or Rendered Markdown */}
                    {children}
                    {aiResponse && (
                        <div className="markdown-content min-w-0 max-w-full">
                            <Markdown remarkPlugins={[remarkGfm]} components={{ code, table: TableBlock }}>
                                {aiResponse}
                            </Markdown>
                        </div>
                    )}

                    {/* Bottom Action Toolbar */}
                    {aiResponse && (
                        <div className="flex items-center gap-1 pt-1.5 relative" ref={menuRef}>
                            {/* Copy Full Response */}
                            <button
                                type="button"
                                onClick={() => handleCopy(aiResponse)}
                                className={`p-1.5 rounded-md hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors ${isResponseCopied
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 hover:text-light-onSurface dark:hover:text-dark-onSurface'
                                    }`}
                                title={isResponseCopied ? "Copied" : "Copy response"}
                                aria-label={isResponseCopied ? "Response copied to clipboard" : "Copy response"}
                            >
                                {isResponseCopied ? (
                                    <Check className="w-4 h-4 block" />
                                ) : (
                                    <Copy className="w-4 h-4 block" />
                                )}
                            </button>

                            {/* Options Dropdown */}
                            <button
                                type="button"
                                onClick={() => setShowMenu(prev => !prev)}
                                className="text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 hover:text-light-onSurface dark:hover:text-dark-onSurface p-1.5 rounded-md hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                                title="More options"
                                aria-label="Response options"
                                aria-expanded={showMenu}
                            >
                                <MoreHorizontal className="w-4 h-4 block" />
                            </button>

                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute left-0 bottom-full mb-1.5 z-40 w-48 bg-light-surface dark:bg-dark-surface border border-light-outline/15 dark:border-dark-outline/15 rounded-xl shadow-elevation3 py-1 flex flex-col overflow-hidden"
                                    >
                                        <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-light-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60 select-none">
                                            Download
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleExportWord}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            <span>Word (.doc)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportExcel}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            <span>Excel (.csv)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportPdf}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                        >
                                            <Printer className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            <span>PDF (.pdf)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportMarkdown}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                        >
                                            <Download className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            <span>Markdown (.md)</span>
                                        </button>

                                        <div className="my-1 border-t border-light-outline/10 dark:border-dark-outline/10" />

                                        <button
                                            type="button"
                                            onClick={handleListen}
                                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface text-bodySmall font-medium transition-colors"
                                        >
                                            {isSpeaking ? (
                                                <VolumeX className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            ) : (
                                                <Volume2 className="w-4 h-4 text-light-primary dark:text-dark-primary shrink-0" />
                                            )}
                                            <span>{isSpeaking ? 'Stop listening' : 'Read aloud'}</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

AiResponse.propTypes = {
    aiResponse: PropTypes.string,
    children: PropTypes.any
};

export default AiResponse;
