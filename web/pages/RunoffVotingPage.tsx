// web/pages/RunoffVotingPage.tsx
// Runoff ballot: shown when one or more positions ended in a tie and their
// runoffs are live. A voucher may cast ONE vote per runoff — even if it was
// already used in the main election. Each runoff ballot is submitted
// separately (own round + own verification code).

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Page, Candidate, Position } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import sjbuApi from '../src/api/sjbuApi';

interface RunoffInfo {
  id: number;
  positionId: number;
  positionName: string;
  candidateIds: number[];
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface RunoffVotingPageProps {
  positions: PositionWithCandidates[];
  userVoucher: string;
  setPage: (page: Page) => void;
  setVerificationCode: (code: string) => void;
  setVoteStats: (stats: any[] | null) => void;
  isOffline: boolean;
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

type RunoffStatus = 'pending' | 'submitting' | 'done' | 'error';

const RunoffVotingPage: React.FC<RunoffVotingPageProps> = ({
  positions,
  userVoucher,
  setPage,
  setVerificationCode,
  setVoteStats,
  isOffline,
}) => {
  const [runoffs, setRunoffs] = useState<RunoffInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voucher, setVoucher] = useState(userVoucher || '');
  // selections[runoffId] = candidateId
  const [selections, setSelections] = useState<Record<number, number>>({});
  // per-runoff submission state
  const [statuses, setStatuses] = useState<Record<number, { state: RunoffStatus; message?: string; code?: string }>>({});

  const fetchRunoffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sjbuApi.get('/runoffs');
      setRunoffs(response.data?.runoffs ?? []);
    } catch (e) {
      console.error('Failed to load runoffs', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount, and again when the tab regains focus (no periodic polling).
  useEffect(() => {
    fetchRunoffs();
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchRunoffs();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchRunoffs]);

  const nowMs = Date.now();
  const activeRunoffs = runoffs.filter(ro => {
    if (ro.status !== 'live') return false;
    if (ro.startDate && nowMs < new Date(ro.startDate).getTime()) return false;
    if (ro.endDate && nowMs >= new Date(ro.endDate).getTime()) return false;
    return true;
  });

  const candidateFor = (runoff: RunoffInfo, candidateId: number): Candidate | undefined =>
    positions.find(p => p.id === runoff.positionId)?.candidates.find(c => c.id === candidateId);

  const submitRunoff = async (runoff: RunoffInfo) => {
    const candidateId = selections[runoff.id];
    setStatuses(prev => ({ ...prev, [runoff.id]: { state: 'submitting' } }));

    if (!voucher.trim()) {
      setStatuses(prev => ({ ...prev, [runoff.id]: { state: 'error', message: 'Please enter your voucher code first.' } }));
      return;
    }
    if (candidateId == null) {
      setStatuses(prev => ({ ...prev, [runoff.id]: { state: 'error', message: 'Please select a candidate.' } }));
      return;
    }
    if (isOffline) {
      setStatuses(prev => ({ ...prev, [runoff.id]: { state: 'error', message: 'You are offline. Reconnect to submit.' } }));
      return;
    }

    try {
      const response = await sjbuApi.post('/vote', {
        voucher: voucher.trim(),
        selections: { [runoff.positionId]: candidateId },
        round: runoff.id,
      });
      const data = response.data?.data;
      const code = data?.verificationCode ?? null;
      setStatuses(prev => ({
        ...prev,
        [runoff.id]: { state: 'done', message: 'Runoff vote recorded.', code },
      }));
      if (data?.positionStats) setVoteStats(data.positionStats);
      if (code) setVerificationCode(code);
    } catch (err: any) {
      console.error('Runoff vote failed:', err);
      let message = 'Failed to submit runoff vote. Please try again.';
      if (err.response?.status === 409) message = 'This voucher has already voted in this runoff.';
      else if (err.response?.data?.error) message = err.response.data.error;
      setStatuses(prev => ({ ...prev, [runoff.id]: { state: 'error', message } }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Loading runoff elections…</h2>
        </Card>
      </div>
    );
  }

  if (activeRunoffs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-10">
          <span className="text-4xl" aria-hidden>⚖️</span>
          <h2 className="text-2xl font-bold text-dmi-blue-900 mt-4">No Runoff Is Currently Open</h2>
          <p className="text-gray-600 mt-3">
            Runoff elections are opened automatically when a position ends in a tie.
            Check the official results page for the latest announcements.
          </p>
          <Button className="mt-6" onClick={() => setPage(Page.Results)}>View Results</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto mb-6">
        <div className="p-6">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
            Runoff Elections • Tie Breakers
          </p>
          <h2 className="text-2xl font-bold text-dmi-blue-900 mt-1">
            {activeRunoffs.length} position{activeRunoffs.length > 1 ? 's' : ''} ended in a tie
          </h2>
          <p className="text-gray-600 mt-2">
            Cast one vote in each runoff below to help decide the winners.
            You may vote in a runoff even if you already used your voucher in the main election — one vote per voucher per runoff.
          </p>

          <div className="mt-4">
            <label htmlFor="runoff-voucher" className="block text-sm font-semibold text-gray-700 mb-1">
              Voucher Code
            </label>
            <input
              id="runoff-voucher"
              type="text"
              value={voucher}
              onChange={e => setVoucher(e.target.value)}
              placeholder="Enter the voucher you used to vote"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-6 max-w-4xl mx-auto">
        {activeRunoffs.map(runoff => {
          const runoffCandidates = runoff.candidateIds
            .map(cid => candidateFor(runoff, cid))
            .filter((c): c is Candidate => !!c);
          const status = statuses[runoff.id];

          return (
            <Card key={runoff.id}>
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-t-xl">
                <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Runoff {runoff.id}
                </p>
                <h3 className="text-xl font-bold text-dmi-blue-900 mt-1">{runoff.positionName}</h3>
                {runoff.endDate && (
                  <p className="text-xs text-gray-500 mt-1">Closes {formatCat(runoff.endDate)}</p>
                )}
              </div>

              <div className="p-6 space-y-3">
                {runoffCandidates.map(candidate => {
                  const selected = selections[runoff.id] === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selected
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelections(prev => ({ ...prev, [runoff.id]: candidate.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <h4 className="text-lg font-semibold text-dmi-blue-900">{candidate.name}</h4>
                        </div>
                        {selected && (
                          <svg className="w-7 h-7 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t">
                {status?.state === 'done' ? (
                  <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-sm">
                    ✓ {status.message} Your verification code: <span className="font-mono font-bold">{status.code}</span>
                  </div>
                ) : (
                  <>
                    {status?.state === 'error' && status.message && (
                      <div className="mb-3 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
                        {status.message}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => submitRunoff(runoff)}
                        disabled={status?.state === 'submitting' || !voucher.trim() || selections[runoff.id] == null}
                        className="min-h-touch"
                      >
                        {status?.state === 'submitting' ? <Spinner /> : 'Submit Runoff Vote'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RunoffVotingPage;
