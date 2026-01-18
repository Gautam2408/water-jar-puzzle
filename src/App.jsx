import React, { useState, useEffect } from "react";
import Jar from "./components/Jar";
import "./styles/jars.css";

const STORAGE_KEY = "water-jar-game";
const TIMER = 300;

/* ===============================
   Euclid
================================= */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/* ===============================
   Random valid puzzle generator
================================= */
function generateRandomPuzzle() {
  while (true) {
    const b1 = Math.floor(Math.random() * 20) + 1;
    const b2 = Math.floor(Math.random() * 29) + 2;
    if (b2 <= b1) continue;

    const target = Math.floor(Math.random() * (b2 - 1)) + 2;
    if (target > b2) continue;

    if (target % gcd(b1, b2) === 0) {
      return { b1, b2, target };
    }
  }
}

export default function App() {

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
  
    const state = JSON.parse(saved);
  
    if (state.screen === "PLAYING") {
      const elapsed =
        Math.floor((Date.now() - state.lastUpdated) / 1000);
  
      setScreen("PLAYING");
      setMode(state.mode);
  
      setB1(state.B1);
      setB2(state.B2);
      setTARGET(state.TARGET);
  
      setA(state.a);
      setB(state.b);
  
      setLost(state.lost);
      setGameOver(state.gameOver);
  
      setTimeLeft(Math.max(0, state.timeLeft - elapsed));
    }
  }, []);

  const [screen, setScreen] = useState("HOME");
  const [mode, setMode] = useState("");

  const [B1, setB1] = useState(0);
  const [B2, setB2] = useState(0);
  const [TARGET, setTARGET] = useState(0);

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [form, setForm] = useState({ b1: "", b2: "", target: "" });
  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState(TIMER); // 5 minutes
  const [lost, setLost] = useState(false);

  React.useEffect(() => {
    if (screen !== "PLAYING" || gameOver || lost) return;
  
    if (timeLeft <= 0) {
      setLost(true);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
  
    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
  
    return () => clearTimeout(timer);
  }, [screen, timeLeft, gameOver, lost]);

  useEffect(() => {
    if (screen !== "PLAYING") return;
  
    const state = {
      screen,
      mode,
      B1,
      B2,
      TARGET,
      a,
      b,
      timeLeft,
      lost,
      gameOver,
      lastUpdated: Date.now()
    };
  
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [screen, a, b, timeLeft, lost, gameOver]);

  function startRandom() {
    const p = generateRandomPuzzle();
    setB1(p.b1);
    setB2(p.b2);
    setTARGET(p.target);
    setMode("RANDOM");
    setScreen("RANDOM_READY");
  }

  function validateAndStartCustom() {
    const b1 = parseInt(form.b1);
    const b2 = parseInt(form.b2);
    const t = parseInt(form.target);

    if (!b1 || !b2 || !t) {
      setError("All values must be filled");
      return;
    }
    if (b1 <= 0 || b2 <= 0 || t <= 0) {
      setError("Values must be natural numbers");
      return;
    }
    if (b2 <= b1) {
      setError("Bottle-2 must be larger than Bottle-1");
      return;
    }
    if (t > b2) {
      setError("Target cannot exceed Bottle-2");
      return;
    }
    if (t % gcd(b1, b2) !== 0) {
      setError(`gcd(${b1}, ${b2}) does not divide ${t}`);
      return;
    }

    setError("");
    setB1(b1);
    setB2(b2);
    setTARGET(t);
    setForm({ b1: "", b2: "", target: "" });

    setMode("CUSTOM");
    startGame();
  }

  function startGame() {
    setA(0);
    setB(0);
    setGameOver(false);
    setLost(false);
    setTimeLeft(TIMER); // reset timer
    setScreen("PLAYING");
  }
  

  function update(na, nb) {
    if (gameOver || lost) return;
  
    setA(na);
    setB(nb);
  
    if (na === TARGET || nb === TARGET) {
      setGameOver(true);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  

  function playAgain() {
    if (mode === "RANDOM") {
      startRandom();
    } else {
      setForm({ b1: "", b2: "", target: "" });
      setError("");
      setScreen("CUSTOM_FORM");
    }
  }

  /* ============ HOME ============ */
  if (screen === "HOME") {
    return (
      <div className="app">
        <h1>Water Jar Puzzle</h1>
        <div className="buttons-container">
          <button onClick={startRandom}>🎲 Play Random Puzzle</button>
          <button
            onClick={() => {
              setMode("CUSTOM");
              setForm({ b1: "", b2: "", target: "" });
              setError("");
              setScreen("CUSTOM_FORM");
            }}
          >
            🧮 Play Custom Puzzle
          </button>
        </div>

        {/* HOW TO PLAY */}
        <div className="how-to-play">
          <h2>🧠 How to Play</h2>

          <p>
            You are given <b>two water bottles</b> with fixed capacities and an
            <b> infinite water source</b>.
          </p>

          <p>
            🎯 <b>Goal:</b> Measure exactly the <b>target amount of water</b> in
            <b> either bottle</b>.
          </p>

          <h3>Allowed Moves</h3>
          <ul>
            <li>✅ Fill a bottle completely</li>
            <li>✅ Empty a bottle completely</li>
            <li>✅ Pour water from one bottle into the other until one becomes full or empty</li>
          </ul>

          <h3>Winning Condition</h3>
          <ul>
            <li>🏆 The game is solved when either bottle contains exactly the target amount</li>
          </ul>

          {/* <h3>💡 Mathematical Hint</h3>
          <p>
            A puzzle is solvable <b>only if</b> the target is divisible by
            <code> gcd(Bottle-1, Bottle-2)</code>.
          </p> */}
        </div>

        
      </div>
    );
  }

  /* ============ RANDOM READY ============ */
  if (screen === "RANDOM_READY") {
    return (
      <div className="app">
        <h1>Random Puzzle</h1>

        <div className="mission-panel">
          <div className="mission-item">
            <span className="label">🫙 Bottle-1</span>
            <span className="value">{B1} L</span>
          </div>
          <div className="mission-item">
            <span className="label">🫙 Bottle-2</span>
            <span className="value">{B2} L</span>
          </div>
          <div className="mission-item target">
            <span className="label">🎯 Target</span>
            <span className="value">{TARGET} L</span>
          </div>
        </div>

        <button onClick={startGame}>▶ Play</button>

        <div className="buttons-container">
        <button onClick={() => {
  localStorage.removeItem(STORAGE_KEY);
  setScreen("HOME");
}}>
  🏠 Home
</button>
          <button onClick={playAgain}>🔄 Play Again</button>
        </div>
      </div>
    );
  }

  /* ============ CUSTOM FORM ============ */
  if (screen === "CUSTOM_FORM") {
    return (
      <div className="app">
        <h1>Custom Puzzle</h1>

        <div className="form-hint">
          <h3>🫙 Bottle-2 must be larger than 🫙 Bottle-1</h3>
        </div>

        <div className="form-container">
          <input
            placeholder="Bottle-1"
            value={form.b1}
            onChange={(e) => setForm({ ...form, b1: e.target.value })}
          />
          <input
            placeholder="Bottle-2"
            value={form.b2}
            onChange={(e) => setForm({ ...form, b2: e.target.value })}
          />
          <input
            placeholder="Target"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
          <button onClick={validateAndStartCustom}>▶ Play</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="buttons-container">
        <button onClick={() => {
  localStorage.removeItem(STORAGE_KEY);
  setScreen("HOME");
}}>
  🏠 Home
</button>
          <button onClick={playAgain}>🔄 Play Again</button>
        </div>
      </div>
    );
  }

  /* ============ GAME ============ */
  return (
    <div className="app">
      <div className="mission-panel">
        <div className="mission-item">
          <span className="label">🫙 Bottle-1</span>
          <span className="value">{B1} L</span>
        </div>
        <div className="mission-item">
          <span className="label">🫙 Bottle-2</span>
          <span className="value">{B2} L</span>
        </div>
        <div className="mission-item target">
          <span className="label">🎯 Target</span>
          <span className="value">{TARGET} L</span>
        </div>
      </div>

      {gameOver && (
        <div className="modal-backdrop">
          <div className="win-modal">
            <h2>🎉 Puzzle Solved!</h2>
            <p>You successfully measured {TARGET} litres.</p>

            <div className="modal-buttons">
              <button onClick={playAgain}>🔄 Play Again</button>
              <button onClick={() => {
  localStorage.removeItem(STORAGE_KEY);
  setScreen("HOME");
}}>
  🏠 Home
</button>
            </div>
          </div>
        </div>
      )}
      {lost && (
  <div className="modal-backdrop">
    <div className="win-modal">
      <h2>⏱️ Time’s Up!</h2>
      <p>You couldn’t reach {TARGET} litres in time.</p>

      <div className="modal-buttons">
        <button onClick={playAgain}>🔄 Try Again</button>
        <button onClick={() => {
  localStorage.removeItem(STORAGE_KEY);
  setScreen("HOME");
}}>
  🏠 Home
</button>
      </div>
    </div>
  </div>
)}


          <div className="timer">
          ⏳ Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>

      <div className="jars-container">
        <div className="jar-column">
          <Jar value={a} max={B1} label="Bottle-1" ht={12} />
          <div className="controls">
            <button onClick={() => update(B1, b)}>Fill</button>
            <button onClick={() => update(0, b)}>Empty</button>
            <button
              onClick={() => {
                const t = Math.min(a, B2 - b);
                update(a - t, b + t);
              }}
            >
              Pour → Bottle-2
            </button>
          </div>
        </div>

        <div className="jar-column">
          <Jar value={b} max={B2} label="Bottle-2" ht={15} />
          <div className="controls">
            <button onClick={() => update(a, B2)}>Fill</button>
            <button onClick={() => update(a, 0)}>Empty</button>
            <button
              onClick={() => {
                const t = Math.min(b, B1 - a);
                update(a + t, b - t);
              }}
            >
              Pour → Bottle-1
            </button>
          </div>
        </div>
      </div>

      <div className="buttons-container">
      <button onClick={() => {
  localStorage.removeItem(STORAGE_KEY);
  setScreen("HOME");
}}>
  🏠 Home
</button>
        <button onClick={playAgain}>🔄 Play Again</button>
      </div>
    </div>

    
  );
}
