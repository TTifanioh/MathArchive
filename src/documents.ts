import './style/explorer.css';
import 'katex/dist/katex.min.css'; 

// @ts-ignore
import renderMathInElement from 'katex/dist/contrib/auto-render';
import dataRaw from './data/topics.json';

const container = document.getElementById("tex-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const texList: string[] = dataRaw as string[];
const LATEX_PREVIEW_LIMIT = 300; // Augmenté pour un meilleur aperçu

function formatLatexName(path: string): string {
  const fileName = path.split("/").pop() || "";
  let formatted = fileName.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

async function renderLatexContent(path: string, element: HTMLElement) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Erreur");
    
    let texCode = await response.text();

    // 1. Extraction du corps du document
    if (texCode.includes("\\begin{document}")) {
      texCode = texCode.split("\\begin{document}")[1].split("\\end{document}")[0];
    }

    // 2. Nettoyage des commandes LaTeX structurelles pour l'affichage HTML
    let cleanText = texCode
      .replace(/\\maketitle/g, '')
      .replace(/\\section\{([^}]+)\}/g, '<h3 style="margin:10px 0">$1</h3>')
      .replace(/\\subsection\{([^}]+)\}/g, '<h4 style="margin:5px 0">$1</h4>')
      .replace(/\\\\/g, '<br>');

    // 3. Tronquer proprement
    const isTruncated = cleanText.length > LATEX_PREVIEW_LIMIT;
    const finalContent = isTruncated ? cleanText.substring(0, LATEX_PREVIEW_LIMIT) + "..." : cleanText;

    // 4. Injection du texte nettoyé
    element.innerHTML = finalContent;

    // 5. Utilisation de l'extension auto-render pour transformer les $...$
    renderMathInElement(element, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });

  } catch (error) {
    element.innerHTML = `<span style="color: #ff6b6b;">⚠ Impossible de charger l'aperçu</span>`;
  }
}

function renderLatexs(list: string[]) {
  if (!container) return;
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">😕 Aucun document trouvé</p>`;
    return;
  }

  list.forEach((path) => {
    const displayName = formatLatexName(path);
    const realPath = path.endsWith('.tex') ? path : `${path}.tex`;

    const card = document.createElement("div");
    card.className = "pdf-card";
    card.innerHTML = `
      <div class="latex-display" style="padding: 15px; min-height: 120px; background: #222; color: #fff; overflow: hidden; text-align: left; font-family: serif;">
        <div class="loading-placeholder">Chargement de l'aperçu...</div>
      </div>
      <div class="pdf-info">
        <span class="pdf-name">${displayName}</span>
        <a class="download-btn" href="${realPath}">Lire</a>
      </div>
    `;

    container.appendChild(card);
    const displayElement = card.querySelector(".latex-display") as HTMLElement;
    renderLatexContent(realPath, displayElement);
  });
}

searchInput?.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = texList.filter(path => formatLatexName(path).toLowerCase().includes(query));
  renderLatexs(filtered);
});

renderLatexs(texList);
