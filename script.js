// Utilidades de armazenamento
const STORAGE_KEYS = {
  CONTAS: "financas_contas",
  CATEGORIAS: "financas_categorias",
  LANCAMENTOS: "financas_lancamentos"
};

function carregar(key, padrao) {
  const raw = localStorage.getItem(key);
  if (!raw) return padrao;
  try {
    return JSON.parse(raw);
  } catch {
    return padrao;
  }
}

function salvar(key, valor) {
  localStorage.setItem(key, JSON.stringify(valor));
}

// Estado em memória
let contas = carregar(STORAGE_KEYS.CONTAS, []);
let categorias = carregar(STORAGE_KEYS.CATEGORIAS, []);
let lancamentos = carregar(STORAGE_KEYS.LANCAMENTOS, []);

// Se não houver nada, cria alguns padrões
if (contas.length === 0) {
  contas = [
    { id: Date.now(), nome: "Bradesco" },
    { id: Date.now() + 1, nome: "Banco do Brasil" }
  ];
  salvar(STORAGE_KEYS.CONTAS, contas);
}

if (categorias.length === 0) {
  categorias = [
    { id: 1, nome: "Alimentação" },
    { id: 2, nome: "Transporte" },
    { id: 3, nome: "Moradia" },
    { id: 4, nome: "Lazer" },
    { id: 5, nome: "Salário" },
    { id: 6, nome: "Outro" }
  ];
  salvar(STORAGE_KEYS.CATEGORIAS, categorias);
}

// Formatação de moeda
function formatarBRL(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}

// Helpers de datas
function obterAnoMes(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const editIdInput = document.getElementById('editIdInput') || document.createElement('input');
editIdInput.type

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function hojeAnoMes() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

// Elementos da interface
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// Dashboard
const dashMesInput = document.getElementById("dashMes");
const dashReceitas = document.getElementById("dashReceitas");
const dashDespesas = document.getElementById("dashDespesas");
const dashSaldo = document.getElementById("dashSaldo");
const listaSaldoContas = document.getElementById("listaSaldoContas");

// Lançamentos
const formLancamento = document.getElementById("formLancamento");
const contaSelect = document.getElementById("contaSelect");
const categoriaSelect = document.getElementById("categoriaSelect");
const descricaoInput = document.getElementById("descricaoInput");
const valorInput = document.getElementById("valorInput");
const dataInput = document.getElementById("dataInput");
const listaMesInput = document.getElementById("listaMes");
const listaLancamentos = document.getElementById("listaLancamentos");

// Contas
const formConta = document.getElementById("formConta");
const nomeContaInput = document.getElementById("nomeContaInput");
const listaContas = document.getElementById("listaContas");

// Categorias
const formCategoria = document.getElementById("formCategoria");
const nomeCategoriaInput = document.getElementById("nomeCategoriaInput");
const listaCategorias = document.getElementById("listaCategorias");

// Relatórios
const relMesInput = document.getElementById("relMes");
const relResumoMes = document.getElementById("relResumoMes");
const relPorCategoria = document.getElementById("relPorCategoria");

// Tabs
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.add("active");

    // Atualiza dados quando troca de aba
    if (tabId === "dashboard") atualizarDashboard();
    if (tabId === "lancamentos") atualizarListaLancamentos();
    if (tabId === "contas") renderizarContas();
    if (tabId === "categorias") renderizarCategorias();
    if (tabId === "relatorios") atualizarRelatorios();
  });
});

// Inicialização de inputs de mês/data
const anoMesAtual = hojeAnoMes();
if (dashMesInput) dashMesInput.value = anoMesAtual;
if (listaMesInput) listaMesInput.value = anoMesAtual;
if (relMesInput) relMesInput.value = anoMesAtual;
if (dataInput) dataInput.valueAsNumber = Date.now() - (new Date().getTimezoneOffset() * 60000);

// Renderização de contas e categorias em selects e listas
function renderizarContas() {
  // Lista
  listaContas.innerHTML = "";
  contas.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${c.nome}</span>
      </div>
      <button class="btn-small" data-id="${c.id}">Remover</button>
    `;
    listaContas.appendChild(li);
  });

  // Listener de remoção
  listaContas.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const temLancamento = lancamentos.some(l => l.contaId === id);
      if (temLancamento) {
        alert("Não é possível remover uma conta que já possui lançamentos.");
        return;
      }
      contas = contas.filter(c => c.id !== id);
      salvar(STORAGE_KEYS.CONTAS, contas);
      renderizarContas();
      preencherSelects();
      atualizarTudo();
    });
  });

  preencherSelects();
}

function renderizarCategorias() {
  listaCategorias.innerHTML = "";
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${cat.nome}</span>
      </div>
      <button class="btn-small" data-id="${cat.id}">Remover</button>
    `;
    listaCategorias.appendChild(li);
  });

  listaCategorias.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const temLancamento = lancamentos.some(l => l.categoriaId === id);
      if (temLancamento) {
        alert("Não é possível remover uma categoria que já possui lançamentos.");
        return;
      }
      categorias = categorias.filter(cat => cat.id !== id);
      salvar(STORAGE_KEYS.CATEGORIAS, categorias);
      renderizarCategorias();
      preencherSelects();
      atualizarTudo();
    });
  });

  preencherSelects();
}

function preencherSelects() {
  // Contas
  contaSelect.innerHTML = "";
  contas.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    contaSelect.appendChild(opt);
  });

  // Categorias
  categoriaSelect.innerHTML = "";
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.nome;
    categoriaSelect.appendChild(opt);
  });
}

// Cadastro de contas
formConta.addEventListener("submit", e => {
  e.preventDefault();
  const nome = nomeContaInput.value.trim();
  if (!nome) return;
  contas.push({ id: Date.now(), nome });
  salvar(STORAGE_KEYS.CONTAS, contas);
  nomeContaInput.value = "";
  renderizarContas();
  atualizarTudo();
});

// Cadastro de categorias
formCategoria.addEventListener("submit", e => {
  e.preventDefault();
  const nome = nomeCategoriaInput.value.trim();
  if (!nome) return;
  categorias.push({ id: Date.now(), nome });
  salvar(STORAGE_KEYS.CATEGORIAS, categorias);
  nomeCategoriaInput.value = "";
  renderizarCategorias();
  atualizarTudo();
});

// Cadastro de lançamento
formLancamento.addEventListener("submit", e => {
  e.preventDefault();
  const tipo = formLancamento.tipo.value; // receita ou despesa
  const contaId = Number(contaSelect.value);
  const categoriaId = Number(categoriaSelect.value);
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const data = dataInput.value;

  if (!contaId || !categoriaId || !data || isNaN(valor) || valor <= 0) {
    alert("Preencha todos os campos obrigatórios com valores válidos.");
    return;
  }

  const novo = {
    id: Date.now(),
    tipo,
    contaId,
    categoriaId,
    descricao,
    valor,
    data
  };

  lancamentos.push(novo);
  salvar(STORAGE_KEYS.LANCAMENTOS, lancamentos);

  descricaoInput.value = "";
  valorInput.value = "";
  dataInput.valueAsNumber = Date.now() - (new Date().getTimezoneOffset() * 60000);

  atualizarTudo();
});

// Filtro de mês
[dashMesInput, listaMesInput, relMesInput].forEach(input => {
  if (!input) return;
  input.addEventListener("change", () => {
    atualizarTudo();
  });
});

// Atualizações globais
function atualizarTudo() {
  atualizarDashboard();
  atualizarListaLancamentos();
  atualizarRelatorios();
}

// DASHBOARD
function atualizarDashboard() {
  const anoMes = dashMesInput.value || hojeAnoMes();
  const doMes = lancamentos.filter(l => obterAnoMes(l.data) === anoMes);

  let totalReceitas = 0;
  let totalDespesas = 0;

  doMes.forEach(l => {
    if (l.tipo === "receita") totalReceitas += l.valor;
    else totalDespesas += l.valor;
  });

  const saldo = totalReceitas - totalDespesas;

  dashReceitas.textContent = formatarBRL(totalReceitas);
  dashDespesas.textContent = formatarBRL(totalDespesas);
  dashSaldo.textContent = formatarBRL(saldo);

  // Saldo por conta (considerando todos os lançamentos até o fim do mês)
  listaSaldoContas.innerHTML = "";
  contas.forEach(c => {
    let saldoConta = 0;
    lancamentos.forEach(l => {
      if (l.contaId === c.id && obterAnoMes(l.data) === anoMes) {
        saldoConta += l.tipo === "receita" ? l.valor : -l.valor;
      }
    });
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${c.nome}</span>
      </div>
      <span class="amount">${formatarBRL(saldoConta)}</span>
    `;
    listaSaldoContas.appendChild(li);
  });
}

// LISTA DE LANÇAMENTOS
function atualizarListaLancamentos() {
  const anoMes = listaMesInput.value || hojeAnoMes();
  const doMes = lancamentos
    .filter(l => obterAnoMes(l.data) === anoMes)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  listaLancamentos.innerHTML = "";
  if (doMes.length === 0) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="main">Nenhum lançamento neste mês.</span>`;
    listaLancamentos.appendChild(li);
    return;
  }

  doMes.forEach(l => {
    const conta = contas.find(c => c.id === l.contaId);
    const categoria = categorias.find(cat => cat.id === l.categoriaId);
    const dataPt = new Date(l.data).toLocaleDateString("pt-BR");

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${l.descricao || "(Sem descrição)"}</span>
        <span class="sub">
          ${dataPt} • ${conta ? conta.nome : "Conta"} • ${categoria ? categoria.nome : "Categoria"} • ${l.tipo === "receita" ? "Receita" : "Despesa"}
        </span>
      </div>
      <span class="amount" style="color:${l.tipo === "receita" ? "#22c55e" : "#ef4444"}">
        ${l.tipo === "receita" ? "+" : "-"} ${formatarBRL(l.valor)}
      </span>
    `;
    listaLancamentos.appendChild(li);
  });
}

// RELATÓRIOS
function atualizarRelatorios() {
  const anoMes = relMesInput.value || hojeAnoMes();
  const doMes = lancamentos.filter(l => obterAnoMes(l.data) === anoMes);

  // Resumo do mês
  let totalReceitas = 0;
  let totalDespesas = 0;
  const porConta = {};

  doMes.forEach(l => {
    if (l.tipo === "receita") totalReceitas += l.valor;
    else totalDespesas += l.valor;

    if (!porConta[l.contaId]) porConta[l.contaId] = 0;
    porConta[l.contaId] += l.tipo === "receita" ? l.valor : -l.valor;
  });

  const saldo = totalReceitas - totalDespesas;

  relResumoMes.innerHTML = "";

  const liTotais = document.createElement("li");
  liTotais.innerHTML = `
    <div>
      <span class="main">Totais do mês</span>
      <span class="sub">Receitas, despesas e saldo geral</span>
    </div>
    <div style="text-align:right;font-size:0.7rem;">
      <div style="color:#22c55e;">R: ${formatarBRL(totalReceitas)}</div>
      <div style="color:#ef4444;">D: ${formatarBRL(totalDespesas)}</div>
      <div style="color:${saldo >= 0 ? "#22c55e" : "#ef4444"};">S: ${formatarBRL(saldo)}</div>
    </div>
  `;
  relResumoMes.appendChild(liTotais);

  Object.keys(porConta).forEach(contaIdStr => {
    const contaId = Number(contaIdStr);
    const conta = contas.find(c => c.id === contaId);
    const val = porConta[contaId];
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${conta ? conta.nome : "Conta"}</span>
        <span class="sub">Saldo no período</span>
      </div>
      <span class="amount" style="color:${val >= 0 ? "#22c55e" : "#ef4444"};">
        ${formatarBRL(val)}
      </span>
    `;
    relResumoMes.appendChild(li);
  });

  // Relatório por categoria (apenas despesas)
  relPorCategoria.innerHTML = "";
  const despesas = doMes.filter(l => l.tipo === "despesa");
  if (despesas.length === 0) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="main">Nenhuma despesa neste mês.</span>`;
    relPorCategoria.appendChild(li);
    return;
  }

  const somaPorCategoria = {};
  let totalDespesasMes = 0;

  despesas.forEach(l => {
    if (!somaPorCategoria[l.categoriaId]) somaPorCategoria[l.categoriaId] = 0;
    somaPorCategoria[l.categoriaId] += l.valor;
    totalDespesasMes += l.valor;
  });

  Object.keys(somaPorCategoria).forEach(catIdStr => {
    const catId = Number(catIdStr);
    const cat = categorias.find(c => c.id === catId);
    const valor = somaPorCategoria[catId];
    const perc = totalDespesasMes > 0 ? (valor / totalDespesasMes) * 100 : 0;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="main">${cat ? cat.nome : "Categoria"}</span>
        <span class="sub">${perc.toFixed(1)}% das despesas do mês</span>
      </div>
      <span class="amount">${formatarBRL(valor)}</span>
    `;
    relPorCategoria.appendChild(li);
  });
}

// Inicialização
renderizarContas();
renderizarCategorias();
atualizarTudo();
