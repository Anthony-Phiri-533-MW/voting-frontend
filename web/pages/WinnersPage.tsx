// web/pages/WinnersPage.tsx
import * as React from 'react';
import { ElectionStatus } from '../types';
import { useOverallStats } from '../hooks/useOverallStats';
import { useAllPositions } from '../hooks/useAllPositions';

interface WinnersPageProps {
  electionStatus: ElectionStatus;
}

// Crown for the winner
const CrownIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
    <path d="M5 21h14"/>
  </svg>
);

// Bicycle Icon – proudly back for every runner-up
const BicycleIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" id="Fart-Farting--Streamline-Nasty" height="30" width="30">
  <desc>
    Fart Farting Streamline Icon: https://streamlinehq.com
  </desc>
  <g>
    <path d="M15.12 11.600000000000001A8 8 0 1 0 8 16a9.848 9.848 0 0 0 1.6 -0.16000000000000003V32a3.2 3.2 0 0 0 6.4 0V21.12l2.8000000000000003 2.8000000000000003A8 8 0 0 1 20.8 28.8v16a3.2 3.2 0 0 0 6.4 0V27.200000000000003a9.600000000000001 9.600000000000001 0 0 0 -2.4800000000000004 -6l-9.600000000000001 -9.600000000000001ZM1.6 8a6.4 6.4 0 1 1 9.200000000000001 5.760000000000001 0.6080000000000001 0.6080000000000001 0 0 0 -0.4 -0.16000000000000003 0.7040000000000001 0.7040000000000001 0 0 0 -0.7200000000000001 0.5599999999999999 6.088000000000001 6.088000000000001 0 0 1 -1.6800000000000002 0.24 6.4 6.4 0 0 1 -6.4 -6.4Zm24 36.800000000000004a1.6 1.6 0 0 1 -3.2 0V28.8a9.600000000000001 9.600000000000001 0 0 0 -2.4800000000000004 -6L16 18.880000000000003V17.6a0.8 0.8 0 0 0 -1.6 0v14.4a1.6 1.6 0 0 1 -3.2 0V15.36a8.8 8.8 0 0 0 3.04 -2.32L23.6 22.400000000000002a8 8 0 0 1 2 4.88V44.800000000000004Z" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M37.6 24h-5.6000000000000005a0.8 0.8 0 0 0 0 1.6h5.6000000000000005a0.8 0.8 0 0 0 0 -1.6" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="m37.12 29.680000000000003 -6.4 -2.4000000000000004a0.8 0.8 0 1 0 -0.5599999999999999 1.52l6.4 2.4000000000000004c0.08000000000000002 0 0.16000000000000003 0.08000000000000002 0.32000000000000006 0.08000000000000002a0.6960000000000001 0.6960000000000001 0 0 0 0.7200000000000001 -0.48c0.08000000000000002 -0.5599999999999999 -0.08000000000000002 -0.96 -0.48 -1.1199999999999999" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M30.400000000000002 22.400000000000002a0.6080000000000001 0.6080000000000001 0 0 0 0.32000000000000006 -0.08000000000000002l6.4 -2.4000000000000004a0.8 0.8 0 1 0 -0.5599999999999999 -1.52l-6.4 2.4000000000000004a0.8 0.8 0 0 0 -0.48 1.04 0.6880000000000001 0.6880000000000001 0 0 0 0.7200000000000001 0.5599999999999999" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M48 24.8a5.296 5.296 0 0 0 -3.84 -5.36 4.104 4.104 0 0 0 -0.8 -3.04A5.120000000000001 5.120000000000001 0 0 0 39.2 14.4a0.8 0.8 0 0 0 0 1.6 3.4640000000000004 3.4640000000000004 0 0 1 2.8000000000000003 1.2800000000000002 2.632 2.632 0 0 1 0.4 2.4800000000000004 0.8480000000000001 0.8480000000000001 0 0 0 0.08000000000000002 0.6400000000000001 1.024 1.024 0 0 0 0.5599999999999999 0.4 3.904 3.904 0 0 1 3.3600000000000003 4 3.904 3.904 0 0 1 -3.3600000000000003 4 0.9279999999999999 0.9279999999999999 0 0 0 -0.5599999999999999 0.4 1.6 1.6 0 0 0 -0.08000000000000002 0.6400000000000001 2.936 2.936 0 0 1 -0.4 2.4800000000000004A3.576 3.576 0 0 1 39.2 33.6a0.8 0.8 0 0 0 0 1.6 5.016 5.016 0 0 0 4.08 -1.92 4.104 4.104 0 0 0 0.8 -3.04A5.432 5.432 0 0 0 48 24.8" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
    <path d="M12.8 8.8a0.752 0.752 0 0 0 -0.8 -0.8H4a0.752 0.752 0 0 0 -0.8 0.8c0 1.8399999999999999 2.16 4 4.800000000000001 4s4.800000000000001 -2.16 4.800000000000001 -4Zm-7.76 0.8h5.84a3.4640000000000004 3.4640000000000004 0 0 1 -5.84 0Z" fill="#000000" fill-rule="evenodd" stroke-width="0.8"></path>
  </g>
</svg>
);

// Scales icon – shown when a position ends in a tie
const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

// Defensive formatters — stats values may arrive as strings from older payloads,
// so every numeric display goes through Number() before formatting.
const fmtVotes = (n: unknown) => Number(n ?? 0).toLocaleString();
const fmtPct = (n: unknown, dp = 2) => Number(n ?? 0).toFixed(dp);
const fmtCat = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    timeZone: 'Africa/Blantyre',
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }) + ' CAT';
};

const WinnersPage: React.FC<WinnersPageProps> = ({ electionStatus }) => {
  const { positions, isLoading: positionsLoading } = useAllPositions();
  const { stats, isLoading: statsLoading } = useOverallStats();

  if (positionsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dmi-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-dmi-blue-900 font-medium">Loading official results...</p>
        </div>
      </div>
    );
  }

  if (electionStatus !== 'POST_ELECTION') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-black text-dmi-blue-950 mb-4">Election Still Ongoing</h1>
          <p className="text-lg text-gray-700">Official winners will be announced here once voting has concluded.</p>
          <div className="mt-8 h-1 w-32 bg-dmi-gold-500 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  const enrichedPositions = positions.map(pos => {
    const posStats = stats?.positionsWithStats.find(ps => ps.positionId === pos.id);
    if (!posStats) return { ...pos, candidates: [], posStats: null };

    const enriched = pos.candidates
      .map(cand => {
        const candStats = posStats.candidates.find(cs => cs.candidateId === cand.id);
        return {
          ...cand,
          voteCount: Number(candStats?.voteCount ?? 0),
          votePercentage: Number(candStats?.votePercentage ?? 0),
        };
      })
      .sort((a, b) => Number(b.voteCount) - Number(a.voteCount));

    return { ...pos, candidates: enriched, posStats };
  });

  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjA0YjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiNmZmYiPkRNSSBMRUdFTkQ8L3RleHQ+PC9zdmc+';

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black text-dmi-blue-950">OFFICIAL WINNERS</h1>
        <p className="text-xl md:text-2xl text-dmi-blue-700 font-light mt-4">
          2025–2026 Student Leadership Election Results
        </p>
        <div className="flex justify-center gap-8 mt-6">
          <div className="h-px w-32 bg-dmi-gold-500"></div>
          <div className="h-px w-32 bg-dmi-gold-500"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-14">
        {enrichedPositions.map(position => {
          const candidates = position.candidates;
          const posStats = position.posStats;
          const isTie = !!(posStats && posStats.isTie);
          const runoff = posStats?.runoff ?? null;
          const runoffWinnerId = posStats?.finalWinnerCandidateId != null ? Number(posStats.finalWinnerCandidateId) : null;

          // A completed runoff resolved the tie → that candidate is the official winner.
          const resolvedWinner = runoffWinnerId != null
            ? candidates.find(c => Number(c.id) === runoffWinnerId)
            : null;

          const winner = resolvedWinner ?? candidates[0];

          // Runners-up: everyone except the winner; during an unresolved tie, everyone except the tied leaders.
          const tiedLeaderIds: number[] = isTie && posStats && Array.isArray(posStats.tiedCandidates)
            ? posStats.tiedCandidates.map((t: any) => Number(t.candidateId))
            : [];
          const runnersUp = resolvedWinner
            ? candidates.filter(c => Number(c.id) !== runoffWinnerId)
            : isTie
              ? candidates.filter(c => !tiedLeaderIds.includes(Number(c.id)))
              : candidates.slice(1);

          if (!winner) {
            return (
              <div key={position.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-dmi-blue-950 to-dmi-blue-900 text-white py-6 px-8">
                  <h2 className="text-2xl md:text-3xl font-black text-center tracking-wide">
                    {position.name.toUpperCase()}
                  </h2>
                </div>
                <div className="p-10 text-center text-gray-500">
                  No candidates registered for this position.
                </div>
              </div>
            );
          }

          const winnerImg = winner.imageUrl?.trim() ? winner.imageUrl : placeholder;
          const showTie = isTie && !resolvedWinner;

          // For the tie card, show full candidate records (with photos) for the tied leaders.
          const topVotes = candidates[0]?.voteCount ?? 0;
          const tiedLeaders = showTie
            ? candidates.filter(c => Number(c.voteCount) === Number(topVotes) && Number(topVotes) > 0)
            : [];

          return (
            <div
              key={position.id}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-500"
            >
              {/* Position Title */}
              <div className="bg-gradient-to-r from-dmi-blue-950 to-dmi-blue-900 text-white py-6 px-8">
                <h2 className="text-2xl md:text-3xl font-black text-center tracking-wide">
                  {position.name.toUpperCase()}
                </h2>
              </div>

              {showTie ? (
                /* ---------- TIE ANNOUNCEMENT ---------- */
                <div className="p-8 md:p-12 bg-gradient-to-br from-amber-50 via-white to-amber-50">
                  <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6 shadow-inner">
                      <ScaleIcon />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-2">
                      Tie Detected
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black text-dmi-blue-950 mb-4">
                      No Winner Declared
                    </h3>
                    <p className="text-lg text-gray-700 mb-10">
                      {tiedLeaders.length} candidates are tied at{' '}
                      <span className="font-bold text-dmi-blue-900">{fmtVotes(topVotes)} votes</span>{' '}
                      each for this position. A runoff election between the tied candidates will decide the winner.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {tiedLeaders.map(tied => {
                        const tiedImg = tied.imageUrl?.trim() ? tied.imageUrl : placeholder;
                        return (
                          <div key={tied.id} className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-md">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-300 shrink-0">
                              <img src={tiedImg} alt={tied.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-bold text-dmi-blue-900 text-lg">{tied.name}</p>
                              <p className="text-sm text-gray-600">
                                {fmtVotes(tied.voteCount)} votes ({fmtPct(tied.votePercentage, 1)}%)
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 bg-amber-100/60 border border-amber-300 text-amber-900 rounded-xl px-6 py-4 text-sm font-medium">
                      {runoff && runoff.isActive
                        ? `Runoff underway${runoff.endDate ? ` — closes ${fmtCat(runoff.endDate)}` : ''}. Eligible voters may vote once in this runoff.`
                        : runoff && runoff.completed
                          ? 'The runoff has closed. Results will update once tallied — if it ends in another tie, the electoral commission will decide.'
                          : 'The electoral commission will open a runoff election for this position shortly.'}
                    </div>
                  </div>
                </div>
              ) : (
                /* ---------- WINNER ---------- */
                <div className="p-8 md:p-12 bg-gradient-to-br from-dmi-blue-50 via-white to-dmi-gold-50">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-3xl overflow-hidden ring-8 ring-dmi-gold-400 shadow-2xl">
                        <img src={winnerImg} alt={winner.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -top-4 -right-4 bg-dmi-gold-500 text-dmi-blue-950 rounded-full p-4 shadow-xl">
                        <CrownIcon />
                      </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <p className="text-sm font-bold uppercase tracking-wider text-dmi-gold-600 mb-2">
                        {resolvedWinner ? 'Elected Winner • Decided by Runoff' : 'Elected Winner'}
                      </p>
                      <h3 className="text-4xl md:text-5xl font-black text-dmi-blue-950">
                        {winner.name}
                      </h3>
                      <div className="mt-6 space-y-3">
                        <p className="text-2xl font-bold text-dmi-blue-800">
                          {fmtVotes(winner.voteCount)} Votes
                        </p>
                        <p className="text-lg text-dmi-blue-700">
                          ({fmtPct(winner.votePercentage)}% of total votes)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Runners-Up – Bicycle Icon, no numbering */}
              {runnersUp.length > 0 && (
                <div className="px-8 pb-10 pt-6 bg-gray-50">
                  <h4 className="text-xl font-bold text-dmi-blue-900 text-center mb-6 flex items-center justify-center gap-3">
                    <span>Wainvera Fungo (Runners-Up)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {runnersUp.map(runner => (
                      <div
                        key={runner.id}
                        className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-md hover:shadow-lg transition"
                      >
                        <BicycleIcon />
                        <div className="flex-1">
                          <p className="font-bold text-dmi-blue-900 text-lg">{runner.name}</p>
                          <p className="text-sm text-gray-600">
                            {fmtVotes(runner.voteCount)} votes ({fmtPct(runner.votePercentage, 1)}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Closing Message */}
      <div className="text-center mt-20 text-gray-700">
        <p className="text-lg font-medium">
          Congratulations to all winners and participants.
          <br />
          <span className="text-dmi-blue-900 font-bold">DMI–SJBU • Leadership in Motion</span>
        </p>
      </div>
    </div>
  );
};

export default WinnersPage;