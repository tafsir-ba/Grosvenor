import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useUnits(params = {}) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const key = JSON.stringify(params);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.get("/units", { params })
            .then(({ data }) => active && setUnits(data))
            .catch((err) => {
                if (!active) return;
                setUnits([]);
                setError(err);
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { units, loading, error };
}

export function useUnit(slug) {
    const [unit, setUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.get(`/units/${slug}`)
            .then(({ data }) => active && setUnit(data))
            .catch((err) => {
                if (!active) return;
                setUnit(null);
                setError(err);
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [slug]);
    return { unit, loading, error };
}

export function useDownloads() {
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.get("/downloads")
            .then(({ data }) => active && setDownloads(data))
            .catch((err) => {
                if (!active) return;
                setDownloads([]);
                setError(err);
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);
    return { downloads, loading, error };
}

export function useContent(path) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.get(`/content/${path}`)
            .then(({ data: payload }) => active && setData(payload))
            .catch((err) => {
                if (!active) return;
                setData([]);
                setError(err);
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [path]);

    return { data, loading, error };
}

export function useFaq() {
    return useContent("faq");
}

export function useAmenities() {
    return useContent("amenities");
}
