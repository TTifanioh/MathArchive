import './style/explorer.css';
import data from './data/topics.json';

const container = document.getElementById("tex-container") as HTMLDivElement;
const searchInput = document.getElementById("search") as HTMLInputElement;

const reader = document.getElementById("reader") as HTMLDialogElement;
const content = document.getElementById("content") as HTMLDivElement;
const closeBtn = document.getElementById("close") as HTMLButtonElement;

const lessonList: string[] = data;

/* =========================
   Utils
========================= */

// Convertit le chemin (/algebre1/Equation) en nom lisible (Equation)
function formatName(path: string): string {
  const fileName = path.split("/").pop() || "";

  // Gère snake_case et CamelCase
  let formatted = fileName.replace(/_/g, " ");
  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");
  formatted = formatted.toLowerCase();
  
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Transforme le chemin du JSON en fichier .tex
function toTexPath(basePath: string): string {
  return `${basePath}.tex`;
}

/* =========================
   Init
========================= */
function init() {
  renderLessons(lessonList);
}

/* =========================
   Render
========================= */
function renderLessons(list: string[]) {
  if (!container) return;
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">😕 Aucun document trouvé</p>`;
    return;
  }

  list.forEach((basePath) => {
    const title = formatName(basePath);
    const texPath = toTexPath(basePath);

    const card = document.createElement("div");
    card.className = "lesson-card";

    card.innerHTML = `
      <div class="lesson-preview">
        \\(${title}\\)
      </div>

      <div class="lesson-info">
        <span class="lesson-name">${title}</span>
        <button class="read-btn">Lire</button>
      </div>
    `;

    card.querySelector(".read-btn")!
      .addEventListener("click", () => openLesson(texPath));

    container.appendChild(card);
  });
}

/* =========================
   Reader
========================= */
async function openLesson(texPath: string) {
  try {
    const res = await fetch(texPath);

    if (!res.ok) {
      content.innerHTML = `<p class="error">❌ Impossible de charger le fichier .tex</p>`;
      reader.showModal();
      return;
    }

    const tex = await res.text();
    content.innerHTML = `\\(${tex}\\)`;
    reader.showModal();

    // Rendu mathématique via MathJax
    // @ts-ignore
    if (window.MathJax) {
       // @ts-ignore
      MathJax.typesetPromise();
    }
  } catch (err) {
    content.innerHTML = `<p class="error">❌ Erreur réseau</p>`;
    reader.showModal();
  }
}

closeBtn?.addEventListener("click", () => reader.close());

/* =========================
   Search
========================= */
searchInput?.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filtered = lessonList.filter(path =>
    formatName(path).toLowerCase().includes(query)
  );

  renderLessons(filtered);
});

init();
