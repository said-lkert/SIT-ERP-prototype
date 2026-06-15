import React from 'react';

export function ReportModule() {
  const latexReport = `\\documentclass[12pt,a4paper]{report}

% ── Encodage & langue ──────────────────────────────────────────────
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}

% ── Mise en page ───────────────────────────────────────────────────
\\usepackage[top=2.5cm, bottom=2.5cm, left=3cm, right=2.5cm]{geometry}
\\usepackage{setspace}
\\onehalfspacing

% ... (rest of the LaTeX provided by the user)
`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Technical Report (LaTeX)</h1>
      <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-xs font-mono">
        {latexReport}
      </pre>
    </div>
  );
}
