import './style/explorer.css'; 
import data from './data/pdfs.json';

const container = document.getElementById("pdf-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;

const pdfList: string[] = data;

function formatPdfName(path: string): string {
  const fileName = path.split("/").pop() || "";
  const nameWithoutExt = fileName.replace(/\.pdf$/i, "");

  // 1. snake_case → espaces
  let formatted = nameWithoutExt.replace(/_/g, " ");

  // 2. CamelCase → espaces
  formatted = formatted.replace(
    /([a-z])([A-Z])/g,
    "$1 $2"
  );

  // 3. normalisation (minuscule)
  formatted = formatted.toLowerCase();

  // 4. première lettre majuscule
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return formatted;
}

function init() {
  renderPDFs(pdfList);
}

function renderPDFs(list: string[]) {
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">😕 Aucun document trouvé</p>`;
    return;
  }

  list.forEach((path) => {
    const displayName = formatPdfName(path);

    const card = document.createElement("div");
    card.className = "pdf-card";

    card.innerHTML = `
      <iframe src="${path}" loading="lazy"></iframe>

      <div class="pdf-info">
        <span class="pdf-name">${displayName}</span>
        <a class="download-btn" href="${path}" download>
          Télécharger
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}


searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = pdfList.filter(pdf =>
    formatPdfName(pdf).toLowerCase().includes(query)
  );
  renderPDFs(filtered);
});

init();
