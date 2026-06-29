// =======================================
// BOLAO COPA 2026
// =======================================

const PARTICIPANTES_KEY = "participantes-v2";
// =========================
// CONFIGURAÇÃO DA API
// =========================

// Coloque aqui sua chave da API quando criar uma conta
const API_KEY = "";

// URL da API (será usada quando a Copa começar)
const API_URL = "";

// Atualização automática a cada 5 minutos
const TEMPO_ATUALIZACAO = 300000;
const roundKeys = ["dezesseisAvos", "oitavas", "quartas", "semifinal", "final"];

const roundTitles = {
    dezesseisAvos: "16 avos",
    oitavas: "Oitavas",
    quartas: "Quartas",
    semifinal: "Semifinal",
    final: "Final"
};

const matchCounts = {
    dezesseisAvos: 16,
    oitavas: 8,
    quartas: 4,
    semifinal: 2,
    final: 1
};

const staticMatches = [
    ["Alemanha", "Paraguai"],
    ["Franca", "Suecia"],
    ["Africa do Sul", "Canada"],
    ["Paises Baixos", "Marrocos"],
    ["Brasil", "Japao"],
    ["Noruega", "Costa do Marfim"],
    ["Mexico", "Equador"],
    ["Inglaterra", "Congo"],
    ["Portugal", "Croacia"],
    ["Espanha", "Austria"],
    ["Estados Unidos", "Bosnia"],
    ["Belgica", "Senegal"],
    ["Argentina", "Cabo Verde"],
    ["Australia", "Egito"],
    ["Suica", "Argelia"],
    ["Colombia", "Gana"]
];

const roundPrev = {
    oitavas: "dezesseisAvos",
    quartas: "oitavas",
    semifinal: "quartas",
    final: "semifinal"
};

let participantes = carregarParticipantes();
let officialResults = normalizarPalpites(carregarLocalStorage("resultados", criarEstruturaPalpites()));
let participanteAtual = null;

participantes = participantes
    .filter((participante) => participante && typeof participante === "object")
    .map((participante) => ({
        ...participante,
        id: participante.id || Date.now(),
        nome: participante.nome || "Participante",
        foto: participante.foto || "",
        palpites: normalizarPalpites(participante.palpites || {})
    }));

function carregarLocalStorage(chave, valorPadrao) {
    try {
        const valorSalvo = localStorage.getItem(chave);
        return valorSalvo ? JSON.parse(valorSalvo) : valorPadrao;
    } catch (error) {
        console.warn(`Nao foi possivel carregar ${chave}.`, error);
        return valorPadrao;
    }
}

function carregarParticipantes() {
    const participantesMockados = [
        { id: 1, nome: "Bruno", foto: "./fotos/bruno.jpg", palpites: criarEstruturaPalpites() },
        { id: 2, nome: "Enio", foto: "./fotos/enio.jpg", palpites: criarEstruturaPalpites() },
        { id: 3, nome: "Jorginho", foto: "./fotos/jorginho.jpg", palpites: criarEstruturaPalpites() },
        { id: 4, nome: "Rosinaldo", foto: "./fotos/rosinaldo.jpg", palpites: criarEstruturaPalpites() },
        { id: 5, nome: "Jocelmo", foto: "./fotos/jocelmo.jpg", palpites: criarEstruturaPalpites() },
        { id: 6, nome: "Eduardo", foto: "./fotos/eduardo.jpg", palpites: criarEstruturaPalpites() },
        { id: 7, nome: "Igor", foto: "./fotos/igor.jpg", palpites: criarEstruturaPalpites() },
        { id: 8, nome: "João", foto: "./fotos/joao.jpg", palpites: criarEstruturaPalpites() },
        { id: 9, nome: "Júnior", foto: "./fotos/junior.jpg", palpites: criarEstruturaPalpites() },
        { id: 10, nome: "Jorge Fernandes", foto: "./fotos/jorge-fernandes.jpg", palpites: criarEstruturaPalpites() },
        { id: 11, nome: "Diego", foto: "./fotos/diego.jpg", palpites: criarEstruturaPalpites() }
    ];

    const valorSalvo = carregarLocalStorage(PARTICIPANTES_KEY, null);

    return Array.isArray(valorSalvo) ? valorSalvo : participantesMockados;
}

function salvarParticipantes() {
    localStorage.setItem(PARTICIPANTES_KEY, JSON.stringify(participantes));
}

function salvarResultados() {
    localStorage.setItem("resultados", JSON.stringify(officialResults));
}
async function atualizarResultadosAutomaticamente() {

    // Enquanto a API não estiver configurada,
    // simplesmente não faz nada.

    if (!API_KEY || !API_URL) {
        return;
    }

    try {

        const resposta = await fetch(API_URL, {
            headers: {
                "x-apisports-key": API_KEY
            }
        });

        const dados = await resposta.json();

        console.log("Resultados recebidos:", dados);

        // A Etapa 2 irá preencher o officialResults
        // automaticamente.

    } catch (erro) {

        console.error("Erro ao atualizar resultados:", erro);

    }

}
function criarEstruturaPalpites() {
    return {
        dezesseisAvos: Array(matchCounts.dezesseisAvos).fill(null),
        oitavas: Array(matchCounts.oitavas).fill(null),
        quartas: Array(matchCounts.quartas).fill(null),
        semifinal: Array(matchCounts.semifinal).fill(null),
        final: Array(matchCounts.final).fill(null),
        campeao: ""
    };
}

function normalizarPalpites(palpites) {
    const estrutura = criarEstruturaPalpites();

    roundKeys.forEach((roundKey) => {
        const valores = Array.isArray(palpites[roundKey]) ? palpites[roundKey] : [];
        estrutura[roundKey] = Array.from(
            { length: matchCounts[roundKey] },
            (_, index) => valores[index] || null
        );
    });

    estrutura.campeao = palpites.campeao || "";
    return estrutura;
}

function gerarChaveamento(roundKey, source) {
    if (roundKey === "dezesseisAvos") {
        return staticMatches.map((match) => [...match]);
    }

    const prevRound = roundPrev[roundKey];
    const prevWinners = source[prevRound] || [];
    const count = matchCounts[roundKey];
    const matches = [];

    if (roundKey === "semifinal") {
        matches.push([prevWinners[0] || "A definir", prevWinners[2] || "A definir"]);
        matches.push([prevWinners[3] || "A definir", prevWinners[1] || "A definir"]);
        return matches;
    }

    for (let i = 0; i < count; i += 1) {
        const a = prevWinners[i * 2] || "A definir";
        const b = prevWinners[i * 2 + 1] || "A definir";
        matches.push([a, b]);
    }

    return matches;
}

function criarBotaoTime(teamName, selected, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = teamName;
    button.classList.toggle("selected", selected);
    button.disabled = teamName === "A definir";
    button.addEventListener("click", onClick);
    return button;
}

function mostrarInicio() {
    document.getElementById("inicio").classList.remove("hidden");
    document.getElementById("perfil").classList.add("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("ranking").classList.add("hidden");
}

function abrirResultados() {
    document.getElementById("inicio").classList.add("hidden");
    document.getElementById("perfil").classList.add("hidden");
    document.getElementById("resultados").classList.remove("hidden");
    document.getElementById("ranking").classList.add("hidden");
    renderResultados();
}

function abrirRanking() {
    document.getElementById("inicio").classList.add("hidden");
    document.getElementById("perfil").classList.add("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("ranking").classList.remove("hidden");
    renderRanking();
}

function voltar() {
    participanteAtual = null;
    mostrarInicio();
}

function adicionarParticipante() {
    const inputNome = document.getElementById("nome");
    const nome = inputNome.value.trim();

    if (!nome) {
        alert("Digite um nome para o participante.");
        return;
    }

    participantes.push({
        id: Date.now(),
        nome,
        foto: "",
        palpites: criarEstruturaPalpites()
    });

    salvarParticipantes();
    inputNome.value = "";
    renderParticipantes();
}

function renderParticipantes() {
    const lista = document.getElementById("listaParticipantes");
    lista.innerHTML = "";

    if (!participantes.length) {
        lista.innerHTML = "<p>Nenhum participante cadastrado ainda.</p>";
        return;
    }

    participantes.forEach((participante) => {
        const card = document.createElement("div");
        const nome = document.createElement("span");
        const remover = document.createElement("button");

        card.className = "participante";
        nome.textContent = participante.nome;
        nome.addEventListener("click", () => abrirPerfil(participante.id));

        remover.type = "button";
        remover.textContent = "Remover";
        remover.addEventListener("click", () => removerParticipante(participante.id));

        card.append(nome, remover);
        lista.appendChild(card);
    });
}

function removerParticipante(id) {
    participantes = participantes.filter((participante) => participante.id !== id);
    salvarParticipantes();
    renderParticipantes();
}

function abrirPerfil(id) {
    participanteAtual = participantes.find((participante) => participante.id === id);

    if (!participanteAtual) return;

    participanteAtual.palpites = normalizarPalpites(participanteAtual.palpites || {});

    document.getElementById("inicio").classList.add("hidden");
    document.getElementById("perfil").classList.remove("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("ranking").classList.add("hidden");

    renderPerfil();
}

function renderPerfil() {
    if (!participanteAtual) return;

    document.getElementById("tituloParticipante").textContent = participanteAtual.nome;
    document.getElementById("fotoParticipante").hidden = !participanteAtual.foto;
    document.getElementById("fotoParticipante").src = participanteAtual.foto || "";

    const container = document.getElementById("listaJogos");
    container.innerHTML = "";

    roundKeys.forEach((roundKey) => {
        const matches = gerarChaveamento(roundKey, participanteAtual.palpites);
        const bloco = document.createElement("div");
        const titulo = document.createElement("h3");
        const label = document.createElement("div");

        bloco.className = "jogo";
        titulo.textContent = roundTitles[roundKey];
        label.className = "match-label";
        label.textContent = roundKey === "final" ? "Escolha o campeao" : "Escolha os vencedores";

        bloco.append(titulo, label);

        matches.forEach((match, index) => {
            const card = document.createElement("div");
            const selecionado = roundKey === "final"
                ? participanteAtual.palpites.campeao
                : participanteAtual.palpites[roundKey][index];

            card.className = "match-row";
            card.append(
                criarBotaoTime(match[0], selecionado === match[0], () => selecionarPalpite(roundKey, index, match[0])),
                criarBotaoTime(match[1], selecionado === match[1], () => selecionarPalpite(roundKey, index, match[1]))
            );

            bloco.appendChild(card);
        });

        container.appendChild(bloco);
    });

    document.getElementById("campeaoPreview").textContent =
        `Campeao: ${participanteAtual.palpites.campeao || "ainda nao definido"}`;
}

function selecionarPalpite(roundKey, index, teamName) {
    if (!participanteAtual || teamName === "A definir") return;

    if (roundKey === "final") {
        participanteAtual.palpites.final[index] = teamName;
        participanteAtual.palpites.campeao = teamName;
    } else {
        participanteAtual.palpites[roundKey][index] = teamName;
    }

    salvarParticipantes();
    renderPerfil();
}

function salvarFoto(event) {
    const arquivo = event.target.files[0];

    if (!arquivo || !participanteAtual) return;

    const leitor = new FileReader();

    leitor.onload = function () {
        participanteAtual.foto = leitor.result;
        salvarParticipantes();
        renderPerfil();
    };

    leitor.readAsDataURL(arquivo);
}

function salvarPalpites() {
    if (!participanteAtual) {
        alert("Selecione um participante primeiro.");
        return;
    }

    salvarParticipantes();
    alert("Chaveamento salvo com sucesso!");
}

function renderResultados() {
    const container = document.getElementById("listaResultados");
    container.innerHTML = "";

    roundKeys.forEach((roundKey) => {
        const matches = gerarChaveamento(roundKey, officialResults);
        const bloco = document.createElement("div");
        const titulo = document.createElement("h3");

        bloco.className = "jogo";
        titulo.textContent = roundTitles[roundKey];
        bloco.appendChild(titulo);

        matches.forEach((match, index) => {
            const card = document.createElement("div");
            card.className = "match-row";
            card.append(
                criarBotaoTime(match[0], officialResults[roundKey][index] === match[0], () => registrarResultado(roundKey, index, match[0])),
                criarBotaoTime(match[1], officialResults[roundKey][index] === match[1], () => registrarResultado(roundKey, index, match[1]))
            );
            bloco.appendChild(card);
        });

        container.appendChild(bloco);
    });

    const campeao = document.createElement("div");
    campeao.className = "champion-row";
    campeao.innerHTML = `<div class="result-badge">Campeao oficial: ${officialResults.campeao || "ainda nao definido"}</div>`;
    container.appendChild(campeao);
}

function registrarResultado(roundKey, index, teamName) {

    if (teamName === "A definir") return;

    if (!officialResults[roundKey]) {
        officialResults[roundKey] = [];
    }

    // Salva o vencedor
    officialResults[roundKey][index] = teamName;

    // Se for a final, define o campeão
    if (roundKey === "final") {
        officialResults.campeao = teamName;
    }

    // Salva os resultados
    salvarResultados();

    // Atualiza automaticamente os confrontos da próxima fase
    renderResultados();

    // Recalcula todos os participantes
    calcularPontuacao();

    // Atualiza o ranking
    renderRanking();
}

function calcularPontuacao() {

    participantes.forEach(participante => {

        let pontos = 0;

        const palpites = normalizarPalpites(participante.palpites || {});

        // ==========================
        // 16 AVOS
        // ==========================
        for (let i = 0; i < officialResults.dezesseisAvos.length; i++) {

            if (
                officialResults.dezesseisAvos[i] &&
                palpites.dezesseisAvos[i] === officialResults.dezesseisAvos[i]
            ) {
                pontos++;
            }

        }

        // ==========================
        // OITAVAS
        // ==========================
        for (let i = 0; i < officialResults.oitavas.length; i++) {

            const jogo1 = i * 2;
            const jogo2 = jogo1 + 1;

            const caminhoCorreto =
                palpites.dezesseisAvos[jogo1] === officialResults.dezesseisAvos[jogo1] &&
                palpites.dezesseisAvos[jogo2] === officialResults.dezesseisAvos[jogo2];

            if (
                caminhoCorreto &&
                officialResults.oitavas[i] &&
                palpites.oitavas[i] === officialResults.oitavas[i]
            ) {
                pontos++;
            }

        }

        // ==========================
        // QUARTAS
        // ==========================
        for (let i = 0; i < officialResults.quartas.length; i++) {

            const jogo1 = i * 2;
            const jogo2 = jogo1 + 1;

            const caminhoCorreto =
                palpites.oitavas[jogo1] === officialResults.oitavas[jogo1] &&
                palpites.oitavas[jogo2] === officialResults.oitavas[jogo2];

            if (
                caminhoCorreto &&
                officialResults.quartas[i] &&
                palpites.quartas[i] === officialResults.quartas[i]
            ) {
                pontos++;
            }

        }

        // ==========================
        // SEMIFINAL
        // ==========================
        for (let i = 0; i < officialResults.semifinal.length; i++) {

            const jogo1 = i * 2;
            const jogo2 = jogo1 + 1;

            const caminhoCorreto =
                palpites.quartas[jogo1] === officialResults.quartas[jogo1] &&
                palpites.quartas[jogo2] === officialResults.quartas[jogo2];

            if (
                caminhoCorreto &&
                officialResults.semifinal[i] &&
                palpites.semifinal[i] === officialResults.semifinal[i]
            ) {
                pontos++;
            }

        }

        // ==========================
        // FINAL
        // ==========================
        const finalCorreta =
            palpites.semifinal[0] === officialResults.semifinal[0] &&
            palpites.semifinal[1] === officialResults.semifinal[1];

        if (
            finalCorreta &&
            officialResults.final[0] &&
            palpites.final[0] === officialResults.final[0]
        ) {
            pontos++;
        }

        // ==========================
        // CAMPEÃO
        // ==========================
        if (
            finalCorreta &&
            officialResults.campeao &&
            palpites.campeao === officialResults.campeao
        ) {
            pontos += 5;
        }

        participante.pontos = pontos;

    });

    participantes.sort((a, b) => b.pontos - a.pontos);

    salvarParticipantes();

    renderRanking();

}
function renderRanking() {
    const lista = document.getElementById("listaRanking");
    lista.innerHTML = "";

    if (!participantes.length) {
        lista.innerHTML = "<p>Nenhum participante para rankear.</p>";
        return;
    }

    participantes.forEach((participante, index) => {
        const item = document.createElement("div");
        const left = document.createElement("div");
        const foto = participante.foto ? document.createElement("img") : document.createElement("div");
        const texto = document.createElement("div");
        const nome = document.createElement("strong");
        const pontos = document.createElement("div");
        const total = document.createElement("div");

        item.className = "ranking-item";
        left.className = "ranking-left";
        foto.className = "ranking-foto";

        if (participante.foto) {
            foto.src = participante.foto;
            foto.alt = participante.nome;
        }

        nome.textContent = `#${index + 1} ${participante.nome}`;
        pontos.textContent = `${participante.pontos || 0} pontos`;
        total.textContent = participante.pontos || 0;

        texto.append(nome, pontos);
        left.append(foto, texto);
        item.append(left, total);
        lista.appendChild(item);
    });
}

function inicializar() {
    salvarParticipantes();
    salvarResultados();
    renderParticipantes();
    renderResultados();
    renderRanking();
    mostrarInicio();
}
// Atualiza automaticamente
atualizarResultadosAutomaticamente();

// Atualiza a cada 5 minutos
setInterval(atualizarResultadosAutomaticamente, TEMPO_ATUALIZACAO);
window.mostrarInicio = mostrarInicio;
window.abrirResultados = abrirResultados;
window.abrirRanking = abrirRanking;
window.voltar = voltar;
window.adicionarParticipante = adicionarParticipante;
window.removerParticipante = removerParticipante;
window.abrirPerfil = abrirPerfil;
window.salvarFoto = salvarFoto;
window.salvarPalpites = salvarPalpites;
window.calcularPontuacao = calcularPontuacao;

window.addEventListener("DOMContentLoaded", inicializar);
