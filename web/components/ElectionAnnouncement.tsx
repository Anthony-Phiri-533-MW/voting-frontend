// web/components/ElectionAnnouncement.tsx
// Global banner announcing election end + automatic 30-minute countdown
// to the official results release (server-driven via election schedule).

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page } from '../types';
import Button from './Button';
import sjbuApi from '../src/api/sjbuApi';

type Phase = 'PRE' | 'LIVE' | 'POST_WAIT' | 'POST' | 'UNKNOWN';

interface RunoffInfo {
  id: number;
  positionId: number;
  positionName: string;
  candidateIds: number[];
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface ElectionAnnouncementProps {
  phase: Phase;
  resultsAnnouncement?: string | null;
  setPage: (page: Page) => void;
}

function formatCountdown(msLeft: number): string {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

const formatCat = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    timeZone: 'Africa/Blantyre',
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }) + ' CAT';
};

const ElectionAnnouncement: React.FC<ElectionAnnouncementProps> = ({ phase, resultsAnnouncement, setPage }) => {
  const [now, setNow] = useState(() => Date.now());
  const [resultsDismissed, setResultsDismissed] = useState(false);
  const [runoffs, setRunoffs] = useState<RunoffInfo[]>([]);
  const [dismissedRunoffId, setDismissedRunoffId] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Runoffs are fetched on mount and when the tab regains focus (no periodic polling).
  // The banner re-evaluates every second against the ticking clock.
  useEffect(() => {
    let cancelled = false;
    const loadRunoffs = async () => {
      try {
        const response = await sjbuApi.get('/runoffs');
        if (!cancelled) setRunoffs(response.data?.runoffs ?? []);
      } catch (e) {
        // Silent — the banner is informational only.
      }
    };
    loadRunoffs();
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadRunoffs();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const nowMs = now;
  const activeRunoff = runoffs.find(ro => {
    if (ro.status !== 'live') return false;
    if (ro.startDate && nowMs < new Date(ro.startDate).getTime()) return false;
    if (ro.endDate && nowMs >= new Date(ro.endDate).getTime()) return false;
    return true;
  }) ?? null;

  if (phase === 'POST_WAIT') {
    const target = resultsAnnouncement ? new Date(resultsAnnouncement).getTime() : null;
    const msLeft = target ? target - now : null;
    const countdown = msLeft != null && msLeft > 0 ? formatCountdown(msLeft) : null;

    return (
      <div className="bg-gradient-to-r from-dmi-blue-950 via-dmi-blue-900 to-dmi-blue-950 text-white">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-2xl" aria-hidden>📢</span>
          <div>
            <p className="font-bold text-sm sm:text-base tracking-wide">
              THE ELECTION HAS OFFICIALLY CLOSED
            </p>
            <p className="text-xs sm:text-sm text-dmi-blue-100 mt-1">
              {countdown
                ? <>Thank you to everyone who voted. Official results will be announced in <span className="font-mono font-bold text-dmi-gold-400">{countdown}</span>.</>
                : 'Thank you to everyone who voted. Official results will be announced shortly.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Live runoff banner — takes priority over the results banner.
  if (activeRunoff && dismissedRunoffId !== activeRunoff.id) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-dmi-blue-950">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-2xl" aria-hidden>⚖️</span>
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base tracking-wide">
              RUNOFF ELECTION UNDERWAY — {activeRunoff.positionName.toUpperCase()}
            </p>
            <p className="text-xs sm:text-sm mt-1 opacity-90">
              This position ended in a tie. All voters may vote once to break the tie.
              {activeRunoff.endDate && <> Closes <span className="font-bold">{formatCat(activeRunoff.endDate)}</span>.</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setPage(Page.RunoffVoting)} className="min-h-touch">
              Vote in Runoff
            </Button>
            <button
              type="button"
              onClick={() => setDismissedRunoffId(activeRunoff.id)}
              aria-label="Dismiss announcement"
              className="p-2 rounded-full hover:bg-black/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'POST' && !resultsDismissed) {
    return (
      <div className="bg-gradient-to-r from-dmi-gold-500 via-dmi-gold-400 to-dmi-gold-500 text-dmi-blue-950">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-2xl" aria-hidden>🎉</span>
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base tracking-wide">
              OFFICIAL RESULTS ARE NOW AVAILABLE
            </p>
            <p className="text-xs sm:text-sm mt-1 opacity-90">
              The 30-minute verification window has ended. See the final winners now.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setPage(Page.Results)} className="min-h-touch">
              View Results
            </Button>
            <button
              type="button"
              onClick={() => setResultsDismissed(true)}
              aria-label="Dismiss announcement"
              className="p-2 rounded-full hover:bg-black/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ElectionAnnouncement;
