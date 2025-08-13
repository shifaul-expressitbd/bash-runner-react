import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeployPage } from './pages/DeployPage';
import { TerminalPage } from './pages/TerminalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeployPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;