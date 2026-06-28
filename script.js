// =======================================
// BOLAO COPA 2026
// =======================================

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
    const valorSalvo = carregarLocalStorage("participantes", []);
    return Array.isArray(valorSalvo) ? valorSalvo : [];
}

function salvarParticipantes() {
    localStorage.setItem("participantes", JSON.stringify(participantes));
}

function salvarResultados() {
    localStorage.setItem("resultados", JSON.stringify(officialResults));
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
        matches.push([
            prevWinners[0] || "A definir",
            prevWinners[2] || "A definir"
        ]);

        matches.push([
            prevWinners[3] || "A definir",
            prevWinners[1] || "A definir"
        ]);

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

    const novoParticipante = {
        id: Date.now(),
        nome,
        foto: "",
        palpites: criarEstruturaPalpites()
    };

    participantes.push(novoParticipante);
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
    if (!participanteAtual) {
        return;
    }

    participanteAtual.palpites = normalizarPalpites(participanteAtual.palpites || {});
    document.getElementById("inicio").classList.add("hidden");
    document.getElementById("perfil").classList.remove("hidden");
    document.getElementById("resultados").classList.add("hidden");
    document.getElementById("ranking").classList.add("hidden");
    renderPerfil();
}

function renderPerfil() {
    if (!participanteAtual) {
        return;
    }

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

    const campeaoPreview = document.getElementById("campeaoPreview");
    campeaoPreview.textContent = `Campeao: ${participanteAtual.palpites.campeao || "ainda nao definido"}`;
}

function selecionarPalpite(roundKey, index, teamName) {
    if (!participanteAtual || teamName === "A definir") {
        return;
    }

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
    if (!arquivo || !participanteAtual) {
        return;
    }

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
    if (teamName === "A definir") {
        return;
    }

    if (!officialResults[roundKey]) {
        officialResults[roundKey] = [];
    }

    officialResults[roundKey][index] = teamName;

    if (roundKey === "final") {
        officialResults.campeao = teamName;
    }

    salvarResultados();
    renderResultados();
}

function calcularPontuacao() {
    const participantesComPontos = participantes.map((participante) => {
        let pontos = 0;
        const palpites = normalizarPalpites(participante.palpites || {});

        roundKeys.forEach((roundKey) => {
            const resultados = officialResults[roundKey] || [];
            palpites[roundKey].forEach((palpite, index) => {
                if (palpite && resultados[index] && palpite === resultados[index]) {
                    pontos += 1;
                }
            });
        });

        if (palpites.campeao && officialResults.campeao && palpites.campeao === officialResults.campeao) {
            pontos += 5;
        }

        return { ...participante, palpites, pontos };
    });

    participantes = participantesComPontos.sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome));
    salvarParticipantes();
    renderRanking();
    alert("Ranking atualizado!");
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
