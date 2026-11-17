// web/hooks/useLiveStatsPolling.ts
// Consumes the backend's SSE stream (/events) for live stats.
// - Reconnects automatically with exponential backoff if the stream drops
//   (e.g. QUIC/HTTP-3 hiccups, proxy idle timeouts, server restarts).
// - Falls back to slow polling (30s) ONLY while SSE is down, and stops
//   polling the moment SSE reconnects — so healthy sessions do no polling.
// - Never throws: connection problems surface as `error` instead of crashing.

import { useState, useEffect, useRef, useCallback } from 'react';
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

// Fallback polling cadence while SSE is unavailable. Set to 0 to disable.
const POLL_FALLBACK_MS = 30000;
const MAX_BACKOFF_MS = 30000;
const FAILURES_BEFORE_POLLING = 3;

export const useLiveStatsPolling = (): LiveStatsState => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const esRef = useRef<EventSource | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const backoffRef = useRef(1000);
    const failuresRef = useRef(0);
    const cancelledRef = useRef(false);

    const stopPolling = useCallback(() => {
        if (pollTimer.current) {
            clearInterval(pollTimer.current);
            pollTimer.current = null;
        }
    }, []);

    const fetchOnce = useCallback(async () => {
        try {
            const res = await sjbuApi.get('/stats/overall');
            if (res.data?.data) {
                setStats(res.data.data);
                setError(null);
                setIsLoading(false);
            }
        } catch (e) {
            // Keep the last known stats; surface the error quietly.
            setError('Live connection lost. Reconnecting...');
        }
    }, []);

    const startPollingFallback = useCallback(() => {
        if (POLL_FALLBACK_MS <= 0 || pollTimer.current) return;
        fetchOnce();
        pollTimer.current = setInterval(fetchOnce, POLL_FALLBACK_MS);
    }, [fetchOnce]);

    const connect = useCallback(() => {
        if (cancelledRef.current) return;
        const base = (sjbuApi.defaults?.baseURL as string) || '/api/app';
        const url = `${base.replace(/\/$/, '')}/events`;

        let es: EventSource;
        try {
            es = new EventSource(url, { withCredentials: true });
        } catch (e) {
            // EventSource constructor can throw in some environments.
            setError('Live connection unavailable.');
            failuresRef.current += 1;
            if (failuresRef.current >= FAILURES_BEFORE_POLLING) startPollingFallback();
            scheduleReconnect();
            return;
        }
        esRef.current = es;

        es.onopen = () => {
            if (cancelledRef.current) return;
            backoffRef.current = 1000;
            failuresRef.current = 0;
            setError(null);
            stopPolling();
        };

        es.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.stats) {
                    setStats(msg.stats);
                    setError(null);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };

        es.onerror = () => {
            if (cancelledRef.current) return;
            try { es.close(); } catch (e) { /* ignore */ }
            esRef.current = null;
            failuresRef.current += 1;
            setError('Live connection lost. Reconnecting...');
            if (failuresRef.current >= FAILURES_BEFORE_POLLING) startPollingFallback();
            scheduleReconnect();
        };
    }, [startPollingFallback, stopPolling]);

    const scheduleReconnect = useCallback(() => {
        if (cancelledRef.current) return;
        if (reconnectTimer.current) return;
        const delay = backoffRef.current;
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        reconnectTimer.current = setTimeout(() => {
            reconnectTimer.current = null;
            connect();
        }, delay);
    }, [connect]);

    useEffect(() => {
        cancelledRef.current = false;
        connect();
        return () => {
            cancelledRef.current = true;
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            stopPolling();
            if (esRef.current) {
                try { esRef.current.close(); } catch (e) { /* ignore */ }
                esRef.current = null;
            }
        };
    }, [connect, stopPolling]);

    return { stats, isLoading, error };
};
