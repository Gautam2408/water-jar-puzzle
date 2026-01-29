import React, { useState } from "react";
import EuclideanGame from "./games/EuclideanGame";
import LDEGame from "./games/LDEGame";

export default function App() {
  const [game, setGame] = useState("HOME");

  if (game === "EUCLIDEAN") {
    return <EuclideanGame goHome={() => setGame("HOME")} />;
  }

  if (game === "LDE") {
    return <LDEGame goHome={() => setGame("HOME")} />;
  }

  return (
    <div className="app">
      <h1>Water Jar Games</h1>

      <div className="buttons-container">
        <button onClick={() => setGame("EUCLIDEAN")}>
          🫙 Euclidean Game
        </button>

        <button onClick={() => setGame("LDE")}>
          ➕ Linear Diophantine Game
        </button>
      </div>
    </div>
  );
}
