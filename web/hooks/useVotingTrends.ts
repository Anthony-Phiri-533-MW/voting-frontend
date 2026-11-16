// web/hooks/useVotingTrends.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios';

interface TrendData {
    hour: string;
    votes: number;
}

interface TrendsState {
    hourlyTrends: TrendData[];
    isLoading: boolean;
    error: string | null;
    fetchTrends: () => Promise<void>;
}

const mapTrends = (raw: any[]) =>
    (raw || []).map((item: any) => ({
        hour: `${item.hour}:00`,
        votes: item.votes_count,
    }));

export const useVotingTrends = (): TrendsState => {
    const [hourlyTrends, setHourlyTrends] = useState<TrendData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrends = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await sjbuApi.get('/stats/trends');
            const rawHourlyData = response.data.data.hourlyPattern || [];
            setHourlyTrends(mapTrends(rawHourlyData));
            setError(null);
        } catch (e) {
            let message = 'Failed to load chart data.';
            if (axios.isAxiosError(e) && e.response) {
                const status = e.response.status;
                if (status === 401 || status === 403) message = 'Chart data is temporarily unavailable. Access Restricted.';
                else if (status >= 500) message = `Server Error (${status}). Data temporarily unavailable.`;
                else if (status === 404) message = 'Trends service not found on the server.';
            }
            setError(message);
            console.error('Fetch Voting Trends Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Live push via SSE (no polling)
        const base = (sjbuApi.defaults?.baseURL as string) || '/api/app';
        const url = `${base.replace(/\/$/, '')}/events`;
        const es = new EventSource(url, { withCredentials: true });

        es.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.trends?.hourlyPattern) {
                    setHourlyTrends(mapTrends(msg.trends.hourlyPattern));
                    setError(null);
                }
                setIsLoading(false);
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };
        es.onerror = () => setError('Live connection lost. Reconnecting...');

        // Initial fetch fallback
        fetchTrends();

        return () => es.close();
    }, [fetchTrends]);

    return { hourlyTrends, isLoading, error, fetchTrends };
};