import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const inputPath = path.join(repoRoot, "_site", "projects", "project-r.html");
const outputHtmlPath = path.join(repoRoot, "_site", "projects", "project-r.pdf-ready.html");
const outputPdfPath = path.join(repoRoot, "_site", "projects", "project-r.pdf");

let html = fs.readFileSync(inputPath, "utf8");

// Keep local assets working with localhost root.
html = html.replace('href="http://localhost:4000/projects/project-r"', 'href="http://127.0.0.1:8787/_site/projects/project-r.pdf-ready.html"');

// Remove analytics script for deterministic rendering.
html = html.replace(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*<\/head>/m, "</head>");

// Expand folded sections by default.
html = html.replace(/<details>/g, "<details open>");

// Replace YouTube embeds with links (keep only link in PDF).
html = html.replace(
  /<div class="video-embed">[\s\S]*?<\/div>/g,
  (block) => {
    const srcMatch = String(block).match(/src="([^"]+)"/i);
    const src = srcMatch ? srcMatch[1] : "";
    const idMatch = src.match(/youtube\.com\/embed\/([^?&]+)/i);
    const url = idMatch ? `https://www.youtube.com/watch?v=${idMatch[1]}` : String(src);
    return `<p class="video-link"><strong>영상 링크: </strong><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`;
  }
);

// Add notice at top of content.
html = html.replace(
  /<div class="post__content">/,
  `<div class="post__content">
      <blockquote class="pdf-notice">
        본 문서는 포트폴리오 블로그의 포스트를 변환한 문서입니다.<br>
        아래 링크를 통해 블로그로 이동하시면 더 쾌적하게 열람하실 수 있으며, 다양한 개인 프로젝트도 확인하실 수 있습니다.<br>
        포스트 링크 : <a href="https://min00626.github.io/projects/project-r" target="_blank" rel="noopener noreferrer">https://min00626.github.io/projects/project-r</a>
      </blockquote>`
);

// Swap remote mermaid init block with local render + conversion logic.
const oldMermaidBlock = /<script type="module">[\s\S]*?import mermaid from 'https:\/\/cdn\.jsdelivr\.net\/npm\/mermaid@11\/dist\/mermaid\.esm\.min\.mjs';[\s\S]*?<\/script>/m;
const newMermaidBlock = `<style>
  @media print {
    header, footer, .top, .related-posts, .main-nav, .nav-button { display: none !important; }
    .container { max-width: 980px !important; }
    .video-link { border: 1px solid #dadada; padding: 10px 12px; border-radius: 8px; background: #f8f8f8; }
    .pdf-notice { border-left: 4px solid #4f46e5; background: #f5f3ff; padding: 10px 14px; margin: 0 0 18px 0; font-size: 16px; line-height: 1.45; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    img, svg { page-break-inside: avoid; }
  }
  .mermaid-image { width: 100%; height: auto; display: block; margin: 12px 0; }
</style>
<script src="/node_modules/mermaid/dist/mermaid.js"></script>
<script>
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }

  async function renderAndConvertMermaid() {
    if (!window.mermaid) return;

    try {
      await window.mermaid.run({ querySelector: '.mermaid', suppressErrors: true });
    } catch (e) {
    }

    const blocks = Array.from(document.querySelectorAll('.mermaid'));
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const svg = block.querySelector('svg');
      if (!svg) continue;

      const img = document.createElement('img');
      img.className = 'mermaid-image';
      img.alt = 'diagram-' + (i + 1);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
      block.replaceWith(img);
    }
  }

  window.addEventListener('DOMContentLoaded', async function () {
    await renderAndConvertMermaid();
  });
</script>`;

html = html.replace(oldMermaidBlock, newMermaidBlock);

fs.writeFileSync(outputHtmlPath, html, "utf8");

console.log("Prepared HTML:", outputHtmlPath);
console.log("Target PDF:", outputPdfPath);
