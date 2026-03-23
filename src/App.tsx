import { useEffect } from 'react';
import { MapView } from './components/MapView/MapView';
import { SearchBar } from './components/SearchBar/SearchBar';
import { DetailPanel } from './components/DetailPanel/DetailPanel';
import { useAppStore } from './store/useAppStore';
import './App.css';

function App() {
  const loadUserData = useAppStore((s) => s.loadUserData);

  useEffect(() => {
    (async () => {
      await loadUserData();
    })();
  }, [loadUserData]);

  return (
    <>
      <MapView />
      <SearchBar />
      <DetailPanel />
    </>
  );
}

export default App;
