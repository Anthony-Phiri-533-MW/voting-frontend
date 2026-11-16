// web/hooks/useLiveStatsPolling.ts

import { useState, useEffect } from 'react';
import sjbuApi from '../src/api/sjbuApi';

interface LiveStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number;
    positionsWithStats: any[];
}

interface LiveStatsState {
    stats: LiveStats | null;
    isLoading: boolean;
    error: string | null;
}

export const useLiveStatsPolling = (): LiveStatsState => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const base = (sjbuApi.defaults?.baseURL as string) || '/api/app';
        const url = `${base.replace(/\/$/, '')}/events`;

        const es = new EventSource(url, { withCredentials: true });

        es.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.stats) {
                    setStats(msg.stats);
                    setError(null);
                }
                setIsLoading(false);
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };

        es.onerror = () => {
            setError('Live connection lost. Reconnecting...');
        };

        return () => es.close();
    }, []);

    return { stats, isLoading, error };
};