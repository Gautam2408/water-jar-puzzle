import React from "react";

const SCALE = 18; // pixels per litre

export default function Jar({ value, max, label, ht }) {
  const height = ht * SCALE;
  const waterHeight = (value / max) * height;

  return (
    <div>
      <div className="jar" style={{ height }}>
        <div className="water" style={{ height: waterHeight }}></div>
      </div>

      <div className="jar-label">
        {label} <br />
        {value} / {max} L
      </div>
    </div>
  );
}