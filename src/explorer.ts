import './style/explorer.css'; 
// Importation typée pour correspondre à la structure du JSON
import dataRaw from './data/topics.json';

const container = document.getElementById("pdf-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;

// Cast explicite en string array
const pdfList: string[] = dataRaw as string[];

/**
 * Formate le chemin pour l'affichage
 * Exemple: "/algebre2/reduction_matrice" -> "Reduction matrice"
 */
function formatPdfName(path: string): string {
  // Récupère uniquement la dernière partie du chemin
  const fileName = path.split("/").pop() || "";
  
  // Suppression de l'extension .pdf (au cas où elle reviendrait)
  let formatted = fileName.replace(/\.pdf$/i, "");

  // 1. snake_case ou kebab-case -> espaces
  formatted = formatted.replace(/[_-]/g, " ");

  // 2. CamelCase -> espaces (ex: EquationLineaire -> Equation Lineaire)
  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 3. Normalisation & Capitalisation de la première lettre
  formatted = formatted.toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function renderPDFs(list: string[]) {
  if (!container) return;
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">😕 Aucun document trouvé</p>`;
    return;
  }

  list.forEach((path) => {
    const displayName = formatPdfName(path);
    // Note: On ajoute .pdf ici pour le lien réel si vos fichiers sur le serveur ont l'extension
    const realPath = path.endsWith('.pdf') ? path : `${path}.pdf`;

    const card = document.createElement("div");
    card.className = "pdf-card";

    card.innerHTML = `
      <iframe src="${realPath}" loading="lazy"></iframe>
      <div class="pdf-info">
        <span class="pdf-name">${displayName}</span>
        <a class="download-btn" href="${realPath}" download>
          Télécharger
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

searchInput?.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = pdfList.filter(path => 
    formatPdfName(path).toLowerCase().includes(query)
  );
  renderPDFs(filtered);
});

// Lancement
renderPDFs(pdfList);
