import './App.css';

import SimulationPanel from './SimulationPanel';
import ReportsPanel from './ReportsPanel';


function App() {
  return (
    <div className="App">
      <div className="container mt-5">
        <div className="row">
          <div className="col-lg-6">
            <SimulationPanel />
          </div>
          <div className="col-lg-6">
            <ReportsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
