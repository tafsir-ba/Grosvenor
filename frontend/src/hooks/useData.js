import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useUnits(params = {}) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const key = JSON.stringify(params);

    useEffect(() => {
        let active = true;
        setLoading(true);
        api.get("/units", { params })
            .then(({ data }) => active && setUnits(data))
            .catch(() => active && setUnits([]))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { units, loading };
}

export function useUnit(slug) {
    const [unit, setUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        setLoading(true);
        api.get(`/units/${slug}`)
            .then(({ data }) => active && setUnit(data))
            .catch(() => active && setUnit(null))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [slug]);
    return { unit, loading };
}

export function useDownloads() {
    const [downloads, setDownloads] = useState([]);
    useEffect(() => {
        api.get("/downloads").then(({ data }) => setDownloads(data)).catch(() => {});
    }, []);
    return downloads;
}
