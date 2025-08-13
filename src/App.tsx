import { BrowserRouter, Route } from 'react-router'
import { DeployPage } from './pages/DeployPage'
import { TerminalPage } from './pages/TerminalPage'

function App() {
  return (
    <BrowserRouter>
      <Route>
        <Route path="/" element={<DeployPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
      </Route>
    </BrowserRouter>
  )
}

export default App