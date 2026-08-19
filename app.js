/* =========================================================
   MEU CONTROLE FINANCEIRO
   app.js - versão completa
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CHAVE_DADOS = "meuControleFinanceiro";
const CHAVE_TEMA = "temaFinanceiro";


const CATEGORIAS = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Contas",
    "Cartão",
    "Investimentos",
    "Salário",
    "Outros"
];


let dados = {
    lancamentos: [],
    contas: [],
    metas: []
};


let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();


let editandoLancamento = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const saldoAtual = document.getElementById("saldoAtual");
const totalEntradas = document.getElementById("totalEntradas");
const totalGastos = document.getElementById("totalGastos");

const resumoEntradas = document.getElementById("resumoEntradas");
const resumoDespesas = document.getElementById("resumoDespesas");
const resumoPendentes = document.getElementById("resumoPendentes");
const resumoEconomia = document.getElementById("resumoEconomia");

const mesSelecionado = document.getElementById("mesSelecionado");

const listaLancamentos =
    document.getElementById("listaLancamentos");

const graficoCategorias =
    document.getElementById("graficoCategorias");

const listaContas =
    document.getElementById("listaContas");

const listaMetas =
    document.getElementById("listaMetas");


/* =========================================================
   MODAIS
========================================================= */

const modalTransacao =
    document.getElementById("modalTransacao");

const modalConta =
    document.getElementById("modalConta");

const modalMeta =
    document.getElementById("modalMeta");

const modalDetalhes =
    document.getElementById("modalDetalhes");


/* =========================================================
   FORMULÁRIOS
========================================================= */

const formTransacao =
    document.getElementById("formTransacao");

const formConta =
    document.getElementById("formConta");

const formMeta =
    document.getElementById("formMeta");


/* =========================================================
   FUNÇÕES DE DATA
========================================================= */

/*
   IMPORTANTE:
   Esta função evita o problema de o celular salvar
   a data como sendo o dia seguinte.
*/

function dataLocalISO() {

    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function obterMesAno(data) {

    if (!data) {
        return null;
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return null;
    }

    return {
        ano: Number(partes[0]),
        mes: Number(partes[1]) - 1
    };
}


/* =========================================================
   FORMATAÇÃO DE VALORES
========================================================= */

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


/* =========================================================
   SALVAR DADOS
========================================================= */

function salvarDados() {

    localStorage.setItem(
        CHAVE_DADOS,
        JSON.stringify(dados)
    );
}


/* =========================================================
   CARREGAR DADOS
========================================================= */

function carregarDados() {

    const dadosSalvos =
        localStorage.getItem(CHAVE_DADOS);

    if (dadosSalvos) {

        try {

            const dadosConvertidos =
                JSON.parse(dadosSalvos);

            dados = {
                lancamentos:
                    Array.isArray(
                        dadosConvertidos.lancamentos
                    )
                        ? dadosConvertidos.lancamentos
                        : [],

                contas:
                    Array.isArray(
                        dadosConvertidos.contas
                    )
                        ? dadosConvertidos.contas
                        : [],

                metas:
                    Array.isArray(
                        dadosConvertidos.metas
                    )
                        ? dadosConvertidos.metas
                        : []
            };

        } catch (erro) {

            console.error(
                "Erro ao carregar dados:",
                erro
            );

            dados = {
                lancamentos: [],
                contas: [],
                metas: []
            };
        }
    }
}


/* =========================================================
   ID ÚNICO
========================================================= */

function gerarId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8);
}


/* =========================================================
   TELA DE MÊS
========================================================= */

function atualizarMes() {

    const data = new Date(
        anoAtual,
        mesAtual,
        1
    );

    const nomeMes =
        data.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

    mesSelecionado.textContent =
        nomeMes.charAt(0).toUpperCase() +
        nomeMes.slice(1);
}


/* =========================================================
   FILTRAR LANÇAMENTOS DO MÊS
========================================================= */

function lancamentosDoMes() {

    return dados.lancamentos.filter(
        lancamento => {

            const info =
                obterMesAno(lancamento.data);

            if (!info) {
                return false;
            }

            return (
                info.mes === mesAtual &&
                info.ano === anoAtual
            );
        }
    );
}


/* =========================================================
   CALCULAR RESUMOS
========================================================= */

function atualizarResumo() {

    const lista =
        lancamentosDoMes();


    let entradas = 0;
    let despesas = 0;


    lista.forEach(lancamento => {

        const valor =
            Number(lancamento.valor) || 0;

        if (lancamento.tipo === "entrada") {

            entradas += valor;

        } else {

            despesas += valor;
        }
    });


    const saldo = entradas - despesas;


    saldoAtual.textContent =
        formatarMoeda(saldo);

    totalEntradas.textContent =
        formatarMoeda(entradas);

    totalGastos.textContent =
        formatarMoeda(despesas);


    resumoEntradas.textContent =
        formatarMoeda(entradas);

    resumoDespesas.textContent =
        formatarMoeda(despesas);


    const contasPendentes =
        dados.contas
            .filter(conta => {

                const info =
                    obterMesAno(
                        conta.vencimento
                    );

                return (
                    info &&
                    info.mes === mesAtual &&
                    info.ano === anoAtual &&
                    conta.paga !== true
                );
            })
            .reduce(
                (total, conta) =>
                    total +
                    Number(conta.valor || 0),
                0
            );


    resumoPendentes.textContent =
        formatarMoeda(contasPendentes);


    const economia =
        entradas - despesas;


    resumoEconomia.textContent =
        formatarMoeda(economia);
}


/* =========================================================
   LISTAR LANÇAMENTOS
========================================================= */

function listarLancamentos() {

    const lista =
        lancamentosDoMes()
            .sort(
                (a, b) =>
                    b.data.localeCompare(a.data)
            );


    if (lista.length === 0) {

        listaLancamentos.innerHTML = `

            <div class="estado-vazio">

                <div class="estado-icone">
                    💰
                </div>

                <h3>
                    Nenhum lançamento
                </h3>

                <p>
                    Adicione sua primeira
                    entrada ou despesa.
                </p>

            </div>

        `;

        return;
    }


    listaLancamentos.innerHTML =
        lista
            .slice(0, 10)
            .map(criarLancamentoHTML)
            .join("");
}


/* =========================================================
   HTML DE LANÇAMENTO
========================================================= */

function criarLancamentoHTML(lancamento) {

    const entrada =
        lancamento.tipo === "entrada";


    const sinal =
        entrada ? "+" : "-";


    const classe =
        entrada ? "entrada" : "saida";


    const icone =
        entrada ? "💰" : obterIconeCategoria(
            lancamento.categoria
        );


    return `

        <div
            class="lancamento ${classe}"
            data-id="${lancamento.id}"
        >

            <div class="lancamento-icone">
                ${icone}
            </div>


            <div class="lancamento-info">

                <strong>
                    ${escaparHTML(
                        lancamento.descricao
                    )}
                </strong>

                <small>
                    ${formatarData(
                        lancamento.data
                    )}
                    •
                    ${escaparHTML(
                        lancamento.categoria || "Outros"
                    )}
                </small>

            </div>


            <div class="lancamento-valor">

                <strong>
                    ${sinal}
                    ${formatarMoeda(
                        lancamento.valor
                    )}
                </strong>

                <small>
                    ${escaparHTML(
                        lancamento.pagamento || ""
                    )}
                </small>

            </div>


            <div class="lancamento-acoes">

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarLancamento('${lancamento.id}')"
                    title="Editar"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirLancamento('${lancamento.id}')"
                    title="Excluir"
                >
                    🗑️
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   ÍCONES POR CATEGORIA
========================================================= */

function obterIconeCategoria(categoria) {

    const icones = {

        "Alimentação": "🍔",
        "Moradia": "🏠",
        "Transporte": "🚗",
        "Saúde": "💊",
        "Educação": "📚",
        "Lazer": "🎮",
        "Compras": "🛒",
        "Contas": "📄",
        "Cartão": "💳",
        "Investimentos": "📈",
        "Salário": "💰",
        "Outros": "📌"
    };


    return icones[categoria] || "📌";
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GRÁFICO POR CATEGORIA
========================================================= */

function atualizarGrafico() {

    const lista =
        lancamentosDoMes()
            .filter(
                item =>
                    item.tipo === "saida"
            );


    if (lista.length === 0) {

        graficoCategorias.innerHTML = `

            <div class="grafico-vazio">

                <span>
                    📊
                </span>

                <p>
                    Ainda não existem gastos
                    neste mês.
                </p>

            </div>

        `;

        return;
    }


    const categorias = {};


    lista.forEach(item => {

        const categoria =
            item.categoria || "Outros";


        categorias[categoria] =
            (
                categorias[categoria] || 0
            ) +
            Number(item.valor || 0);
    });


    const valores =
        Object.entries(categorias)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    const maiorValor =
        valores[0][1];


    graficoCategorias.innerHTML =
        valores
            .map(
                ([categoria, valor]) => {

                    const percentual =
                        maiorValor > 0
                            ? (
                                valor /
                                maiorValor
                            ) * 100
                            : 0;


                    return `

                        <div class="barra-categoria">

                            <div class="barra-info">

                                <span class="barra-nome">
                                    ${obterIconeCategoria(categoria)}
                                    ${escaparHTML(categoria)}
                                </span>

                                <span class="barra-valor">
                                    ${formatarMoeda(valor)}
                                </span>

                            </div>


                            <div class="barra-fundo">

                                <div
                                    class="barra-preenchimento"
                                    style="width:${percentual}%"
                                ></div>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


/* =========================================================
   CATEGORIAS DO FORMULÁRIO
========================================================= */

function carregarCategorias() {

    const select =
        document.getElementById("categoria");


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Selecione uma categoria
        </option>

    `;


    CATEGORIAS.forEach(categoria => {

        const option =
            document.createElement("option");

        option.value = categoria;

        option.textContent = categoria;

        select.appendChild(option);
    });
}


/* =========================================================
   ABRIR LANÇAMENTO
========================================================= */

function abrirModalTransacao(tipo = "saida") {

    editandoLancamento = null;


    formTransacao.reset();


    document.querySelector(
        `input[name="tipo"][value="${tipo}"]`
    ).checked = true;


    document.getElementById(
        "data"
    ).value = dataLocalISO();


    document.getElementById(
        "tituloModalTransacao"
    ).textContent =
        tipo === "entrada"
            ? "Nova entrada"
            : "Novo gasto";


    modalTransacao.classList.add("aberto");
}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal(modal) {

    if (modal) {

        modal.classList.remove(
            "aberto"
        );
    }
}


/* =========================================================
   EVENTO - TIPO DE LANÇAMENTO
========================================================= */

document
    .querySelectorAll(
        'input[name="tipo"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            () => {

                document.getElementById(
                    "tituloModalTransacao"
                ).textContent =
                    input.value === "entrada"
                        ? "Nova entrada"
                        : "Novo gasto";
            }
        );
    });


/* =========================================================
   SALVAR LANÇAMENTO
========================================================= */

formTransacao.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const tipo =
            document.querySelector(
                'input[name="tipo"]:checked'
            ).value;


        const descricao =
            document.getElementById(
                "descricao"
            ).value.trim();


        const valor =
            Number(
                document.getElementById(
                    "valor"
                ).value
            );


        const data =
            document.getElementById(
                "data"
            ).value;


        const categoria =
            document.getElementById(
                "categoria"
            ).value;


        const pagamento =
            document.getElementById(
                "pagamento"
            ).value;


        const observacao =
            document.getElementById(
                "observacao"
            ).value.trim();


        if (
            !descricao ||
            !valor ||
            !data ||
            !categoria
        ) {

            mostrarToast(
                "Preencha todos os campos obrigatórios.",
                "⚠️"
            );

            return;
        }


        if (editandoLancamento) {

            const index =
                dados.lancamentos.findIndex(
                    item =>
                        item.id ===
                        editandoLancamento
                );


            if (index !== -1) {

                dados.lancamentos[index] = {

                    ...dados.lancamentos[index],

                    tipo,
                    descricao,
                    valor,
                    data,
                    categoria,
                    pagamento,
                    observacao
                };
            }

        } else {

            dados.lancamentos.push({

                id: gerarId(),

                tipo,

                descricao,

                valor,

                data,

                categoria,

                pagamento,

                observacao,

                criadoEm:
                    new Date().toISOString()
            });
        }


        salvarDados();

        fecharModal(modalTransacao);

        atualizarTudo();


        mostrarToast(
            editandoLancamento
                ? "Lançamento atualizado!"
                : "Lançamento salvo!",
            "✓"
        );


        editandoLancamento = null;
    }
);


/* =========================================================
   EDITAR LANÇAMENTO
========================================================= */

function editarLancamento(id) {

    const lancamento =
        dados.lancamentos.find(
            item =>
                item.id === id
        );


    if (!lancamento) {
        return;
    }


    editandoLancamento = id;


    document.getElementById(
        "descricao"
    ).value =
        lancamento.descricao;


    document.getElementById(
        "valor"
    ).value =
        lancamento.valor;


    document.getElementById(
        "data"
    ).value =
        lancamento.data;


    document.getElementById(
        "categoria"
    ).value =
        lancamento.categoria;


    document.getElementById(
        "pagamento"
    ).value =
        lancamento.pagamento || "Dinheiro";


    document.getElementById(
        "observacao"
    ).value =
        lancamento.observacao || "";


    document.querySelector(
        `input[name="tipo"][value="${lancamento.tipo}"]`
    ).checked = true;


    document.getElementById(
        "tituloModalTransacao"
    ).textContent =
        lancamento.tipo === "entrada"
            ? "Editar entrada"
            : "Editar gasto";


    modalTransacao.classList.add(
        "aberto"
    );
}


/* =========================================================
   EXCLUIR LANÇAMENTO
========================================================= */

function excluirLancamento(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este lançamento?"
        );


    if (!confirmar) {
        return;
    }


    dados.lancamentos =
        dados.lancamentos.filter(
            item =>
                item.id !== id
        );


    salvarDados();

    atualizarTudo();


    mostrarToast(
        "Lançamento excluído!",
        "🗑️"
    );
}


/* =========================================================
   CONTAS
========================================================= */

formConta.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const descricao =
            document.getElementById(
                "contaDescricao"
            ).value.trim();


        const valor =
            Number(
                document.getElementById(
                    "contaValor"
                ).value
            );


        const vencimento =
            document.getElementById(
                "contaVencimento"
            ).value;


        const categoria =
            document.getElementById(
                "contaCategoria"
            ).value;


        if (
            !descricao ||
            !valor ||
            !vencimento
        ) {

            mostrarToast(
                "Preencha os campos obrigatórios.",
                "⚠️"
            );

            return;
        }


        dados.contas.push({

            id: gerarId(),

            descricao,

            valor,

            vencimento,

            categoria,

            paga: false
        });


        salvarDados();

        fecharModal(modalConta);

        formConta.reset();

        atualizarTudo();


        mostrarToast(
            "Conta cadastrada!",
            "✓"
        );
    }
);


/* =========================================================
   LISTAR CONTAS
========================================================= */

function listarContas() {

    const contas =
        dados.contas
            .filter(conta => {

                const info =
                    obterMesAno(
                        conta.vencimento
                    );

                return (
                    info &&
                    info.mes === mesAtual &&
                    info.ano === anoAtual
                );
            })
            .sort(
                (a, b) =>
                    a.vencimento.localeCompare(
                        b.vencimento
                    )
            );


    if (contas.length === 0) {

        listaContas.innerHTML = `

            <div class="estado-vazio pequeno">

                <span>
                    📅
                </span>

                <p>
                    Nenhuma conta cadastrada.
                </p>

            </div>

        `;

        return;
    }


    listaContas.innerHTML =
        contas
            .map(conta => `

                <div class="conta">

                    <div class="conta-icone">
                        📄
                    </div>


                    <div class="conta-info">

                        <strong>
                            ${escaparHTML(
                                conta.descricao
                            )}
                        </strong>

                        <small>
                            Vencimento:
                            ${formatarData(
                                conta.vencimento
                            )}
                            •
                            ${escaparHTML(
                                conta.categoria
                            )}
                        </small>

                    </div>


                    <div class="conta-valor">

                        <strong>
                            ${formatarMoeda(
                                conta.valor
                            )}
                        </strong>

                        <small>
                            ${
                                conta.paga
                                    ? "Paga"
                                    : "Pendente"
                            }
                        </small>

                    </div>


                    <button
                        type="button"
                        onclick="alternarConta('${conta.id}')"
                        title="Marcar conta"
                    >
                        ${
                            conta.paga
                                ? "↩️"
                                : "✓"
                        }
                    </button>


                    <button
                        type="button"
                        onclick="excluirConta('${conta.id}')"
                        title="Excluir"
                    >
                        🗑️
                    </button>

                </div>

            `)
            .join("");
}


/* =========================================================
   MARCAR CONTA COMO PAGA
========================================================= */

function alternarConta(id) {

    const conta =
        dados.contas.find(
            item =>
                item.id === id
        );


    if (!conta) {
        return;
    }


    conta.paga =
        !conta.paga;


    salvarDados();

    atualizarTudo();


    mostrarToast(
        conta.paga
            ? "Conta marcada como paga!"
            : "Conta marcada como pendente!",
        "✓"
    );
}


/* =========================================================
   EXCLUIR CONTA
========================================================= */

function excluirConta(id) {

    if (
        !confirm(
            "Deseja excluir esta conta?"
        )
    ) {
        return;
    }


    dados.contas =
        dados.contas.filter(
            conta =>
                conta.id !== id
        );


    salvarDados();

    atualizarTudo();


    mostrarToast(
        "Conta excluída!",
        "🗑️"
    );
}


/* =========================================================
   METAS
========================================================= */

formMeta.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const nome =
            document.getElementById(
                "metaNome"
            ).value.trim();


        const valor =
            Number(
                document.getElementById(
                    "metaValor"
                ).value
            );


        const inicial =
            Number(
                document.getElementById(
                    "metaInicial"
                ).value
            ) || 0;


        const data =
            document.getElementById(
                "metaData"
            ).value;


        if (!nome || !valor) {

            mostrarToast(
                "Informe o nome e o valor da meta.",
                "⚠️"
            );

            return;
        }


        dados.metas.push({

            id: gerarId(),

            nome,

            valor,

            guardado: inicial,

            data
        });


        salvarDados();

        fecharModal(modalMeta);

        formMeta.reset();

        atualizarTudo();


        mostrarToast(
            "Meta criada!",
            "🎯"
        );
    }
);


/* =========================================================
   LISTAR METAS
========================================================= */

function listarMetas() {

    if (dados.metas.length === 0) {

        listaMetas.innerHTML = `

            <div class="estado-vazio pequeno">

                <span>
                    🎯
                </span>

                <p>
                    Nenhuma meta criada.
                </p>

            </div>

        `;

        return;
    }


    listaMetas.innerHTML =
        dados.metas
            .map(meta => {

                const valor =
                    Number(meta.valor) || 0;


                const guardado =
                    Number(meta.guardado) || 0;


                let percentual =
                    valor > 0
                        ? (
                            guardado /
                            valor
                        ) * 100
                        : 0;


                percentual =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            percentual
                        )
                    );


                return `

                    <div class="meta">

                        <div class="meta-cabecalho">

                            <strong>
                                ${escaparHTML(
                                    meta.nome
                                )}
                            </strong>

                            <span class="meta-percentual">
                                ${percentual.toFixed(0)}%
                            </span>

                        </div>


                        <div class="meta-barra">

                            <div
                                style="width:${percentual}%"
                            ></div>

                        </div>


                        <div class="meta-rodape">

                            <span>
                                ${formatarMoeda(
                                    guardado
                                )}
                                guardado
                            </span>

                            <span>
                                Meta:
                                ${formatarMoeda(
                                    valor
                                )}
                            </span>

                        </div>


                        <div
                            style="
                                display:flex;
                                gap:6px;
                                margin-top:10px;
                            "
                        >

                            <button
                                type="button"
                                onclick="adicionarMeta('${meta.id}')"
                                style="
                                    flex:1;
                                    padding:8px;
                                    border-radius:8px;
                                    background:#eff6ff;
                                    color:#2563eb;
                                "
                            >
                                + Guardar
                            </button>


                            <button
                                type="button"
                                onclick="excluirMeta('${meta.id}')"
                                style="
                                    padding:8px;
                                    border-radius:8px;
                                    background:#fef2f2;
                                    color:#dc2626;
                                "
                            >
                                🗑️
                            </button>

                        </div>

                    </div>

                `;
            })
            .join("");
}


/* =========================================================
   ADICIONAR DINHEIRO À META
========================================================= */

function adicionarMeta(id) {

    const meta =
        dados.metas.find(
            item =>
                item.id === id
        );


    if (!meta) {
        return;
    }


    const valor =
        prompt(
            "Quanto deseja adicionar à meta?"
        );


    if (valor === null) {
        return;
    }


    const numero =
        Number(
            valor.replace(",", ".")
        );


    if (
        isNaN(numero) ||
        numero <= 0
    ) {

        mostrarToast(
            "Informe um valor válido.",
            "⚠️"
        );

        return;
    }


    meta.guardado =
        Number(meta.guardado || 0) +
        numero;


    salvarDados();

    atualizarTudo();


    mostrarToast(
        "Valor adicionado à meta!",
        "🎯"
    );
}


/* =========================================================
   EXCLUIR META
========================================================= */

function excluirMeta(id) {

    if (
        !confirm(
            "Deseja excluir esta meta?"
        )
    ) {
        return;
    }


    dados.metas =
        dados.metas.filter(
            meta =>
                meta.id !== id
        );


    salvarDados();

    atualizarTudo();


    mostrarToast(
        "Meta excluída!",
        "🗑️"
    );
}


/* =========================================================
   DETALHES
========================================================= */

function mostrarDetalhesLancamento(id) {

    const lancamento =
        dados.lancamentos.find(
            item =>
                item.id === id
        );


    if (!lancamento) {
        return;
    }


    const entrada =
        lancamento.tipo === "entrada";


    document.getElementById(
        "conteudoDetalhes"
    ).innerHTML = `

        <div class="detalhes-lista">

            <div class="detalhe-item">

                <span>
                    Tipo
                </span>

                <strong>
                    ${
                        entrada
                            ? "Entrada"
                            : "Gasto"
                    }
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Descrição
                </span>

                <strong>
                    ${escaparHTML(
                        lancamento.descricao
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Valor
                </span>

                <strong>
                    ${formatarMoeda(
                        lancamento.valor
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Data
                </span>

                <strong>
                    ${formatarData(
                        lancamento.data
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Categoria
                </span>

                <strong>
                    ${escaparHTML(
                        lancamento.categoria
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Pagamento
                </span>

                <strong>
                    ${escaparHTML(
                        lancamento.pagamento
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <span>
                    Observação
                </span>

                <strong>
                    ${
                        escaparHTML(
                            lancamento.observacao
                        ) || "-"
                    }
                </strong>

            </div>

        </div>

    `;


    modalDetalhes.classList.add(
        "aberto"
    );
}


/* =========================================================
   VER TODOS
========================================================= */

document
    .getElementById("btnVerTodos")
    .addEventListener(
        "click",
        () => {

            const lista =
                lancamentosDoMes()
                    .sort(
                        (a, b) =>
                            b.data.localeCompare(
                                a.data
                            )
                    );


            if (lista.length === 0) {

                mostrarToast(
                    "Nenhum lançamento neste mês.",
                    "📋"
                );

                return;
            }


            listaLancamentos.innerHTML =
                lista
                    .map(
                        criarLancamentoHTML
                    )
                    .join("");
        }
    );


/* =========================================================
   NAVEGAÇÃO DO MÊS
========================================================= */

document
    .getElementById("mesAnterior")
    .addEventListener(
        "click",
        () => {

            mesAtual--;


            if (mesAtual < 0) {

                mesAtual = 11;

                anoAtual--;
            }


            atualizarTudo();
        }
    );


document
    .getElementById("mesProximo")
    .addEventListener(
        "click",
        () => {

            mesAtual++;


            if (mesAtual > 11) {

                mesAtual = 0;

                anoAtual++;
            }


            atualizarTudo();
        }
    );


/* =========================================================
   BOTÕES NOVO
========================================================= */

document
    .getElementById("btnNovaEntrada")
    .addEventListener(
        "click",
        () =>
            abrirModalTransacao(
                "entrada"
            )
    );


document
    .getElementById("btnNovoGasto")
    .addEventListener(
        "click",
        () =>
            abrirModalTransacao(
                "saida"
            )
    );


document
    .getElementById("btnNovaConta")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "contaVencimento"
            ).value =
                dataLocalISO();


            modalConta.classList.add(
                "aberto"
            );
        }
    );


document
    .getElementById("btnNovaMeta")
    .addEventListener(
        "click",
        () => {

            modalMeta.classList.add(
                "aberto"
            );
        }
    );


document
    .getElementById("btnMenuAdicionar")
    .addEventListener(
        "click",
        () =>
            abrirModalTransacao(
                "saida"
            )
    );


/* =========================================================
   FECHAR MODAIS
========================================================= */

document
    .querySelectorAll(
        "[data-fechar]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const id =
                    botao.dataset.fechar;

                fecharModal(
                    document.getElementById(id)
                );
            }
        );
    });


/* Fechar clicando fora */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    fecharModal(modal);
                }
            }
        );
    });


/* =========================================================
   MENU INFERIOR
========================================================= */

document
    .querySelectorAll(".menu-item")
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".menu-item"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "ativo"
                        )
                    );


                botao.classList.add(
                    "ativo"
                );


                const tela =
                    botao.dataset.tela;


                if (
                    tela === "lancamentos"
                ) {

                    document
                        .getElementById(
                            "listaLancamentos"
                        )
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                } else if (
                    tela === "relatorios"
                ) {

                    document
                        .getElementById(
                            "btnRelatorioMensal"
                        )
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                } else if (
                    tela === "configuracoes"
                ) {

                    document
                        .querySelector(
                            ".configuracoes"
                        )
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                } else {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            }
        );
    });


/* =========================================================
   TEMA ESCURO
========================================================= */

function carregarTema() {

    const tema =
        localStorage.getItem(
            CHAVE_TEMA
        );


    if (tema === "dark") {

        document.body.classList.add(
            "dark"
        );

        document.getElementById(
            "btnTema"
        ).textContent = "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        document.getElementById(
            "btnTema"
        ).textContent = "🌙";
    }
}


document
    .getElementById("btnTema")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const escuro =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                CHAVE_TEMA,
                escuro
                    ? "dark"
                    : "light"
            );


            document.getElementById(
                "btnTema"
            ).textContent =
                escuro
                    ? "☀️"
                    : "🌙";
        }
    );


/* =========================================================
   EXPORTAR BACKUP
========================================================= */

document
    .getElementById("btnExportar")
    .addEventListener(
        "click",
        () => {

            const conteudo =
                JSON.stringify(
                    dados,
                    null,
                    2
                );


            const arquivo =
                new Blob(
                    [conteudo],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    arquivo
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            const data =
                dataLocalISO();


            link.download =
                `backup-financeiro-${data}.json`;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            mostrarToast(
                "Backup realizado!",
                "📤"
            );
        }
    );


/* =========================================================
   IMPORTAR BACKUP
========================================================= */

document
    .getElementById("btnImportar")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "inputImportar"
            ).click();
        }
    );


document
    .getElementById("inputImportar")
    .addEventListener(
        "change",
        function() {

            const arquivo =
                this.files[0];


            if (!arquivo) {
                return;
            }


            const leitor =
                new FileReader();


            leitor.onload =
                function(event) {

                    try {

                        const dadosImportados =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !dadosImportados ||
                            !Array.isArray(
                                dadosImportados.lancamentos
                            )
                        ) {

                            throw new Error(
                                "Arquivo inválido"
                            );
                        }


                        dados = {

                            lancamentos:
                                Array.isArray(
                                    dadosImportados.lancamentos
                                )
                                    ? dadosImportados.lancamentos
                                    : [],

                            contas:
                                Array.isArray(
                                    dadosImportados.contas
                                )
                                    ? dadosImportados.contas
                                    : [],

                            metas:
                                Array.isArray(
                                    dadosImportados.metas
                                )
                                    ? dadosImportados.metas
                                    : []
                        };


                        salvarDados();

                        atualizarTudo();


                        mostrarToast(
                            "Backup restaurado!",
                            "📥"
                        );


                    } catch (erro) {

                        console.error(
                            erro
                        );


                        mostrarToast(
                            "Backup inválido.",
                            "❌"
                        );
                    }
                };


            leitor.readAsText(
                arquivo
            );


            this.value = "";
        }
    );


/* =========================================================
   APAGAR DADOS
========================================================= */

document
    .getElementById("btnLimparDados")
    .addEventListener(
        "click",
        () => {

            const confirmar =
                confirm(
                    "ATENÇÃO!\n\nTodos os lançamentos, contas e metas serão apagados.\n\nDeseja continuar?"
                );


            if (!confirmar) {
                return;
            }


            const segundaConfirmacao =
                confirm(
                    "Tem certeza? Esta ação não pode ser desfeita."
                );


            if (!segundaConfirmacao) {
                return;
            }


            dados = {

                lancamentos: [],

                contas: [],

                metas: []
            };


            salvarDados();

            atualizarTudo();


            mostrarToast(
                "Todos os dados foram apagados.",
                "🗑️"
            );
        }
    );


/* =========================================================
   RELATÓRIO MENSAL
========================================================= */

document
    .getElementById(
        "btnRelatorioMensal"
    )
    .addEventListener(
        "click",
        () => {

            const lista =
                lancamentosDoMes();


            let entradas = 0;
            let despesas = 0;


            lista.forEach(item => {

                if (
                    item.tipo ===
                    "entrada"
                ) {

                    entradas +=
                        Number(
                            item.valor
                        );

                } else {

                    despesas +=
                        Number(
                            item.valor
                        );
                }
            });


            const resultado =
                entradas - despesas;


            alert(

                `RELATÓRIO MENSAL\n\n` +

                `Período: ` +
                mesSelecionado.textContent +
                `\n\n` +

                `Entradas: ` +
                formatarMoeda(entradas) +
                `\n` +

                `Despesas: ` +
                formatarMoeda(despesas) +
                `\n` +

                `Resultado: ` +
                formatarMoeda(resultado)
            );
        }
    );


/* =========================================================
   RELATÓRIO POR CATEGORIA
========================================================= */

document
    .getElementById(
        "btnRelatorioCategorias"
    )
    .addEventListener(
        "click",
        () => {

            const lista =
                lancamentosDoMes()
                    .filter(
                        item =>
                            item.tipo ===
                            "saida"
                    );


            const categorias = {};


            lista.forEach(item => {

                const categoria =
                    item.categoria ||
                    "Outros";


                categorias[categoria] =
                    (
                        categorias[categoria] ||
                        0
                    ) +
                    Number(
                        item.valor || 0
                    );
            });


            const resultado =
                Object.entries(
                    categorias
                )
                    .sort(
                        (a, b) =>
                            b[1] - a[1]
                    );


            if (
                resultado.length === 0
            ) {

                alert(
                    "Ainda não existem gastos neste mês."
                );

                return;
            }


            let texto =
                "GASTOS POR CATEGORIA\n\n";


            resultado.forEach(
                ([categoria, valor]) => {

                    texto +=
                        `${categoria}: ` +
                        `${formatarMoeda(valor)}\n`;
                }
            );


            alert(texto);
        }
    );


/* =========================================================
   RELATÓRIO ANUAL
========================================================= */

document
    .getElementById(
        "btnRelatorioAnual"
    )
    .addEventListener(
        "click",
        () => {

            let entradas = 0;
            let despesas = 0;


            dados.lancamentos
                .filter(item => {

                    const info =
                        obterMesAno(
                            item.data
                        );

                    return (
                        info &&
                        info.ano === anoAtual
                    );
                })
                .forEach(item => {

                    if (
                        item.tipo ===
                        "entrada"
                    ) {

                        entradas +=
                            Number(
                                item.valor
                            );

                    } else {

                        despesas +=
                            Number(
                                item.valor
                            );
                    }
                });


            const resultado =
                entradas - despesas;


            alert(

                `RELATÓRIO ANUAL ${anoAtual}\n\n` +

                `Entradas: ` +
                formatarMoeda(entradas) +
                `\n` +

                `Despesas: ` +
                formatarMoeda(despesas) +
                `\n` +

                `Resultado: ` +
                formatarMoeda(resultado)
            );
        }
    );


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;


function mostrarToast(
    mensagem,
    icone = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    const toastMensagem =
        document.getElementById(
            "toastMensagem"
        );


    toastIcon.textContent =
        icone;


    toastMensagem.textContent =
        mensagem;


    toast.classList.add(
        "mostrar"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "mostrar"
                );

            },
            2500
        );
}


/* =========================================================
   ATUALIZAR TUDO
========================================================= */

function atualizarTudo() {

    atualizarMes();

    atualizarResumo();

    listarLancamentos();

    atualizarGrafico();

    listarContas();

    listarMetas();
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function iniciarAplicativo() {

    carregarDados();

    carregarCategorias();

    carregarTema();

    atualizarTudo();


    /*
       Garante que o campo de data
       comece com a data LOCAL correta.
    */

    const campoData =
        document.getElementById(
            "data"
        );


    if (campoData) {

        campoData.value =
            dataLocalISO();
    }
}


/* =========================================================
   INICIAR
========================================================= */

iniciarAplicativo();


/* =========================================================
   FIM
========================================================= */