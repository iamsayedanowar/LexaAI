/**
 * Utility functions for exporting conversation chats in Word/Docs (.doc), PDF (.pdf), and Markdown (.md)
 */

export const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Format prompt text for export, cleanly handling file badges and image markers
 */
export const formatPromptForExport = (rawPrompt) => {
    if (!rawPrompt) return '';
    // Format attached image tags cleanly: ![alt](url) -> [Image: alt]
    let formatted = rawPrompt.replace(/!\[(.*?)\]\([^)]+\)/g, (_, alt) => `[Image: ${alt || 'Attached Image'}]`);
    // Format file links: [📎 filename (size)](url) -> [File: filename (size)]
    formatted = formatted.replace(/\[📎 (.*?)\]\([^)]+\)/g, (_, name) => `[Attachment: ${name}]`);
    // Format file badge text: 📎 **[filename (size)]** -> [Attachment: filename (size)]
    formatted = formatted.replace(/📎 \*\*\[(.*?)\]\*\*/g, (_, name) => `[Attachment: ${name}]`);
    return formatted.trim();
};

/**
 * Convert markdown text into cleanly styled HTML for Word (.doc) and PDF export
 */
export const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // Code blocks with syntax formatting
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const langBadge = lang
            ? `<div style="font-size:11px;font-family:'JetBrains Mono',Consolas,monospace;color:#6b7a74;margin-bottom:6px;font-weight:600;text-transform:uppercase;">${lang}</div>`
            : '';
        return `<pre style="background:#f4f7f5;border:1px solid #dce4e0;border-radius:6px;padding:12px;font-family:'JetBrains Mono',Consolas,monospace;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;margin:12px 0;">${langBadge}<code>${escaped}</code></pre>`;
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
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:15px;font-weight:600;margin-top:16px;margin-bottom:8px;color:#131a18;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:18px;font-weight:600;margin-top:20px;margin-bottom:8px;color:#131a18;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:22px;font-weight:700;margin-top:24px;margin-bottom:10px;color:#0d7a68;">$1</h1>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:#edf2ef;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;">$1</code>');

    // Lists
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li style="margin-left:20px;line-height:1.6;margin-bottom:4px;">$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li style="margin-left:20px;line-height:1.6;margin-bottom:4px;">$1</li>');

    // Paragraphs
    html = html.split(/\n\s*\n/).map(block => {
        if (/^<(?:h[1-6]|table|pre|ul|ol|li)/i.test(block.trim())) return block;
        return `<p style="line-height:1.6;margin-bottom:12px;">${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
};

const getSlugFilename = (title, ext) => {
    const slug = (title || 'chat')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 45) || 'chat';
    const date = new Date().toISOString().slice(0, 10);
    return `${slug}-${date}.${ext}`;
};

/**
 * Export complete conversation in Microsoft Word / Google Docs compatible (.doc) format
 */
export const exportConversationAsDoc = ({ title = 'Chat', chats = [] }) => {
    const cleanTitle = title || 'Chat Conversation';
    const dateFormatted = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let conversationHtml = '';
    chats.forEach((chat, idx) => {
        const promptText = formatPromptForExport(chat.user_prompt);
        const aiResponseHtml = markdownToHtml(chat.ai_response);

        conversationHtml += `
            <div style="margin-bottom: 24px; page-break-inside: avoid;">
                <!-- User Prompt -->
                <div style="background-color: #f7faf8; border: 1px solid #dce4e0; border-left: 4px solid #334155; border-radius: 6px; padding: 14px 16px; margin-bottom: 12px;">
                    <div style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        User &bull; Message ${idx + 1}
                    </div>
                    <div style="font-size: 13.5px; color: #0f172a; line-height: 1.6; white-space: pre-wrap;">
                        ${escapeHtml(promptText)}
                    </div>
                </div>

                <!-- AI Response -->
                <div style="background-color: #ffffff; border: 1px solid #dce4e0; border-left: 4px solid #0d7a68; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; color: #0d7a68; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                        LexaAI &bull; Response ${idx + 1}
                    </div>
                    <div style="font-size: 13.5px; color: #131a18; line-height: 1.65;">
                        ${aiResponseHtml}
                    </div>
                </div>
            </div>
        `;
    });

    const wordDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${escapeHtml(cleanTitle)}</title>
            <!--[if gte mso 9]>
            <xml>
            <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                @page {
                    margin: 20mm 18mm 20mm 18mm;
                }
                body {
                    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
                    font-size: 13.5px;
                    line-height: 1.6;
                    color: #131a18;
                    margin: 0;
                    padding: 0;
                }
                .doc-header {
                    border-bottom: 2px solid #0d7a68;
                    padding-bottom: 12px;
                    margin-bottom: 24px;
                }
                .doc-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0d7a68;
                    margin: 0 0 6px 0;
                }
                .doc-meta {
                    font-size: 11.5px;
                    color: #64748b;
                    margin: 0;
                }
                .doc-footer {
                    margin-top: 36px;
                    border-top: 1px solid #dce4e0;
                    padding-top: 12px;
                    font-size: 11px;
                    color: #94a3b8;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="doc-header">
                <h1 class="doc-title">${escapeHtml(cleanTitle)}</h1>
                <p class="doc-meta">LexaAI Chat Export &bull; ${escapeHtml(dateFormatted)} &bull; ${chats.length} ${chats.length === 1 ? 'turn' : 'turns'}</p>
            </div>
            ${conversationHtml}
            <div class="doc-footer">
                Exported from LexaAI &bull; Intelligent Multimodal Chat
            </div>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff' + wordDocument], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getSlugFilename(cleanTitle, 'doc');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Export complete conversation in PDF format (opens formatted browser print / Save as PDF dialog)
 */
export const exportConversationAsPdf = ({ title = 'Chat', chats = [] }) => {
    const cleanTitle = title || 'Chat Conversation';
    const dateFormatted = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let conversationHtml = '';
    chats.forEach((chat, idx) => {
        const promptText = formatPromptForExport(chat.user_prompt);
        const aiResponseHtml = markdownToHtml(chat.ai_response);

        conversationHtml += `
            <div class="turn">
                <div class="user-bubble">
                    <div class="turn-badge user-badge">User &bull; ${idx + 1}</div>
                    <div class="user-text">${escapeHtml(promptText)}</div>
                </div>

                <div class="ai-bubble">
                    <div class="turn-badge ai-badge">LexaAI &bull; ${idx + 1}</div>
                    <div class="ai-text">${aiResponseHtml}</div>
                </div>
            </div>
        `;
    });

    const printableHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${escapeHtml(cleanTitle)} - LexaAI</title>
            <style>
                @page {
                    margin: 15mm 15mm 15mm 15mm;
                    size: auto;
                }
                * {
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Google Sans", sans-serif;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #131a18;
                    padding: 16px;
                    max-width: 820px;
                    margin: 0 auto;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    border-bottom: 2px solid #0d7a68;
                    padding-bottom: 10px;
                    margin-bottom: 24px;
                }
                .header-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0d7a68;
                    margin: 0;
                }
                .header-meta {
                    font-size: 11.5px;
                    color: #64748b;
                }
                .turn {
                    page-break-inside: avoid;
                    margin-bottom: 24px;
                }
                .user-bubble {
                    background: #f8faf9;
                    border: 1px solid #dce4e0;
                    border-left: 4px solid #334155;
                    border-radius: 6px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                }
                .ai-bubble {
                    background: #ffffff;
                    border: 1px solid #dce4e0;
                    border-left: 4px solid #0d7a68;
                    border-radius: 6px;
                    padding: 14px 16px;
                    margin-bottom: 16px;
                }
                .turn-badge {
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }
                .user-badge {
                    color: #475569;
                }
                .ai-badge {
                    color: #0d7a68;
                }
                .user-text {
                    font-size: 13px;
                    white-space: pre-wrap;
                    color: #0f172a;
                }
                .ai-text {
                    font-size: 13px;
                    color: #131a18;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 14px 0;
                    page-break-inside: avoid;
                }
                th, td {
                    border: 1px solid #dce4e0;
                    padding: 7px 12px;
                    text-align: left;
                    font-size: 12.5px;
                }
                th {
                    background-color: #edf2ef;
                    font-weight: 600;
                }
                pre {
                    background: #f4f7f5;
                    border: 1px solid #dce4e0;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-family: "JetBrains Mono", Consolas, monospace;
                    font-size: 11.5px;
                    white-space: pre-wrap;
                    word-break: break-all;
                    page-break-inside: avoid;
                }
                code {
                    font-family: "JetBrains Mono", Consolas, monospace;
                    background: #edf2ef;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-size: 11.5px;
                }
                .footer {
                    margin-top: 30px;
                    border-top: 1px solid #dce4e0;
                    padding-top: 10px;
                    font-size: 11px;
                    color: #94a3b8;
                    text-align: center;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="header-title">${escapeHtml(cleanTitle)}</h1>
                <div class="header-meta">LexaAI Export &bull; ${escapeHtml(dateFormatted)} &bull; ${chats.length} ${chats.length === 1 ? 'turn' : 'turns'}</div>
            </div>
            ${conversationHtml}
            <div class="footer">
                Exported from LexaAI &bull; Intelligent Multimodal Chat
            </div>
        </body>
        </html>
    `;

    // Try popup window first
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printableHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    } else {
        // Fallback using hidden iframe if popup is blocked
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(printableHtml);
        doc.close();
        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }, 350);
    }
};

/**
 * Export complete conversation in Markdown (.md) format
 */
export const exportConversationAsMarkdown = ({ title = 'Chat', chats = [] }) => {
    const cleanTitle = title || 'Chat';
    const dateFormatted = new Date().toISOString().slice(0, 10);

    let md = `# ${cleanTitle}\n\n`;
    md += `*Exported from LexaAI on ${new Date().toLocaleDateString()}*\n`;
    md += `*Total turns: ${chats.length}*\n\n`;
    md += `---\n\n`;

    chats.forEach((chat, idx) => {
        const promptText = formatPromptForExport(chat.user_prompt);
        md += `### 👤 User (Message ${idx + 1})\n\n`;
        md += `${promptText}\n\n`;
        md += `### ✦ LexaAI (Response ${idx + 1})\n\n`;
        md += `${chat.ai_response}\n\n`;
        md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getSlugFilename(cleanTitle, 'md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
