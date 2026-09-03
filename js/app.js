const ENDPOINT_LEILOES = "/api/leiloes";

const state = {
  leiloes: [],
  leilaoAtivo: null,
  lances: [],
};

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const statusLabel = { "ao-vivo": "Ao vivo agora", agendado: "Agendado", encerrado: "Encerrado" };

async function fetchLeiloes() {
  const res = await fetch(ENDPOINT_LEILOES);
  if (!res.ok) throw new Error(`Falha ao buscar leilões (${res.status})`);
  return res.json();
}

async function fetchLances() {
  const res = await fetch("data/lances.json");
  if (!res.ok) return [];
  return res.json();
}

function renderCatalogo() {
  const list = document.getElementById("catalogo-list");
  if (!state.leiloes.length) {
    list.innerHTML = `<p class="empty">Nenhum leilão disponível no momento.</p>`;
    return;
  }
  list.innerHTML = state.leiloes
    .map(
      (l) => `
    <div class="lote-row" data-id="${l.id}">
      <div class="lote-numero">Lote ${l.lote}</div>
      <div class="lote-imagem">${l.imagem}</div>
      <div class="lote-info">
        <p class="titulo">${l.titulo}</p>
        <p class="meta">${l.categoria} · ${l.vendedor} · ${l.horario}</p>
      </div>
      <div class="lote-valor">
        <p class="label">Lance atual</p>
        <p class="valor">${fmt(l.lanceAtual)}</p>
      </div>
      <span class="status-pill ${l.status}">${statusLabel[l.status]}</span>
    </div>`
    )
    .join("");

  list.querySelectorAll(".lote-row").forEach((row) => {
    row.addEventListener("click", () => {
      const id = Number(row.dataset.id);
      abrirLeilao(id);
    });
  });
}

async function abrirLeilao(id) {
  state.leilaoAtivo = state.leiloes.find((l) => l.id === id);
  state.lances = id === 1 ? await fetchLances() : [];
  goTo("live");
  renderLive();
}

function renderLive() {
  const l = state.leilaoAtivo;
  const container = document.getElementById("live-view");
  if (!l) {
    container.innerHTML = `<p class="empty">Selecione um leilão no catálogo.</p>`;
    return;
  }

  const aoVivo = l.status === "ao-vivo";

  container.innerHTML = `
    <a class="back-link" id="back-to-catalog">&larr; Voltar ao catálogo</a>
    <div class="live-layout">
      <div class="stage">
        <div class="stage-media">
          ${aoVivo ? `<div class="live-badge"><span class="dot"></span>ao vivo</div>` : ""}
          ${aoVivo ? `<div class="viewers">${l.espectadores} assistindo</div>` : ""}
          <span>${l.imagem}</span>
        </div>
        <div class="stage-details">
          <p class="titulo">Lote ${l.lote} · ${l.titulo}</p>
          <p class="meta">${l.categoria} · vendido por ${l.vendedor} · ${l.horario}</p>
        </div>
      </div>

      <div class="bid-panel">
        <div class="bid-current">
          <p class="label">Lance atual</p>
          <p class="valor" id="valor-atual">${fmt(l.lanceAtual)}</p>
          <p class="incremento">Incremento mínimo: ${fmt(l.incrementoMinimo)}</p>
        </div>

        ${
          aoVivo
            ? `<form class="bid-form" id="bid-form">
                <input type="number" id="bid-input" placeholder="${l.lanceAtual + l.incrementoMinimo}" />
                <button type="submit">Dar lance</button>
              </form>
              <p class="bid-error" id="bid-error" style="display:none"></p>`
            : `<p class="incremento" style="margin-top:16px">${
                l.status === "agendado" ? "Transmissão ainda não iniciada." : "Este leilão já foi encerrado."
              }</p>`
        }

        <div class="bid-history">
          <h3>Histórico de lances</h3>
          <ul id="bid-history-list">
            ${
              state.lances.length
                ? state.lances
                    .map(
                      (b) => `<li><span class="u">${b.usuario}</span><span class="v">${fmt(b.valor)}</span><span class="t">${b.horario}</span></li>`
                    )
                    .join("")
                : `<li class="t">Sem lances registrados ainda.</li>`
            }
          </ul>
        </div>
      </div>
    </div>
  `;

  document.getElementById("back-to-catalog").addEventListener("click", () => goTo("catalogo"));

  if (aoVivo) {
    document.getElementById("bid-form").addEventListener("submit", (e) => {
      e.preventDefault();
      darLance();
    });
  }
}

function darLance() {
  const l = state.leilaoAtivo;
  const input = document.getElementById("bid-input");
  const errorEl = document.getElementById("bid-error");
  const valor = Number(input.value);
  const minimo = l.lanceAtual + l.incrementoMinimo;

  if (!valor || valor < minimo) {
    errorEl.textContent = `Informe um valor de pelo menos ${fmt(minimo)}.`;
    errorEl.style.display = "block";
    return;
  }
  errorEl.style.display = "none";

  const agora = new Date();
  const horario = agora.toLocaleTimeString("pt-BR", { hour12: false });

  l.lanceAtual = valor;
  state.lances.unshift({ usuario: "Você", valor, horario });

  document.getElementById("valor-atual").textContent = fmt(valor);
  document.getElementById("bid-history-list").innerHTML = state.lances
    .map(
      (b) => `<li><span class="u">${b.usuario}</span><span class="v">${fmt(b.valor)}</span><span class="t">${b.horario}</span></li>`
    )
    .join("");
  input.value = "";
}

function goTo(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.remove("active"));
  document.getElementById(`view-${view === "live" ? "live" : "catalogo"}`).classList.add("active");
  document.getElementById(`tab-${view === "live" ? "live" : "catalogo"}`).classList.add("active");
}

async function init() {
  document.getElementById("tab-catalogo").addEventListener("click", () => goTo("catalogo"));
  document.getElementById("tab-live").addEventListener("click", () => {
    if (!state.leilaoAtivo && state.leiloes.length) abrirLeilao(state.leiloes[0].id);
    else goTo("live");
  });

  try {
    state.leiloes = await fetchLeiloes();
    renderCatalogo();
  } catch (err) {
    document.getElementById("catalogo-list").innerHTML =
      `<p class="empty">Não foi possível carregar os leilões (${err.message}). Verifique o endpoint configurado em AZURE_FUNCTION_BASE_URL.</p>`;
  }
}

init();
