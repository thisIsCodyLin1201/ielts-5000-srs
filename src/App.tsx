import { useEffect } from 'react';
import { useApp } from './app-state';
import { useKeyboard } from './hooks/useKeyboard';
import { initTTS } from './lib/tts';
import { Header } from './components/Header';
import { StatBar } from './components/StatBar';
import { StudyCard } from './components/StudyCard';
import { GradeBar } from './components/GradeBar';
import { DoneView } from './components/DoneView';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';

export default function App() {
  const { panel, isDone } = useApp();
  useKeyboard();
  useEffect(() => { initTTS(); }, []);

  const study = panel === 'study';

  return (
    <div className="app">
      <Header />
      {study && <StatBar />}

      <main className="content">
        {panel === 'settings' ? (
          <SettingsPanel />
        ) : panel === 'stats' ? (
          <StatsPanel />
        ) : isDone ? (
          <DoneView />
        ) : (
          <StudyCard />
        )}
      </main>

      {study && !isDone && (
        <div className="bottombar">
          <GradeBar />
        </div>
      )}
    </div>
  );
}
