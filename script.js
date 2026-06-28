// =======================================
// BOLÃO COPA 2026
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
    ["França", "Suécia"],
    ["África do Sul", "Canadá"],
    ["Países Baixos", "Marrocos"],
    ["Brasil", "Japão"],
    ["Noruega", "Costa do Marfim"],
    ["México", "Equador"],
    ["Inglaterra", "Congo"],
    ["Portugal", "Croácia"],
    ["Espanha", "Áustria"],
    ["Estados Unidos", "Bósnia"],
    ["Bélgica", "Senegal"],
    ["Argentina", "Cabo Verde"],
    ["Austrália", "Egito"],
    ["Suíça", "Argélia"],
    ["Colômbia", "Gana"]
];

const roundPrev = {
    oitavas: "dezesseisAvos",
    quartas: "oitavas",
    semifinal: "quartas",
    final: "semifinal"
};

const roundNext = {
    dezesseisAvos: "oitavas",
    oitavas: "quartas",
    quartas: "semifinal",
    semifinal: "final"
};

let participantes = JSON.parse(localStorage.getItem("participantes")) || [];
let officialResults = JSON.parse(localStorage.getItem("resultados")) || {
    dezesseisAvos: [],
    oitavas: [],
    quartas: [],
    semifinal: [],
    final: [],
    campeao: ""
};
let participanteAtual = null;

function garantirComprimento(arr, length) {
    const resultado = Array.isArray(arr) ? [...arr] : [];
    while (resultado.length < length) {
        resultado.push("");
    }
    return resultado.slice(0, length);
}

function normalizarChaveamento(chaveamento = {}) {
    return {
        dezesseisAvos: garantirComprimento(chaveamento.dezesseisAvos, matchCounts.dezesseisAvos),
        oitavas: garantirComprimento(chaveamento.oitavas, matchCounts.oitavas),
        quartas: garantirComprimento(chaveamento.quartas, matchCounts.quartas),
        semifinal: garantirComprimento(chaveamento.semifinal, matchCounts.semifinal),
        final: garantirComprimento(chaveamento.final, matchCounts.final),
        campeao: chaveamento.campeao || ""
    };
}

function setBracketTeam(bracketData, roundKey, index, team) {
    bracketData[roundKey] = garantirComprimento(bracketData[roundKey], index + 1);
    bracketData[roundKey][index] = team;
}

function getNextSlot(roundKey, matchIndex) {
    const nextRound = roundNext[roundKey];
    if (!nextRound) return null;

    if (["dezesseisAvos", "oitavas", "quartas", "semifinal"].includes(roundKey)) {
        return { nextRound, nextIndex: matchIndex };
    }

    return null;
}

const defaultBruno = {
    nome: "Bruno",
    foto: null,
    pontos: 0,
    chaveamento: {
        dezesseisAvos: [
            "Alemanha", "França", "África do Sul", "Países Baixos",
            "Brasil", "Noruega", "México", "Inglaterra",
            "Portugal", "Espanha", "Estados Unidos", "Bélgica",
            "Argentina", "Austrália", "Suíça", "Colômbia"
        ],
        oitavas: ["França", "Espanha", "Inglaterra", "Argentina", "Brasil", "Países Baixos", "Suíça", "México"],
        quartas: ["França", "Espanha", "Inglaterra", "Argentina"],
        semifinal: ["França", "Inglaterra"],
        final: ["França"],
        campeao: "França"
    }
};

function normalizarParticipantes() {
    participantes = participantes.map(p => ({
        ...p,
        chaveamento: normalizarChaveamento(p.chaveamento)
    }));
}

function normalizarResultados() {
    officialResults = normalizarChaveamento(officialResults);
}

function atualizarBrunoExemplo() {
    participantes = participantes.map(p => {
        if (p.nome === "Bruno" || p.nome === "Exemplo GE") {
            return {
                ...p,
                chaveamento: JSON.parse(JSON.stringify(defaultBruno.chaveamento))
            };
        }
        return p;
    });
}

function inserirBrunoSeAusente() {
    const bruno = participantes.find(p => p.nome === "Bruno");
    if (!bruno) {
        participantes.unshift(defaultBruno);
        salvarParticipantes();
        return;
    }

    if (!bruno.chaveamento || !bruno.chaveamento.dezesseisAvos.length) {
        bruno.chaveamento = JSON.parse(JSON.stringify(defaultBruno.chaveamento));
        salvarParticipantes();
    }
}

function carregarExemploGE() {
    const exemplo = JSON.parse(JSON.stringify(defaultBruno));
    exemplo.nome = "Exemplo GE";
    const idx = participantes.findIndex(p => p.nome === "Exemplo GE");
    if (idx >= 0) {
        participantes[idx] = exemplo;
    } else {
        participantes.unshift(exemplo);
    }
    normalizarParticipantes();
    salvarParticipantes();
    mostrarParticipantes();
    abrirParticipante(0);
}

window.onload = () => {
    normalizarParticipantes();
    normalizarResultados();
    atualizarBrunoExemplo();
    inserirBrunoSeAusente();
    mostrarParticipantes();
    if (window.location.hash === "#public") {
        abrirPublico();
    }
};

function salvarParticipantes() {
    localStorage.setItem("participantes", JSON.stringify(participantes));
}

function salvarResultados() {
    localStorage.setItem("resultados", JSON.stringify(officialResults));
}

function adicionarParticipante() {
    const nome = document.getElementById("nome").value.trim();
    if (!nome) {
        alert("Digite o nome do participante.");
        return;
    }

    participantes.push({
        nome,
        foto: null,
        pontos: 0,
        chaveamento: {
            dezesseisAvos: [],
            oitavas: [],
            quartas: [],
            semifinal: [],
            final: [],
            campeao: ""
        }
    });

    salvarParticipantes();
    mostrarParticipantes();
    document.getElementById("nome").value = "";
}

function mostrarParticipantes() {
    const lista = document.getElementById("listaParticipantes");
    lista.innerHTML = "";

    participantes.forEach((p, index) => {
        lista.innerHTML += `
            <div class="participante">
                <span onclick="abrirParticipante(${index})">👤 ${p.nome} <small>${p.pontos || 0} pts</small></span>
                <button onclick="excluirParticipante(${index})">Excluir</button>
            </div>
        `;
    });
}

function excluirParticipante(index) {
    if (confirm("Excluir participante?")) {
        participantes.splice(index, 1);
        salvarParticipantes();
        mostrarParticipantes();
    }
}

function abrirParticipante(index) {
    participanteAtual = index;
    mostrarSecao("perfil");
    document.getElementById("tituloParticipante").textContent = participantes[index].nome;
    carregarFoto();
    desenharChaveamento();
    atualizarCampeaoPreview();
}

function voltar() {
    mostrarSecao("inicio");
}

function mostrarInicio() {
    mostrarSecao("inicio");
}

function mostrarSecao(id) {
    ["inicio", "perfil", "resultados", "ranking", "public"].forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.classList.toggle("hidden", sec !== id);
    });
}

function salvarFoto(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function (e) {
        participantes[participanteAtual].foto = e.target.result;
        salvarParticipantes();
        carregarFoto();
    };
    leitor.readAsDataURL(arquivo);
}

function carregarFoto() {
    const foto = document.getElementById("fotoParticipante");
    if (participantes[participanteAtual]?.foto) {
        foto.src = participantes[participanteAtual].foto;
        foto.hidden = false;
    } else {
        foto.hidden = true;
    }
}

function limparRodadasPosteriores(bracketData, roundKey) {
    const index = roundKeys.indexOf(roundKey);
    if (index < 0) return;

    for (let i = index + 1; i < roundKeys.length; i += 1) {
        bracketData[roundKeys[i]] = [];
    }

    bracketData.campeao = "";
}

function gerarMatches(roundKey, bracketData) {
    if (roundKey === "dezesseisAvos") {
        return staticMatches;
    }

    const prevKey = roundPrev[roundKey];
    const prevWinners = bracketData[prevKey] || [];
    const matches = [];
    const count = matchCounts[roundKey] || 0;

    for (let i = 0; i < count; i += 1) {
        const a = prevWinners[i * 2] || "A definir";
        const b = prevWinners[i * 2 + 1] || "A definir";
        matches.push([a, b]);
    }

    return matches;
}

function desenharChaveamento() {
    const div = document.getElementById("listaJogos");
    div.innerHTML = "";
    const participante = participantes[participanteAtual];

    roundKeys.forEach(roundKey => {
        const titulo = roundTitles[roundKey];
        const matches = gerarMatches(roundKey, participante.chaveamento);
        div.innerHTML += `<div class="section-title"><h3>${titulo}</h3></div>`;

        matches.forEach((match, matchIndex) => {
            const escolhido = participante.chaveamento[roundKey][matchIndex] || "";
            div.innerHTML += `
                <div class="jogo">
                    <h3>${titulo} - Jogo ${matchIndex + 1}</h3>
                    <div class="match-label">${match[0]} x ${match[1]}</div>
                    <div class="match-row">
                        <button class="${escolhido === match[0] ? "selected" : ""}" onclick="escolherTime('${roundKey}', ${matchIndex}, '${match[0]}')" ${match[0] === 'A definir' ? 'disabled' : ''}>${match[0]}</button>
                        <button class="${escolhido === match[1] ? "selected" : ""}" onclick="escolherTime('${roundKey}', ${matchIndex}, '${match[1]}')" ${match[1] === 'A definir' ? 'disabled' : ''}>${match[1]}</button>
                    </div>
                </div>
            `;
        });
    });
}

function escolherTime(roundKey, matchIndex, team) {
    const participante = participantes[participanteAtual];
    limparRodadasPosteriores(participante.chaveamento, roundKey);
    setBracketTeam(participante.chaveamento, roundKey, matchIndex, team);

    const nextSlot = getNextSlot(roundKey, matchIndex);
    if (nextSlot) {
        setBracketTeam(participante.chaveamento, nextSlot.nextRound, nextSlot.nextIndex, team);
    }

    if (roundKey === "final") {
        participante.chaveamento.campeao = team;
    }
    salvarParticipantes();
    desenharChaveamento();
    atualizarCampeaoPreview();
}

function salvarPalpites() {
    salvarParticipantes();
    atualizarCampeaoPreview();
    alert("Chaveamento salvo com sucesso.");
}

function abrirResultados() {
    mostrarSecao("resultados");
    desenharResultados();
}

function abrirPublico() {
    mostrarSecao("public");
    atualizarLinkPublico();
    desenharPublico();
}

function atualizarLinkPublico() {
    const linkInput = document.getElementById("publicLink");
    const linkAnchor = document.getElementById("publicLinkAnchor");
    const message = document.getElementById("publicLinkMessage");
    if (!linkInput || !linkAnchor || !message) return;
    const url = new URL(window.location.href);
    url.hash = "public";
    const fullUrl = url.toString();
    linkInput.value = fullUrl;
    linkAnchor.href = fullUrl;
    linkAnchor.textContent = "Abrir link público";
    message.textContent = "Copie esse link e envie para quem quiser acompanhar.";
}

function copiarLinkPublico() {
    const linkInput = document.getElementById("publicLink");
    const message = document.getElementById("publicLinkMessage");
    if (!linkInput || !message) return;

    const text = linkInput.value;
    if (!text) {
        message.textContent = "Link inválido. Abra novamente a seção pública.";
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            message.textContent = "Link copiado com sucesso!";
        }).catch(() => {
            fallbackCopyText(text, message);
        });
    } else {
        fallbackCopyText(text, message);
    }
}

function fallbackCopyText(text, message) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        message.textContent = "Link copiado com sucesso!";
    } catch (err) {
        message.textContent = "Erro ao copiar. Selecione e copie manualmente.";
    }
    document.body.removeChild(textArea);
}

function desenharPublico() {
    const div = document.getElementById("publicResultados");
    div.innerHTML = "";

    const titulo = document.createElement("h3");
    titulo.textContent = "Ranking público";
    div.appendChild(titulo);

    const ordenados = [...participantes].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    ordenados.forEach((p, index) => {
        const item = document.createElement("div");
        item.className = "public-item";

        const foto = document.createElement("img");
        foto.className = "public-foto";
        foto.alt = p.nome;
        foto.src = p.foto || "";
        if (!p.foto) {
            foto.hidden = true;
        }

        const info = document.createElement("div");
        info.className = "public-info";
        info.innerHTML = `
            <strong>${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""} ${p.nome}</strong>
            <span>${p.pontos || 0} pts</span>
        `;

        item.appendChild(foto);
        item.appendChild(info);
        div.appendChild(item);
    });
}

function desenharResultados() {
    const div = document.getElementById("listaResultados");
    div.innerHTML = "";

    roundKeys.forEach(roundKey => {
        const titulo = roundTitles[roundKey];
        const matches = gerarMatches(roundKey, officialResults);
        div.innerHTML += `<div class="section-title"><h3>${titulo}</h3></div>`;

        matches.forEach((match, matchIndex) => {
            const escolhido = officialResults[roundKey][matchIndex] || "";
            div.innerHTML += `
                <div class="jogo">
                    <h3>${titulo} - Jogo ${matchIndex + 1}</h3>
                    <div class="match-label">${match[0]} x ${match[1]}</div>
                    <div class="match-row">
                        <button class="${escolhido === match[0] ? "selected" : ""}" onclick="escolherResultado('${roundKey}', ${matchIndex}, '${match[0]}')" ${match[0] === 'A definir' ? 'disabled' : ''}>${match[0]}</button>
                        <button class="${escolhido === match[1] ? "selected" : ""}" onclick="escolherResultado('${roundKey}', ${matchIndex}, '${match[1]}')" ${match[1] === 'A definir' ? 'disabled' : ''}>${match[1]}</button>
                    </div>
                </div>
            `;
        });
    });
}

function escolherResultado(roundKey, matchIndex, team) {
    limparRodadasPosteriores(officialResults, roundKey);
    officialResults[roundKey][matchIndex] = team;
    if (roundKey === "final") {
        officialResults.campeao = team;
    }
    salvarResultados();
    desenharResultados();
}

function calcularPontuacao() {
    participantes.forEach(participante => {
        participante.pontos = calcularPontos(participante);
    });
    salvarParticipantes();
    mostrarRanking();
    alert("Pontuação atualizada.");
}

function calcularPontos(participante) {
    let pontos = 0;

    roundKeys.forEach(roundKey => {
        const oficialMatches = gerarMatches(roundKey, officialResults);
        const participantMatches = gerarMatches(roundKey, participante.chaveamento);

        oficialMatches.forEach((officialMatch, index) => {
            const participantPick = participante.chaveamento[roundKey][index];
            const officialWinner = officialResults[roundKey][index];
            const participantMatch = participantMatches[index];
            if (!participantPick || !officialWinner || !participantMatch || !officialMatch) return;

            if (mesmoConfronto(participantMatch, officialMatch) && participantPick === officialWinner) {
                pontos++;
            }
        });
    });

    if (participante.chaveamento.campeao && officialResults.campeao && participante.chaveamento.campeao === officialResults.campeao) {
        pontos++;
    }

    return pontos;
}

function mesmoConfronto(matchA, matchB) {
    if (!matchA || !matchB) return false;
    return (matchA[0] === matchB[0] && matchA[1] === matchB[1]) || (matchA[0] === matchB[1] && matchA[1] === matchB[0]);
}

function mostrarRanking() {
    const div = document.getElementById("listaRanking");
    div.innerHTML = "";
    const ordenados = [...participantes].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));

    ordenados.forEach((p, index) => {
        const medalha = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
        div.innerHTML += `
            <div class="ranking-item">
                <div class="ranking-left">
                    <img class="ranking-foto" src="${p.foto || ""}" ${p.foto ? "" : "hidden"} alt="${p.nome}">
                    <span>${medalha} ${p.nome}</span>
                </div>
                <strong>${p.pontos || 0} pts</strong>
            </div>
        `;
    });
}

function abrirRanking() {
    mostrarSecao("ranking");
    mostrarRanking();
}

function atualizarCampeaoPreview() {
    const preview = document.getElementById("campeaoPreview");
    if (!preview || participanteAtual === null) return;
    const participante = participantes[participanteAtual];
    if (participante && participante.chaveamento && participante.chaveamento.campeao) {
        preview.textContent = `Campeão: ${participante.chaveamento.campeao}`;
    } else {
        preview.textContent = "Campeão: ainda não definido";
    }
}
