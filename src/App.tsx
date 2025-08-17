import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeployPage } from './pages/DeployPage';
import { DockerTagServerPage } from './pages/DockerTagServerPage';
import { TerminalPage } from './pages/TerminalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeployPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/docker-tagserver" element={<DockerTagServerPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;