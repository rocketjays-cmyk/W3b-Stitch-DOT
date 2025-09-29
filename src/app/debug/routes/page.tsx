// app/debug/routes/page.tsx
import fs from "fs";
import path from "path";

type Row = { route: string; file: string };

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && /route\.ts$|page\.tsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

export default function RoutesDebug() {
  const appDir = path.join(process.cwd(), "app");
  const files = fs.existsSync(appDir) ? walk(appDir) : [];
  const rows: Row[] = files.map((f) => {
    const rel = f.replace(appDir, "");
    // derive route: /api/* from route.ts, and /* from page.tsx
    const apiMatch = rel.match(/\\api\\(.+?)\\route\.ts$/);
    const pageMatch = rel.match(/(.+)\\page\.tsx?$/);
    let route = "";
    if (apiMatch) route = "/api/" + apiMatch[1].replace(/\\/g, "/");
    else if (pageMatch) route = pageMatch[1].replace(/\\/g, "/") || "/";
    return { route, file: "app" + rel.replace(/\\/g, "/") };
  });

  rows.sort((a, b) => a.route.localeCompare(b.route));

  return (
    <main style={{ padding: 24 }}>
      <h1>Routes</h1>
      <p>Listing discovered pages and API routes under <code>/app</code>.</p>
      <table cellPadding={8} style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr style={{ background: "#f8f8f8" }}>
            <th align="left">Route</th>
            <th align="left">File</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.file}>
              <td><code>{r.route || "(unparsed)"}</code></td>
              <td><code>{r.file}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p>No routes found. Do you have an <code>/app</code> directory?</p>}
    </main>
  );
}
