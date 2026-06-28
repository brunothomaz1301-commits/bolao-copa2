Ir para o conteúdo
brunothomaz1301-commits
bolao-copa2
Navegação do repositório
Código
Problemas
Solicitações de pull
Agentes
Ações
Projetos
Wiki
Segurança e qualidade
Percepções
Configurações
Arquivos
Acesse o arquivo
t
T
.github
index.html
script.js
estilo.css
bolao-copa2
/
script.js
em
principal

Editar

Pré-visualização
Modo de recuo

Espaços
Tamanho do recuo

4
modo de quebra de linha

Sem embrulho
Editando o conteúdo do arquivo script.js
  1
  2
  3
  4
  5
  6
  7
  8
  9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
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
            prevWinners[1] || "A definir",
            prevWinners[3] || "A definir"
        ]);

        return matches;
    }

    for (let i = 0; i < count; i++) {
        const a = prevWinners[i * 2] || "A definir";
        const b = prevWinners[i * 2 + 1] || "A definir";
        matches.push([a, b]);
    }

    return matches;
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
        lista.innerHTML = '<p>Nenhum participante cadastrado ainda.</p>';
        return;
    }

    participantes.forEach((participante) => {
        const card = document.createElement("div");
        card.className = "participante";
        card.innerHTML = `
            <span onclick="abrirPerfil(${participante.id})">${participante.nome}</span>
            <button onclick="removerParticipante(${participante.id})">Remover</button>
        `;
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
        bloco.className = "jogo";
        bloco.innerHTML = `<h3>${roundTitles[roundKey]}</h3>`;

        if (roundKey === "final") {
            bloco.innerHTML += `<div class="match-label">Escolha o campeão</div>`;
        } else {
            bloco.innerHTML += `<div class="match-label">Escolha os vencedores</div>`;
        }

        matches.forEach((match, index) => {
            const card = document.createElement("div");
            card.className = "match-row";
            card.innerHTML = `
                <button type="button" class="${participanteAtual.palpites[roundKey][index] === match[0] ? "selected" : ""}" onclick="selecionarPalpite('${roundKey}', ${index}, '${match[0]}')">${match[0]}</button>
                <button type="button" class="${participanteAtual.palpites[roundKey][index] === match[1] ? "selected" : ""}" onclick="selecionarPalpite('${roundKey}', ${index}, '${match[1]}')">${match[1]}</button>
            `;
            bloco.appendChild(card);
        });

        container.appendChild(bloco);
    });

    const campeaoPreview = document.getElementById("campeaoPreview");
    campeaoPreview.textContent = `Campeão: ${participanteAtual.palpites.campeao || "ainda não definido"}`;
}

function selecionarPalpite(roundKey, index, teamName) {
    if (!participanteAtual) {
        return;
    }

    if (roundKey === "final") {
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
        bloco.className = "jogo";
        bloco.innerHTML = `<h3>${roundTitles[roundKey]}</h3>`;

        matches.forEach((match, index) => {
            const card = document.createElement("div");
            card.className = "match-row";
            card.innerHTML = `
                <button type="button" class="${officialResults[roundKey][index] === match[0] ? "selected" : ""}" onclick="registrarResultado('${roundKey}', ${index}, '${match[0]}')">${match[0]}</button>
                <button type="button" class="${officialResults[roundKey][index] === match[1] ? "selected" : ""}" onclick="registrarResultado('${roundKey}', ${index}, '${match[1]}')">${match[1]}</button>
            `;
            bloco.appendChild(card);
        });

        container.appendChild(bloco);
    });

    const campeao = document.createElement("div");
    campeao.className = "champion-row";
    campeao.innerHTML = `
        <div class="result-badge">Campeão oficial: ${officialResults.campeao || "ainda não definido"}</div>
        <div class="match-row">
            <button type="button" onclick="registrarCampeao('Brasil')">Brasil</button>
            <button type="button" onclick="registrarCampeao('Argentina')">Argentina</button>
        </div>
    `;
    container.appendChild(campeao);
}

function registrarResultado(roundKey, index, teamName) {
    if (!officialResults[roundKey]) {
        officialResults[roundKey] = [];
    }

    officialResults[roundKey][index] = teamName;
    salvarResultados();
    renderResultados();
}

function registrarCampeao(teamName) {
    officialResults.campeao = teamName;
    salvarResultados();
    renderResultados();
}

function calcularPontuacao() {
    const participantesComPontos = participantes.map((participante) => {
        let pontos = 0;

        roundKeys.forEach((roundKey) => {
            const palpites = participante.palpites[roundKey] || [];
            const resultados = officialResults[roundKey] || [];
            palpites.forEach((palpite, index) => {
                if (palpite && resultados[index] && palpite === resultados[index]) {
                    pontos += 1;
                }
            });
        });

        if (participante.palpites.campeao && officialResults.campeao && participante.palpites.campeao === officialResults.campeao) {
            pontos += 5;
        }

        return { ...participante, pontos };
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
        lista.innerHTML = '<p>Nenhum participante para rankear.</p>';
        return;
    }

    participantes.forEach((participante, index) => {
        const item = document.createElement("div");
        item.className = "ranking-item";
        item.innerHTML = `
            <div class="ranking-left">
                ${participante.foto ? `<img class="ranking-foto" src="${participante.foto}" alt="${participante.nome}">` : "<div class=\"ranking-foto\"></div>"}
                <div>
                    <strong>#${index + 1} ${participante.nome}</strong>
                    <div>${participante.pontos ?? 0} pontos</div>
                </div>
            </div>
            <div>${participante.pontos ?? 0}</div>
        `;
        lista.appendChild(item);
    });
}

function inicializar() {
    renderParticipantes();
    renderResultados();
    renderRanking();
    mostrarInicio();
}

window.addEventListener("DOMContentLoaded", inicializar);
Use Control + Shift + mpara alternar o tabfoco da tecla. Como alternativa, use escpara tabmover para o próximo elemento interativo na página.
