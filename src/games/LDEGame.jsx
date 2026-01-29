import React, { useState, useEffect } from "react";
import Jar from "../components/Jar";
import "../styles/jars.css";

const STORAGE_KEY = "lde-water-jar-game";
const TIMER = 300;

/* ===============================
   Euclid
================================= */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/* ===============================
   Random valid LDE puzzle
================================= */
function generateRandomPuzzle() {
  while (true) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 29) + 2;
    if (b <= a) continue;

    const c = Math.floor(Math.random() * 40) + 1;

    if (c % gcd(a, b) === 0) {
      return { a, b, c };
    }
  }
}

export default function LDEGame() {

  /* ===============================
     Restore state
  ================================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const state = JSON.parse(saved);

    if (state.screen === "PLAYING") {
      const elapsed =
        Math.floor((Date.now() - state.lastUpdated) / 1000);

      setScreen("PLAYING");
      setMode(state.mode);

      setA_CAP(state.A_CAP);
      setB_CAP(state.B_CAP);
      setTARGET(state.TARGET);

      setA(state.a);
      setB(state.b);
      setC(state.c);

      setLost(state.lost);
      setGameOver(state.gameOver);

      setTimeLeft(Math.max(0, state.timeLeft - elapsed));
    }
  }, []);

  /* ===============================
     State
  ================================= */
  const [screen, setScreen] = useState("HOME");
  const [mode, setMode] = useState("");

  const [A_CAP, setA_CAP] = useState(0);
  const [B_CAP, setB_CAP] = useState(0);
  const [TARGET, setTARGET] = useState(0);

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [lost, setLost] = useState(false);

  const [timeLeft, setTimeLeft] = useState(TIMER);

  const [form, setForm] = useState({ a: "", b: "", c: "" });
  const [error, setError] = useState("");

  /* ===============================
     Timer
  ================================= */
  useEffect(() => {
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

  /* ===============================
     Persistence
  ================================= */
  useEffect(() => {
    if (screen !== "PLAYING") return;

    const state = {
      screen,
      mode,
      A_CAP,
      B_CAP,
      TARGET,
      a,
      b,
      c,
      timeLeft,
      lost,
      gameOver,
      lastUpdated: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [screen, a, b, c, timeLeft, lost, gameOver]);

  /* ===============================
     Game logic
  ================================= */
  function startRandom() {
    const p = generateRandomPuzzle();
    setA_CAP(p.a);
    setB_CAP(p.b);
    setTARGET(p.c);
    setMode("RANDOM");
    setScreen("RANDOM_READY");
  }

  function validateAndStartCustom() {
    const a = parseInt(form.a);
    const b = parseInt(form.b);
    const c = parseInt(form.c);

    if (!a || !b || !c) {
      setError("All values must be filled");
      return;
    }
    if (a <= 0 || b <= 0 || c <= 0) {
      setError("Values must be natural numbers");
      return;
    }
    if (b <= a) {
      setError("Bottle-2 must be larger than Bottle-1");
      return;
    }
    if (c % gcd(a, b) !== 0) {
      setError(`gcd(${a}, ${b}) does not divide ${c}`);
      return;
    }

    setError("");
    setA_CAP(a);
    setB_CAP(b);
    setTARGET(c);
    setForm({ a: "", b: "", c: "" });

    setMode("CUSTOM");
    startGame();
  }

  function startGame() {
    setA(0);
    setB(0);
    setC(0);
    setGameOver(false);
    setLost(false);
    setTimeLeft(TIMER);
    setScreen("PLAYING");
  }

  function update(na, nb, nc) {
    if (gameOver || lost) return;

    setA(na);
    setB(nb);
    setC(nc);

    if (nc === TARGET) {
      setGameOver(true);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function resetAll() {
    setA(0);
    setB(0);
    setC(0);
  }

  function playAgain() {
    if (mode === "RANDOM") {
      startRandom();
    } else {
      setForm({ a: "", b: "", c: "" });
      setError("");
      setScreen("CUSTOM_FORM");
    }
  }

  /* ============ HOME ============ */
  if (screen === "HOME") {
    return (
      <div className="app">
        <h1>Linear Diophantine Puzzle</h1>

        <div className="buttons-container">
          <button onClick={startRandom}>🎲 Play Random Puzzle</button>
          <button
            onClick={() => {
              setMode("CUSTOM");
              setForm({ a: "", b: "", c: "" });
              setError("");
              setScreen("CUSTOM_FORM");
            }}
          >
            🧮 Play Custom Puzzle
          </button>
        </div>

        <div className="how-to-play">
          <h2>🧠 How to Play</h2>

          <p>
            This game represents the equation <b>ax + by = c</b>.
          </p>

          <ul>
            <li>Fill Bottle-1 or Bottle-2</li>
            <li>Pour their contents into Bottle-3</li>
            <li>Remove exactly a or b litres from Bottle-3</li>
          </ul>

          <p>
            🏆 You win when Bottle-3 contains exactly <b>c</b> litres.
          </p>
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
            <span className="label">🫙 a</span>
            <span className="value">{A_CAP} L</span>
          </div>
          <div className="mission-item">
            <span className="label">🫙 b</span>
            <span className="value">{B_CAP} L</span>
          </div>
          <div className="mission-item target">
            <span className="label">🎯 c</span>
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
            placeholder="a"
            value={form.a}
            onChange={e => setForm({ ...form, a: e.target.value })}
          />
          <input
            placeholder="b"
            value={form.b}
            onChange={e => setForm({ ...form, b: e.target.value })}
          />
          <input
            placeholder="c"
            value={form.c}
            onChange={e => setForm({ ...form, c: e.target.value })}
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
          <span className="label">🫙 a</span>
          <span className="value">{A_CAP} L</span>
        </div>
        <div className="mission-item">
          <span className="label">🫙 b</span>
          <span className="value">{B_CAP} L</span>
        </div>
        <div className="mission-item target">
          <span className="label">🎯 c</span>
          <span className="value">{TARGET} L</span>
        </div>
      </div>

      {gameOver && (
        <div className="modal-backdrop">
          <div className="win-modal">
            <h2>🎉 Puzzle Solved!</h2>
            <p>You successfully reached {TARGET} litres.</p>

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
          <Jar value={a} max={A_CAP} label="Bottle-1" ht={12} />
          <div className="controls">
            <button onClick={() => update(A_CAP, b, c)}>Fill</button>
            <button onClick={() => update(0, b, c)}>Empty</button>
            <button onClick={() => update(0, b, c + a)}>Pour → Bottle-3</button>
          </div>
        </div>

        <div className="jar-column">
          <Jar value={b} max={B_CAP} label="Bottle-2" ht={15} />
          <div className="controls">
            <button onClick={() => update(a, B_CAP, c)}>Fill</button>
            <button onClick={() => update(a, 0, c)}>Empty</button>
            <button onClick={() => update(a, 0, c + b)}>Pour → Bottle-3</button>
          </div>
        </div>

        <div className="jar-column">
          <Jar value={c} max={TARGET} label="Bottle-3" ht={18} />
          <div className="controls">
            <button disabled={c < A_CAP}
              onClick={() => update(a, b, c - A_CAP)}>
              −{A_CAP}
            </button>
            <button disabled={c < B_CAP}
              onClick={() => update(a, b, c - B_CAP)}>
              −{B_CAP}
            </button>
            <button onClick={resetAll}>♻ Reset</button>
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
