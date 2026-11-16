// web/pages/HomePage.tsx

import { FC } from 'react';
import { Page, ElectionStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import CountdownTimer from '../components/CountdownTimer';

interface HomePageProps {
  setPage: (page: Page) => void;
  electionStatus: ElectionStatus;
  electionStartDate: Date;
  electionEndDate: Date;
}

const HomePage: FC<HomePageProps> = ({ setPage, electionStatus, electionStartDate, electionEndDate }) => {
  const phases = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>,
      title: '1. Get Your Code',
      description: 'Receive your unique, single-use voucher from the student union office. This is your secure key to the ballot.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/></svg>,
      title: '2. Cast Your Vote',
      description: 'Enter your voucher, make your selections, and cast your vote. It\'s fast, anonymous, and your progress is saved if you go offline.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>,
      title: '3. Verify Your Impact',
      description: 'After voting, you get a unique receipt code. Use it after the election on our portal to confirm your vote was successfully counted.',
    },
  ];

  // "How the system works" — plain-language guarantees, no technical details.
  const systemFeatures = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
      title: 'One Voter, One Ballot',
      description: 'Each voucher code can cast exactly one ballot. The system checks every vote, so nobody can vote twice.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
      title: 'Secret & Anonymous',
      description: 'Your choices are never linked back to you. Officials only see vote totals — never who voted for whom.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
      title: 'Live Results',
      description: 'As ballots come in, results update in real time. When voting closes, official winners are published after a short verification window.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/></svg>,
      title: 'Fair Tie-Breaking',
      description: 'If two candidates tie for a position, a runoff election opens automatically and every voter gets to vote again to break the tie.',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2580e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>,
      title: 'Verifiable Receipts',
      description: 'After voting you receive a personal receipt code. Use it anytime on the Verify page to confirm your ballot was recorded.',
    },
  ];

  const renderTimerSection = () => {
    switch(electionStatus) {
      case 'NO_ELECTION':
        return (
          <div className="text-center p-5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">No Election Is Currently Scheduled</h3>
            <p className="text-sm sm:text-base text-dmi-blue-100 mt-2 max-w-xl mx-auto">
              When the electoral board announces an election, the countdown to its start will appear right here on this page.
            </p>
          </div>
        );
      case 'PRE_ELECTION':
        return <CountdownTimer targetDate={electionStartDate} title="Election Starts In" onCompleteMessage="The Election is Now Live!" />;
      case 'LIVE':
        return <CountdownTimer targetDate={electionEndDate} title="Voting Closes In" onCompleteMessage="Voting has officially ended." />;
      case 'POST_ELECTION':
        return (
          <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-white">The Student Elections have concluded.</h3>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl md:text-4xl font-extrabold text-dmi-blue-900">
          {electionStatus === 'NO_ELECTION' ? 'Welcome to the DMI–SJBU Voting Portal' : "Shape Your University's Future"}
        </h2>
        <h1 className="text-lg md:text-2xl font-bold text-dmi-blue-700 mt-2">Secure & Simple Electronic Voting for the Student Elections</h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
          Your Voice. Your Vote. Your DEMWAYE. Participate in building a better campus community.
        </p>

        <div className="my-6 p-4 bg-dmi-blue-700 rounded-xl">
          {renderTimerSection()}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <Button size="lg" onClick={() => setPage(Page.Authentication)} disabled={electionStatus !== 'LIVE'} className="w-full sm:w-auto">
            Cast Your Vote Now
            <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setPage(Page.Results)} className="w-full sm:w-auto">
            View Results
          </Button>
        </div>
      </div>

      {/* How voting is done — three steps */}
      <h3 className="text-xl md:text-2xl font-extrabold text-dmi-blue-900 text-center mt-10 mb-2">How Voting Works</h3>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-2xl mx-auto">Three simple steps — it takes less than two minutes.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {phases.map((phase) => (
          <Card key={phase.title} className="text-center p-4 hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-3">{phase.icon}</div>
            <h3 className="text-base md:text-lg font-bold text-dmi-blue-800 mb-2">{phase.title}</h3>
            <p className="text-sm text-gray-600">{phase.description}</p>
          </Card>
        ))}
      </div>

      {/* How the system works — guarantees, no technical details */}
      <h3 className="text-xl md:text-2xl font-extrabold text-dmi-blue-900 text-center mt-12 mb-2">How the System Works</h3>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-2xl mx-auto">
        Every part of the election is built around fairness, privacy and transparency.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemFeatures.map((f) => (
          <Card key={f.title} className="p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">{f.icon}</div>
              <div>
                <h4 className="text-base font-bold text-dmi-blue-800 mb-1">{f.title}</h4>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
