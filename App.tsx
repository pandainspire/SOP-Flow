import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { SOPEditor } from './components/SOPEditor';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.LANDING);

  return (
    <>
      {view === ViewMode.LANDING && (
        <LandingPage onStart={() => setView(ViewMode.EDITOR)} />
      )}
      {view === ViewMode.EDITOR && (
        <SOPEditor onBack={() => setView(ViewMode.LANDING)} />
      )}
    </>
  );
};

export default App;
