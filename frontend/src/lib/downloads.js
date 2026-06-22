// Single place for download access (gated brochure + open price list).
import { api } from "@/lib/api";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export function openFileUrl(fileUrl) {
    const url = fileUrl?.startsWith("http") ? fileUrl : `${BACKEND}${fileUrl}`;
    window.open(url, "_blank", "noopener");
}

export async function accessDownload(id, lead = null) {
    const { data } = await api.post(`/downloads/${id}/access`, { lead });
    openFileUrl(data.file_url);
    return data;
}
