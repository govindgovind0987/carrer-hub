/**
 * PDF Export Utility
 * Triggers clean browser print dialog formatted as an enterprise PDF report.
 */

export function exportReportToPDF(title = 'Report') {
  if (typeof window === 'undefined') return;

  const originalTitle = document.title;
  document.title = `CareerHub_${title.replace(/\s+/g, '_')}_Report`;
  window.print();
  document.title = originalTitle;
}

export function generatePrintableHtml(data, type = 'RESUME') {
  return `
    <html>
      <head>
        <title>CareerHub ${type} Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 32px; color: #111827; }
          h1 { color: #7c3aed; font-size: 24px; }
          .score { font-size: 32px; font-weight: bold; color: #10b981; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>CareerHub Enterprise ${type} Report</h1>
        <div class="card">
          <p>Overall Score: <span class="score">${data.overallScore || 88}%</span></p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;
}
