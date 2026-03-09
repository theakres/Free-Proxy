document.addEventListener("DOMContentLoaded", () => {
 const countrySelector = document.getElementById("countrySelector");
 const proxyGrid = document.getElementById("proxyGrid");
 const themeBtn = document.getElementById("themeBtn");

 themeBtn.onclick = () => {
  const isLight = document.body.classList.toggle("light-mode");
  document.getElementById("themeIcon").textContent = isLight ? "dark_mode" : "light_mode";
  localStorage.setItem("theme", isLight ? "light" : "dark");
 };
 if(localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  document.getElementById("themeIcon").textContent = "dark_mode";
 }

 async function init() {
  try {
   const res = await fetch("countries.json");
   const data = await res.json();
   
   const entries = Object.entries(data);
   const validItems = [];

   for (let [file, name] of entries) {
    const check = await fetch(`countries/${file}.txt`, { method: 'HEAD' });
    if (check.ok) validItems.push({ file, name });
   }

   validItems.sort((a, b) => {
    const cleanA = a.name.replace(/[^\w\sа-яё]/gi, '').trim();
    const cleanB = b.name.replace(/[^\w\sа-яё]/gi, '').trim();
    return cleanA.localeCompare(cleanB);
   });

   renderChips(validItems);
  } catch (e) {
   proxyGrid.innerHTML = "Ошибка: countries.json не найден.";
  }
 }

 function renderChips(items) {
  countrySelector.innerHTML = "";
  items.forEach(item => {
   const btn = document.createElement("button");
   btn.className = "chip";
   btn.textContent = item.name;
   btn.onclick = () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    loadProxies(item.file);
   };
   countrySelector.appendChild(btn);
  });
 }

 async function loadProxies(file) {
  proxyGrid.innerHTML = "Загрузка...";
  try {
   const res = await fetch(`countries/${file}.txt`);
   const text = await res.text();
   
   const lines = text.split("\n").filter(l => l.includes("server="));
   
   proxyGrid.innerHTML = lines.length ? "" : "В этом файле нет прокси.";

   lines.forEach(line => {
    const cleanLine = line.trim();
    const tgLink = cleanLine.replace(/^https:\/\/t\.me\/proxy\?/, "tg://proxy?");
    
    const params = new URLSearchParams(tgLink.split('?')[1]);
    const ip = params.get("server") || "Unknown";
    const port = params.get("port") || "";

    const card = document.createElement("a");
    card.href = tgLink;
    card.className = "proxy-card";
    card.innerHTML = `
     <div>
      <span class="ip-text">${ip}</span>
      <span class="port-text">Port: ${port}</span>
     </div>
     <span class="material-symbols-outlined">bolt</span>
    `;
    proxyGrid.appendChild(card);
   });
  } catch (e) {
   proxyGrid.innerHTML = "Ошибка загрузки списка прокси.";
  }
 }

 init();
});