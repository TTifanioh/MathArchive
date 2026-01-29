// documents.ts
import './style/explorer.css';
import 'katex/dist/katex.min.css'; 
// @ts-ignore
import renderMathInElement from 'katex/dist/contrib/auto-render';
import dataRaw from './data/topics.json';
import { formatFileName, filterList, setupSearch } from './utils';

const container = document.getElementById("tex-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const texList = dataRaw as string[];
const PREVIEW_LIMIT = 300;

async function renderLatexContent(path: string, element: HTMLElement) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error();
    let tex = await response.text();

    if (tex.includes("\\begin{document}")) {
      tex = tex.split("\\begin{document}")[1].split("\\end{document}")[0];
    }

    let clean = tex
      .replace(/\\maketitle/g, '')
      .replace(/\\section\{([^}]+)\}/g, '<h3 style="margin:10px 0">$1</h3>')
      .replace(/\\\\/g, '<br>')
      .substring(0, PREVIEW_LIMIT);

    element.innerHTML = clean + (tex.length > PREVIEW_LIMIT ? "..." : "");

    renderMathInElement(element, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });
  } catch {
    element.innerHTML = `<span style="color: #ff6b6b;">⚠ Erreur aperçu</span>`;
  }
}

function render(list: string[]) {
  if (!container) return;
  container.innerHTML = list.length ? "" : `<p class="empty">😕 Aucun document</p>`;

  list.forEach((path) => {
    const realPath = path.endsWith('.tex') ? path : `${path}.tex`;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="latex-display" style="padding:15px; background:#222; font-family:serif;">
        <div class="loading">Chargement...</div>
      </div>
      <div class="card-info">
        <span class="card-name">${formatFileName(path)}</span>
        <a class="download-btn" href="${realPath}">Lire</a>
      </div>`;
    container.appendChild(card);
    renderLatexContent(realPath, card.querySelector(".latex-display")!);
  });
}

setupSearch(searchInput, (q) => render(filterList(texList, q)));
render(texList);
