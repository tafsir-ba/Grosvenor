// Single place for download access (gated brochure + open price list).
import { toast } from "sonner";
import { api } from "@/lib/api";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export function resolveFileUrl(fileUrl) {
    if (!fileUrl) return null;
    return fileUrl.startsWith("http") ? fileUrl : `${BACKEND}${fileUrl}`;
}

export function openFileUrl(fileUrl, { popup = null } = {}) {
    const url = resolveFileUrl(fileUrl);
    if (!url) {
        throw new Error("No file URL returned.");
    }
    if (popup && !popup.closed) {
        popup.location.href = url;
        return true;
    }
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) {
        toast.error("Allow pop-ups to open the file, or use the download link from our team.");
        return false;
    }
    return true;
}

export async function accessDownload(id, lead = null) {
    const popup = window.open("about:blank", "_blank");
    try {
        const { data } = await api.post(`/downloads/${id}/access`, { lead });
        if (!data?.file_url) {
            popup?.close();
            throw new Error("No file URL returned.");
        }
        const opened = openFileUrl(data.file_url, { popup });
        if (!opened) {
            throw new Error("Could not open file. Allow pop-ups and try again.");
        }
        return data;
    } catch (err) {
        popup?.close();
        throw err;
    }
}
