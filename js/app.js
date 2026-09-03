const ENDPOINT_LEILOES = "/api/leiloes";

const state = {
  leiloes: [],
  leilaoAtivo: null,
  formAberto: false,
};

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const statusLabel = { "ao-vivo": "Ao vivo agora", agendado: "Agendado", encerrado: "Encerrado" };

// ---------- chamadas às Azure Functions ----------

async function apiListarLeiloes() {
  const res = await fetch(ENDPOINT_LEILOES);
  if (!res.ok) throw new Error(`Falha ao buscar leilões (${res.status})`);
  return res.json();
}

async function apiCriarLeilao(dados) {
  const res = await fetch(ENDPOINT_LEILOES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.erro || `Falha ao criar leilão (${res.status})`);
  return body;
}

async function apiAtualizarLance(id, lanceAtual) {
  const res = await fetch(`${ENDPOINT_LEILOES}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lanceAtual }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.erro || `Falha ao dar lance (${res.status})`);
  return body;
}

async function apiAtualizarStatus(id, status) {
  const res = await fetch(`${ENDPOINT_LEILOES}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.erro || `Falha ao atualizar status (${res.status})`);
  return body;
}

async function apiExcluirLeilao(id) {
  const res = await fetch(`${ENDPOINT_LEILOES}/${id}`, { method: "DELETE" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.erro || `Falha ao excluir leilão (${res.status})`);
  return body;
}

// ---------- catálogo ----------

async function carregarCatalogo() {
  state.leiloes = await apiListarLeiloes();
  renderCatalogo();
}

function renderCatalogo() {
  renderFormNovoLeilao();

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
      <select class="status-select ${l.status}" data-id="${l.id}">
        <option value="ao-vivo" ${l.status === "ao-vivo" ? "selected" : ""}>Ao vivo agora</option>
        <option value="agendado" ${l.status === "agendado" ? "selected" : ""}>Agendado</option>
        <option value="encerrado" ${l.status === "encerrado" ? "selected" : ""}>Encerrado</option>
      </select>
      <button class="btn-excluir" data-id="${l.id}" title="Excluir leilão">✕</button>
    </div>`
    )
    .join("");

  list.querySelectorAll(".lote-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".btn-excluir") || e.target.closest(".status-select")) return;
      abrirLeilao(Number(row.dataset.id));
    });
  });

  list.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("click", (e) => e.stopPropagation());
    select.addEventListener("change", async (e) => {
      const id = Number(select.dataset.id);
      const novoStatus = select.value;
      try {
        await apiAtualizarStatus(id, novoStatus);
        await carregarCatalogo();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  list.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (!confirm(`Excluir o lote ${id}? Essa ação não pode ser desfeita.`)) return;
      try {
        await apiExcluirLeilao(id);
        await carregarCatalogo();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

function renderFormNovoLeilao() {
  const container = document.getElementById("novo-leilao-container");

  if (!state.formAberto) {
    container.innerHTML = `<button class="btn-novo" id="btn-abrir-form">+ Novo leilão</button>`;
    document.getElementById("btn-abrir-form").addEventListener("click", () => {
      state.formAberto = true;
      renderFormNovoLeilao();
    });
    return;
  }

  container.innerHTML = `
    <form class="novo-leilao-form" id="novo-leilao-form">
      <div class="grid-2">
        <input name="lote" placeholder="Nº do lote (ex: 005)" required />
        <input name="categoria" placeholder="Categoria" required />
      </div>
      <input name="titulo" placeholder="Título do item" required />
      <input name="vendedor" placeholder="Vendedor" required />
      <div class="grid-2">
        <input name="lanceInicial" type="number" placeholder="Lance inicial (R$)" required />
        <input name="incrementoMinimo" type="number" placeholder="Incremento mínimo (R$)" required />
      </div>
      <input name="horario" placeholder="Horário (ex: Hoje, 21:00)" required />
      <div class="form-actions">
        <button type="button" class="btn-cancelar" id="btn-cancelar-form">Cancelar</button>
        <button type="submit" class="btn-salvar">Salvar leilão</button>
      </div>
      <p class="form-error" id="novo-leilao-error" style="display:none"></p>
    </form>
  `;

  document.getElementById("btn-cancelar-form").addEventListener("click", () => {
    state.formAberto = false;
    renderFormNovoLeilao();
  });

  document.getElementById("novo-leilao-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const dados = Object.fromEntries(new FormData(form).entries());
    const errorEl = document.getElementById("novo-leilao-error");
    try {
      await apiCriarLeilao(dados);
      state.formAberto = false;
      await carregarCatalogo();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    }
  });
}

// ---------- leilão ao vivo ----------

async function abrirLeilao(id) {
  state.leilaoAtivo = state.leiloes.find((l) => l.id === id);
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
                <button type="submit" id="bid-submit">Dar lance</button>
              </form>
              <p class="bid-error" id="bid-error" style="display:none"></p>`
            : `<p class="incremento" style="margin-top:16px">${
                l.status === "agendado" ? "Transmissão ainda não iniciada." : "Este leilão já foi encerrado."
              }</p>`
        }
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

async function darLance() {
  const l = state.leilaoAtivo;
  const input = document.getElementById("bid-input");
  const errorEl = document.getElementById("bid-error");
  const submitBtn = document.getElementById("bid-submit");
  const valor = Number(input.value);

  errorEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const atualizado = await apiAtualizarLance(l.id, valor);
    state.leilaoAtivo = atualizado;

    const idx = state.leiloes.findIndex((x) => x.id === atualizado.id);
    if (idx !== -1) state.leiloes[idx] = atualizado;

    document.getElementById("valor-atual").textContent = fmt(atualizado.lanceAtual);
    input.value = "";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Dar lance";
  }
}

// ---------- navegação ----------

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
    await carregarCatalogo();
  } catch (err) {
    document.getElementById("catalogo-list").innerHTML =
      `<p class="empty">Não foi possível carregar os leilões (${err.message}).</p>`;
  }
}

init();