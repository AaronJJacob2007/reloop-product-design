// A dependency-free server for the included production build. No app data is sent here.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.argv[2] || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
if (!fs.existsSync(path.join(root, "index.html")))
  throw new Error("Production build missing. Run npm run build first.");
http
  .createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      let file = path.resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        if (path.extname(pathname)) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        file = path.join(root, "index.html");
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(400);
      response.end("Bad request");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(
      `ReLoop is ready at http://127.0.0.1:${port}\nKeep this window open. Press Ctrl+C to stop.`,
    ),
  );
