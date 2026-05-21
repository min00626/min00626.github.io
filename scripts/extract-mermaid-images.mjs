import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const renderedDomPath = path.join(repoRoot, "_site", "projects", "project-r.rendered.dom.html");
const outDir = path.join(repoRoot, "_site", "projects", "mermaid-diagrams");
const outHtmlPath = path.join(repoRoot, "_site", "projects", "project-r.pdf-static.html");

if (!fs.existsSync(renderedDomPath)) {
  throw new Error(`Rendered DOM not found: ${renderedDomPath}`);
}

const html = fs.readFileSync(renderedDomPath, "utf8");
fs.mkdirSync(outDir, { recursive: true });

// Clean old generated diagram files.
for (const name of fs.readdirSync(outDir)) {
  if (/^mermaid-\d{2}\.svg$/i.test(name)) {
    fs.unlinkSync(path.join(outDir, name));
  }
}

let count = 0;
const replaced = html.replace(
  /(<img\b[^>]*\bclass="[^"]*\bmermaid-image\b[^"]*"[^>]*\bsrc=")data:image\/svg\+xml;charset=utf-8,([^"]+)("[^>]*>)/g,
  (_full, before, encodedSvg, after) => {
    count += 1;
    const fileName = `mermaid-${String(count).padStart(2, "0")}.svg`;
    const filePath = path.join(outDir, fileName);
    const svgText = decodeURIComponent(encodedSvg);
    fs.writeFileSync(filePath, svgText, "utf8");

    // Keep all other attributes, replace only src.
    return `${before}./mermaid-diagrams/${fileName}${after}`;
  }
);

if (count === 0) {
  throw new Error("No mermaid-image data URI tags found in rendered DOM.");
}

// Static PDF source should not need runtime scripts.
const staticHtml = replaced
  .replace(/<script\b[\s\S]*?<\/script>/g, "")
  .replace(/<div class="mermaidTooltip"[\s\S]*?<\/div>/g, "");

fs.writeFileSync(outHtmlPath, staticHtml, "utf8");

console.log(`Extracted ${count} mermaid SVG files to: ${outDir}`);
console.log(`Static HTML written to: ${outHtmlPath}`);
