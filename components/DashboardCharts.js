"use client";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

export default function DashboardCharts({ monthlyData }) {
  const max = Math.max(...monthlyData.map(d => d.revenue), 1);

  // Line chart points (600×160 viewBox)
  const W = 600, H = 160, PAD = 30;
  const pts = monthlyData.map((d, i) => {
    const x = PAD + (i / 11) * (W - PAD * 2);
    const y = H - PAD - (d.revenue / max) * (H - PAD * 2);
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Line chart — évolution CA annuelle */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-4">Évolution du CA — année en cours</h2>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
          {/* Grid lines */}
          {[0,0.25,0.5,0.75,1].map(r => {
            const y = H - PAD - r * (H - PAD * 2);
            return <line key={r} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f1ece8" strokeWidth="1" />;
          })}
          {/* Area fill */}
          <polygon
            points={`${PAD},${H - PAD} ${polyline} ${W - PAD},${H - PAD}`}
            fill="#f0e6f6" opacity="0.5"
          />
          {/* Line */}
          <polyline points={polyline} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots + labels */}
          {pts.map(([x, y], i) => (
            <g key={i}>
              {monthlyData[i].revenue > 0 && (
                <>
                  <circle cx={x} cy={y} r="3.5" fill="#7c3aed" />
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#7c3aed">
                    {monthlyData[i].revenue > 0 ? `${monthlyData[i].revenue.toFixed(0)}€` : ""}
                  </text>
                </>
              )}
              <text x={x} y={H - 8} textAnchor="middle" fontSize="9" fill="#a8a29e">{MONTHS[i]}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bar chart — CA mensuel */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-4">CA mensuel</h2>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
          {monthlyData.map((d, i) => {
            const barW = (W - PAD * 2) / 12 * 0.6;
            const x = PAD + (i / 11) * (W - PAD * 2) - barW / 2;
            const barH = (d.revenue / max) * (H - PAD * 2);
            const y = H - PAD - barH;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH || 2}
                  rx="3" fill={d.revenue > 0 ? "#c084fc" : "#f1ece8"} />
                {d.revenue > 0 && (
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#7c3aed">
                    {d.revenue.toFixed(0)}€
                  </text>
                )}
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#a8a29e">
                  {MONTHS[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
