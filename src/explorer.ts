// explorer.ts
import './style/explorer.css'; 
import dataRaw from './data/topics.json';
import { formatFileName, filterList, setupSearch } from './utils';

const container = document.getElementById("pdf-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const pdfList = dataRaw as string[];

function render(list: string[]) {
  if (!container) return;
  container.innerHTML = list.length ? "" : `<p class="empty">😕 Aucun PDF</p>`;

  list.forEach((path) => {
    const realPath = path.endsWith('.pdf') ? path : `${path}.pdf`;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <iframe src="${realPath}" loading="lazy"></iframe>
      <div class="card-info">
        <span class="card-name">${formatFileName(path)}</span>
        <a class="download-btn" href="${realPath}" download>Télécharger</a>
      </div>`;
    container.appendChild(card);
  });
}

setupSearch(searchInput, (q) => render(filterList(pdfList, q)));
render(pdfList);
