import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [entryDateTime, setEntryDateTime] = useState('');
  const [exitDateTime, setExitDateTime] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const MAX_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const saved = localStorage.getItem('parkingHistory');
    if (saved) {
      setHistory(JSON.parse(saved).slice(0, 10));
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('parkingHistory', JSON.stringify(history));
    }
  }, [history]);

  const calculateFee = () => {
    setError('');
    setResult(null);

    if (!entryDateTime || !exitDateTime) {
      setError('Please select valid entry and exit date/time.');
      return;
    }

    const entry = new Date(entryDateTime);
    const exit = new Date(exitDateTime);

    if (isNaN(entry) || isNaN(exit)) {
      setError('Invalid date/time selected.');
      return;
    }

    if (exit <= entry) {
      setError('Exit time must be after entry time.');
      return;
    }

    const durationMs = exit - entry;

    if (durationMs > MAX_DURATION_MS) {
      setError('Maximum parking duration is 3 days (72 hours). Please adjust your times.');
      return;
    }

    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    let baseFee = 0;

    if (durationMinutes <= 30) {
      baseFee = 0;
    } else {
      const blocksAfterFree = Math.ceil((durationMinutes - 30) / 30);
      baseFee = blocksAfterFree * 2;
    }

    // Apply daily cap before multiplier
    baseFee = Math.min(baseFee, 25);

    const isWeekend = entry.getDay() === 0 || entry.getDay() === 6;
    if (isWeekend) {
      baseFee *= 1.2;
    }

    const multipliers = {
      car: 1.0,
      motorcycle: 0.6,
      truck: 1.8
    };

    const finalFee = baseFee * multipliers[vehicleType];

    const totalHours = Math.floor(durationMinutes / 60);
    const totalMins = durationMinutes % 60;

    const calculation = {
      entry: entry.toLocaleString(),
      exit: exit.toLocaleString(),
      vehicle: vehicleType,
      duration: `${totalHours}h ${totalMins}m`,
      fee: finalFee.toFixed(2),
      weekend: isWeekend
    };

    setResult(calculation);
    setHistory(prev => [calculation, ...prev].slice(0, 10));
  };

  return (
    <div className="app-container">
      <h1>Parking Rate Calculator</h1>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="entry-datetime">Entry Date & Time</label>
          <input
            id="entry-datetime"
            type="datetime-local"
            value={entryDateTime}
            onChange={e => setEntryDateTime(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="exit-datetime">Exit Date & Time</label>
          <input
            id="exit-datetime"
            type="datetime-local"
            value={exitDateTime}
            onChange={e => setExitDateTime(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="vehicle-type">Vehicle Type</label>
          <select
            id="vehicle-type"
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
          >
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="truck">Truck / Van</option>
          </select>
        </div>
      </div>

      <button onClick={calculateFee} className="calculate-btn">
        Calculate Fee
      </button>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <div className="result-card">
          <h3>Result</h3>
          <div className="result-grid">
            <div><strong>Entry:</strong> {result.entry}</div>
            <div><strong>Exit:</strong> {result.exit}</div>
            <div><strong>Vehicle:</strong> {result.vehicle}</div>
            <div data-testid="result-duration">Duration: {result.duration}</div>
            <div>
              <strong>Fee:</strong>{' '}
              <span className="fee" data-testid="result-fee">
                ${result.fee}
              </span>
            </div>
            {result.weekend && (
              <div className="weekend-tag" data-testid="weekend-tag">Weekend rate (+20%)</div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h3>Recent Calculations (last 10)</h3>
          <ul className="history-list">
            {history.map((item, index) => (
              <li key={index} className="history-item">
                <div>{item.entry} → {item.exit}</div>
                <div>
                  {item.vehicle} • {item.duration} • <strong data-testid="history-fee">${item.fee}</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;