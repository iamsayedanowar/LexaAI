/**
 * Opens an attached file (PDF, image, text) in a new browser tab or downloads it
 * @param {Object} file - { name, url, dataUrl, textContent }
 * @param {Function} [showSnackbar] - Optional snackbar callback for notifications
 */
export const openFile = (file, showSnackbar) => {
    if (!file) return;
    const fileUrl = file.url || file.dataUrl;

    // If textContent is available but no URL, create a text blob
    if (!fileUrl && file.textContent) {
        try {
            const blob = new Blob([file.textContent], { type: 'text/plain;charset=utf-8' });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            return;
        } catch (err) {
            console.error('Failed to open text file:', err);
        }
    }

    if (!fileUrl) {
        showSnackbar?.({
            message: `Cannot open "${file.name}" (file preview not available)`,
            timeOut: 2500
        });
        return;
    }

    try {
        if (fileUrl.startsWith('data:')) {
            const parts = fileUrl.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

            let blob;
            if (parts[0].includes(';base64')) {
                const byteCharacters = atob(parts[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: mimeType });
            } else {
                blob = new Blob([decodeURIComponent(parts[1])], { type: mimeType });
            }

            const blobUrl = URL.createObjectURL(blob);
            const win = window.open(blobUrl, '_blank');
            if (!win) {
                // If pop-up was blocked by browser, trigger download/open link
                const a = document.createElement('a');
                a.href = blobUrl;
                a.target = '_blank';
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } else {
            window.open(fileUrl, '_blank');
        }
    } catch (err) {
        console.error('Error opening file:', err);
        showSnackbar?.({
            message: `Failed to open "${file.name}"`,
            type: 'error',
            timeOut: 2500
        });
    }
};

export default openFile;
