// Modules
import { useNavigation } from "react-router-dom";

/**
 * Custom hook to derive pending user prompt and attachments from React Router navigation
 */
const useUserPromptPreloader = () => {
    const navigation = useNavigation();

    if (!navigation.formData) {
        return { promptPreLoaderValue: '' };
    }

    const prompt = navigation.formData.get('user_prompt') || '';
    const rawAttachments = navigation.formData.get('attached_files');
    let attachments = [];
    if (rawAttachments) {
        try {
            attachments = JSON.parse(rawAttachments);
        } catch {
            attachments = [];
        }
    }

    if (attachments.length > 0) {
        let preview = '';
        attachments.forEach((f) => {
            const isImage = f.dataUrl && (f.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name));
            const sizeStr = f.size ? ` (${Math.round(f.size / 1024)} KB)` : '';
            if (isImage) {
                preview += `![${f.name}](${f.dataUrl})\n\n`;
            } else if (f.dataUrl) {
                preview += `[📎 ${f.name}${sizeStr}](${f.dataUrl})\n\n`;
            } else {
                preview += `📎 **[${f.name}${sizeStr}]**\n\n`;
            }
        });
        return { promptPreLoaderValue: (preview + prompt).trim() };
    }

    return { promptPreLoaderValue: prompt };
};

export { useUserPromptPreloader, useUserPromptPreloader as userPromptPreloader };
