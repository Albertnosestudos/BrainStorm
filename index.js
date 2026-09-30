document.addEventListener("DOMContentLoaded", () => {
 
  const navButtons = document.querySelectorAll(".sidebar-nav .nav-item");
  const views = document.querySelectorAll(".conteudo .view");
 
  const prefs = {
    tema: "vinho",
    cores: {
      fundo: "#050308",
      painel: "#1a0610",
      borda: "#4a2030",
      destaque: "#c41e3a",
      texto: "#f2e8ea",
      texto2: "#a08088"
    },
    fonte: 100,
    fonteMapa: 100,
    autoEncaixar: true,
    tesoura: true,
    contato: { nome: "", email: "", recado: "" }
  };
 
  const TEMAS = {
    vinho: { fundo: "#050308", painel: "#1a0610", borda: "#4a2030", destaque: "#c41e3a", texto: "#f2e8ea", texto2: "#a08088" },
    noite: { fundo: "#070b14", painel: "#10182a", borda: "#2a3a5a", destaque: "#3d8bff", texto: "#e8eef8", texto2: "#8a9bb8" },
    areia: { fundo: "#1a140c", painel: "#2a2014", borda: "#5a4830", destaque: "#c4a035", texto: "#f4ead8", texto2: "#b8a078" },
    floresta: { fundo: "#07140c", painel: "#0e2416", borda: "#1e4a2c", destaque: "#2a9a52", texto: "#e6f4ea", texto2: "#7aaa88" },
    claro: { fundo: "#f4eee8", painel: "#ffffff", borda: "#d8c8c0", destaque: "#c41e3a", texto: "#241418", texto2: "#6a5860" }
  };
 
  const appEl = document.querySelector(".app");
  const btnMenu = document.getElementById("btn-menu");
 
  function recolherMenu() {
    if (appEl) {
      appEl.classList.add("menu-recolhido");
    }
  }
 
  function abrirMenu() {
    if (appEl) {
      appEl.classList.remove("menu-recolhido");
    }
  }
 
  if (btnMenu) {
    btnMenu.addEventListener("click", abrirMenu);
  }
 
  const btnFecharMenu = document.getElementById("btn-fechar-menu");
  if (btnFecharMenu) {
    btnFecharMenu.addEventListener("click", recolherMenu);
  }
 
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetViewId = button.getAttribute("data-view");
 
      navButtons.forEach((btn) => btn.classList.remove("active"));
      views.forEach((view) => view.classList.remove("active"));
 
      button.classList.add("active");
      recolherMenu();
 
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add("active");
        if (targetViewId === "view-roadmap") {
          setTimeout(() => {
            renderizarRoadmap();
            abrirVistaInicial();
          }, 50);
        }
      }
    });
  });
 
  const navButtonsDireita = document.querySelectorAll(".painel-direita-button");
  const navButtonsConteudo = document.querySelectorAll(".aba-conteudo");
 
  function abrirAba(id) {
    navButtonsDireita.forEach((btn) => btn.classList.remove("active"));
    navButtonsConteudo.forEach((aba) => aba.classList.remove("ativa"));
 
    const botao = document.querySelector('.painel-direita-button[data-tab="' + id + '"]');
    const aba = document.getElementById(id);
    if (botao) {
      botao.classList.add("active");
    }
    if (aba) {
      aba.classList.add("ativa");
    }
  }
 
  navButtonsDireita.forEach((button) => {
    button.addEventListener("click", () => {
      abrirAba(button.getAttribute("data-tab"));
    });
  });
 
  const selectJogo = document.getElementById("jogo-atual");
  const seletorBtn = document.getElementById("jogo-seletor-btn");
  const seletorLista = document.getElementById("jogo-seletor-lista");
  const hubJogo = document.getElementById("hub-jogo");
 
  function atualizarNomeHub(texto) {
    const nome = texto == null ? seletorBtn.textContent : texto;
    if (hubJogo) {
      hubJogo.textContent = (!nome || nome === "Escolha um jogo") ? "JOGO" : nome;
    }
  }
  const dadosJogos = {};
  let jogoAnterior = selectJogo.value;
 
  function atualizarListaCustom() {
    seletorLista.innerHTML = "";
 
    const opcoes = [...selectJogo.options];
    if (opcoes.length <= 1) {
      const vazio = document.createElement("li");
      vazio.className = "vazio";
      vazio.textContent = "Crie uma ideia primeiro";
      seletorLista.appendChild(vazio);
      return;
    }
 
    opcoes.forEach((opt) => {
      if (!opt.value) {
        return;
      }
      const li = document.createElement("li");
      li.textContent = opt.textContent;
      li.dataset.value = opt.value;
      li.addEventListener("click", (evento) => {
        evento.stopPropagation();
        escolherJogo(opt.value, opt.textContent);
        seletorLista.hidden = true;
      });
      seletorLista.appendChild(li);
    });
  }
 
  function snapshotPilares() {
    return JSON.parse(JSON.stringify(pilares));
  }
 
  let historicoMapa = [];
  let futuroMapa = [];
 
  function snapshotMapa() {
    return {
      pilares: JSON.parse(JSON.stringify(pilares)),
      ligacoesExtras: JSON.parse(JSON.stringify(ligacoesExtras)),
      soltos: JSON.parse(JSON.stringify(soltos)),
      seqNo: seqNo,
      proximaPaleta: proximaPaleta
    };
  }
 
  function aplicarSnapshot(snap) {
    pilares = snap.pilares;
    ligacoesExtras = snap.ligacoesExtras;
    soltos = snap.soltos;
    seqNo = snap.seqNo;
    proximaPaleta = snap.proximaPaleta;
    garantirPosicoes();
    renderizarRoadmap();
    persistirJogoAtual();
    atualizarBotaoDesfazer();
    agendarSalvar();
  }
 
  function atualizarBotaoDesfazer() {
    const btn = document.getElementById("btn-desfazer");
    if (btn) {
      btn.disabled = historicoMapa.length === 0;
    }
    const btnR = document.getElementById("btn-refazer");
    if (btnR) {
      btnR.disabled = futuroMapa.length === 0;
    }
  }
 
  function empilharUndo() {
    historicoMapa.push(snapshotMapa());
    if (historicoMapa.length > 40) {
      historicoMapa.shift();
    }
    futuroMapa = [];
    atualizarBotaoDesfazer();
  }
 
  function desfazerMapa() {
    if (!historicoMapa.length) {
      return;
    }
    futuroMapa.push(snapshotMapa());
    aplicarSnapshot(historicoMapa.pop());
  }
 
  function refazerMapa() {
    if (!futuroMapa.length) {
      return;
    }
    historicoMapa.push(snapshotMapa());
    if (historicoMapa.length > 40) {
      historicoMapa.shift();
    }
    aplicarSnapshot(futuroMapa.pop());
  }
 
  function registrarAtividade(texto) {
    const historico = document.querySelector(".lista-atividade");
    if (!historico) {
      return;
    }
    const registro = document.createElement("li");
    const spanTexto = document.createElement("span");
    const hora = document.createElement("span");
    spanTexto.classList.add("atividade-texto");
    hora.classList.add("atividade-hora");
    spanTexto.textContent = texto;
    hora.textContent = new Date().toLocaleString("pt-BR");
    registro.appendChild(spanTexto);
    registro.appendChild(hora);
    historico.prepend(registro);
    while (historico.children.length > 20) {
      historico.removeChild(historico.lastChild);
    }
  }
 
  function aposMudarMapa() {
    persistirJogoAtual();
    agendarSalvar();
  }
 
  function atualizarListasVazias() {
    const listaEl = document.querySelector(".lista-ideias");
    const ideiasVazia = document.getElementById("ideias-vazia");
    if (ideiasVazia && listaEl) {
      ideiasVazia.hidden = listaEl.querySelectorAll(".card-ideia").length > 0;
    }
  }
 
  function persistirJogoAtual() {
    if (!jogoAnterior) {
      return;
    }
    const ficha = lerFicha();
    dadosJogos[jogoAnterior] = {
      campos: ficha.campos,
      imagens: ficha.imagens,
      pilares: snapshotPilares(),
      seqNo: seqNo,
      proximaPaleta: proximaPaleta,
      ligacoesExtras: JSON.parse(JSON.stringify(ligacoesExtras)),
      soltos: JSON.parse(JSON.stringify(soltos))
    };
  }
 
   function mapaEhTemplateVelho(lista) {
     if (!Array.isArray(lista) || !lista.length) {
       return true;
     }
     const bruto = JSON.stringify(lista);
     if (bruto.indexOf("golpear, esquivar") === -1) {
       return true;
     }
     const ids = lista.map((p) => p.id);
     return ids.indexOf("verbo-central") !== -1 || ids.indexOf("espaco") !== -1 || ids.indexOf("feedback-feel") !== -1;
   }
 
   function carregarRoadmapDoJogo(valor) {
     const dados = dadosJogos[valor];
     if (dados && Array.isArray(dados.pilares) && dados.pilares.length && !mapaEhTemplateVelho(dados.pilares)) {
      pilares = JSON.parse(JSON.stringify(dados.pilares));
      if (typeof dados.seqNo === "number") {
        seqNo = dados.seqNo;
      }
      if (typeof dados.proximaPaleta === "number") {
        proximaPaleta = dados.proximaPaleta;
      }
      ligacoesExtras = Array.isArray(dados.ligacoesExtras) ? JSON.parse(JSON.stringify(dados.ligacoesExtras)) : [];
      soltos = Array.isArray(dados.soltos) ? JSON.parse(JSON.stringify(dados.soltos)) : [];
    } else {
      resetarMapaPadrao();
      if (!dadosJogos[valor]) {
        dadosJogos[valor] = {};
      }
      dadosJogos[valor].pilares = snapshotPilares();
      dadosJogos[valor].seqNo = seqNo;
      dadosJogos[valor].proximaPaleta = proximaPaleta;
      dadosJogos[valor].ligacoesExtras = [];
      dadosJogos[valor].soltos = [];
    }
     garantirPosicoes();
     sincronizarSeqNo();
     migrarSubramos();
   }
 
     function escolherJogo(valor, texto) {
      persistirJogoAtual();
      selectJogo.value = valor;
      seletorBtn.textContent = texto || "Escolha um jogo";
      atualizarNomeHub(seletorBtn.textContent);
      escreverFicha(dadosJogos[valor]);
      carregarRoadmapDoJogo(valor);
      jogoAnterior = valor;
      historicoMapa = [];
      futuroMapa = [];
      atualizarBotaoDesfazer();
      mostrarPainel();
        renderizarRoadmap();
        abrirVistaInicial();
    }
 
   seletorBtn.addEventListener("click", (evento) => {
     evento.stopPropagation();
     atualizarListaCustom();
    seletorLista.hidden = !seletorLista.hidden;
  });
 
  document.addEventListener("click", () => {
    seletorLista.hidden = true;
  });
 
  function lerFicha() {
    const campos = {};
    document.querySelectorAll(".aba-conteudo textarea").forEach((campo, i) => {
      campos[i] = campo.value;
    });
 
    const imagens = {};
    document.querySelectorAll(".aba-conteudo").forEach((aba) => {
      imagens[aba.id] = [...aba.querySelectorAll(".galeria-refs img")].map((img) => img.src);
    });
 
    return { campos: campos, imagens: imagens };
  }
 
  function escreverFicha(dados) {
    const campos = dados && dados.campos ? dados.campos : dados;
    document.querySelectorAll(".aba-conteudo textarea").forEach((campo, i) => {
      campo.value = campos && campos[i] ? campos[i] : "";
    });
 
    document.querySelectorAll(".aba-conteudo").forEach((aba) => {
      const galeria = aba.querySelector(".galeria-refs");
      if (!galeria) {
        return;
      }
      galeria.querySelectorAll("img").forEach((img) => img.remove());
      const lista = dados && dados.imagens ? dados.imagens[aba.id] : null;
      if (lista) {
        lista.forEach((src) => inserirMiniatura(galeria, src));
      }
    });
  }
 
  function salvarJogoAtual() {
    persistirJogoAtual();
    agendarSalvar();
  }
 
  document.querySelectorAll(".aba-conteudo textarea").forEach((campo) => {
    campo.addEventListener("input", salvarJogoAtual);
  });
 
  function inserirMiniatura(galeria, src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Referencia";
    img.title = "Clique para remover";
    img.addEventListener("click", () => {
      img.remove();
      salvarJogoAtual();
    });
    const botao = galeria.querySelector(".btn-add-imagem");
    galeria.insertBefore(img, botao);
  }
 
  document.querySelectorAll(".aba-conteudo").forEach((aba) => {
    const titulo = document.createElement("h4");
    titulo.textContent = "Imagens de referencia";
 
    const galeria = document.createElement("div");
    galeria.className = "galeria-refs";
 
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn-add-imagem";
    botao.textContent = "+ Adicionar imagem";
 
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.hidden = true;
 
    botao.addEventListener("click", () => input.click());
 
    input.addEventListener("change", () => {
      const arquivos = [...(input.files || [])];
      input.value = "";
      arquivos.forEach((arquivo) => {
        const leitor = new FileReader();
        leitor.onload = () => {
          inserirMiniatura(galeria, leitor.result);
          salvarJogoAtual();
        };
        leitor.readAsDataURL(arquivo);
      });
    });
 
    galeria.appendChild(botao);
    aba.appendChild(titulo);
    aba.appendChild(galeria);
    aba.appendChild(input);
  });
 
  const viewport = document.getElementById("roadmap-viewport");
  const canvas = document.getElementById("roadmap-canvas");
 
  const svgLacos = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLacos.setAttribute("id", "roadmap-linhas");
  canvas.prepend(svgLacos);
 
  let CANVAS_W = 4000;
  let CANVAS_H = 2800;
  const CENTRO_X = 2000;
  const CENTRO_Y = 1400;
  const ZOOM_MIN = 0.08;
  const ZOOM_MAX = 2.4;
  const ZOOM_PAI = 2.4;
  const ZOOM_FILHO = 2.4;
  const ZOOM_NETO = 2.4;
  let zoomMinAtual = ZOOM_MIN;
  const STORAGE_KEY = "brainstorm-v1";
  let persistenciaLigada = false;
 
  function pontoCliente(evento) {
    if (evento.touches && evento.touches[0]) {
      return { x: evento.touches[0].clientX, y: evento.touches[0].clientY };
    }
    if (evento.changedTouches && evento.changedTouches[0]) {
      return { x: evento.changedTouches[0].clientX, y: evento.changedTouches[0].clientY };
    }
    return { x: evento.clientX, y: evento.clientY };
  }
  let timerSalvar = null;
 
  const PALETAS = [
    { pai: "#01516b", filho: "#016b8f", fio: "#012a38", borda: "#2a9bb8" },
    { pai: "#551b37", filho: "#7d2650", fio: "#2a0c1a", borda: "#c44a90" },
    { pai: "#093b0d", filho: "#0d6414", fio: "#041e07", borda: "#2a9a32" },
    { pai: "#aa720b", filho: "#cc890c", fio: "#5a3c06", borda: "#c4a035" },
    { pai: "#422558", filho: "#522d6e", fio: "#241436", borda: "#8a5aaa" },
    { pai: "#6d2e15", filho: "#8b3a1a", fio: "#3a180a", borda: "#c45a2a" },
    { pai: "#1a3242", filho: "#213e53", fio: "#0c1a24", borda: "#4a8aaa" }
  ];
 
  let proximaPaleta = 0;
 
   function clonarPaleta(cor) {
     return { pai: cor.pai, filho: cor.filho, fio: cor.fio, borda: cor.borda };
   }
 
   function paletaDaVez() {
     const cor = clonarPaleta(PALETAS[proximaPaleta % PALETAS.length]);
     proximaPaleta += 1;
     return cor;
   }
 
   function coresIguais(a, b) {
     return a && b && a.pai === b.pai && a.filho === b.filho && a.borda === b.borda;
   }
 
  let seqNo = 0;
    function filhoObj(nome, filhos, nota) {
      seqNo += 1;
      return { id: "f-" + seqNo, nome: nome, filhos: filhos || [], feito: false, nota: nota || "", x: null, y: null, fixo: false, minimizado: false };
    }
 
  function migrarSubramos() {
    pilares.forEach((pilar) => {
      (pilar.filhos || []).forEach((filho) => {
        if (filho.minimizado === true && filho.subramoManual !== true) {
          filho.minimizado = false;
        }
        (filho.filhos || []).forEach((neto) => {
          if (neto.minimizado === true && neto.subramoManual !== true) {
            neto.minimizado = false;
          }
        });
      });
    });
  }
 
  function sincronizarSeqNo() {
    let max = 0;
    function andar(no) {
      if (!no) {
        return;
      }
      const m = String(no.id || "").match(/^f-(\d+)$/);
      if (m) {
        max = Math.max(max, Number(m[1]));
      }
      (no.filhos || []).forEach(andar);
    }
    pilares.forEach(andar);
    soltos.forEach(andar);
    if (seqNo < max) {
      seqNo = max;
    }
  }
 
  function resetarMapaPadrao() {
    pilares = pilaresPadrao();
    ligacoesExtras = [];
    soltos = [];
     proximaPaleta = 9;
    historicoMapa = [];
    futuroMapa = [];
    zoomPilarId = null;
    garantirPosicoes();
    atualizarBotaoDesfazer();
  }
 
    function posPilarPadrao(indice, total) {
      const n = Math.max(total, 1);
      const angulo = (indice / n) * Math.PI * 2 - Math.PI / 2;
      const raio = Math.max(780, 88 * n);
      return {
        x: CENTRO_X - 120 + Math.cos(angulo) * raio,
        y: CENTRO_Y - 45 + Math.sin(angulo) * raio * 0.92
      };
    }
 
    function colapsarTodosOsRamos() {
      pilares.forEach((pilar) => {
        pilar.minimizado = true;
      });
    }
 
    function layoutPaisBaguncado() {
      if (!pilares.length) {
        return false;
      }
      const minDist = 340;
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < pilares.length; i += 1) {
        const a = pilares[i];
        const ax = Number.isFinite(a.x) ? a.x : CENTRO_X;
        const ay = Number.isFinite(a.y) ? a.y : CENTRO_Y;
        const cx = ax + 120;
        const cy = ay + 45;
        sx += cx;
        sy += cy;
        if (Math.hypot(cx - CENTRO_X, cy - CENTRO_Y) < 380) {
          return true;
        }
        for (let j = i + 1; j < pilares.length; j += 1) {
          const b = pilares[j];
          const bx = Number.isFinite(b.x) ? b.x : CENTRO_X;
          const by = Number.isFinite(b.y) ? b.y : CENTRO_Y;
          if (Math.hypot(ax - bx, ay - by) < minDist) {
            return true;
          }
        }
      }
      const n = pilares.length;
      return Math.hypot(sx / n - CENTRO_X, sy / n - CENTRO_Y) > 160;
    }
 
    function organizarPaisEmAnel() {
      const n = Math.max(pilares.length, 1);
      pilares.forEach((pilar, i) => {
        if (pilar.fixo) {
          return;
        }
        const dest = posPilarPadrao(i, n);
        const origemX = Number.isFinite(pilar.x) ? pilar.x : dest.x;
        const origemY = Number.isFinite(pilar.y) ? pilar.y : dest.y;
        const dx = dest.x - origemX;
        const dy = dest.y - origemY;
        pilar.x = dest.x;
        pilar.y = dest.y;
        if (dx || dy) {
          moverRamo(pilar, dx, dy);
        }
      });
    }
 
   function pilaresPadrao() {
     seqNo = 0;
     const n = 9;
     const p0 = posPilarPadrao(0, n);
     const p1 = posPilarPadrao(1, n);
     const p2 = posPilarPadrao(2, n);
     const p3 = posPilarPadrao(3, n);
     const p4 = posPilarPadrao(4, n);
     const p5 = posPilarPadrao(5, n);
     const p6 = posPilarPadrao(6, n);
     const p7 = posPilarPadrao(7, n);
     const p8 = posPilarPadrao(8, n);
     return [
       {
          id: "core-loop",
          nome: "Core Loop",
          x: p0.x,
          y: p0.y,
          aba: "gameplay",
          cores: clonarPaleta(PALETAS[0]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "Copia a tabela, escolhe o genero, preenche 30s e 5min. Marca so o que vale pra este jogo.",
         filhos: [
           filhoObj("Loop de 30s: entra → age → resposta → decide de novo", [
             filhoObj("Entra no espaco / situacao"),
             filhoObj("Age com o verbo central"),
             filhoObj("Recebe resposta clara"),
             filhoObj("Decide de novo")
           ]),
           filhoObj("Verbo central (escolhe 1 genero ou mistura 2)", [
             filhoObj("Acao/Combate: atacar — golpear, esquivar — flash, hitstop — item, XP, drop"),
             filhoObj("Plataforma: pular — correr, saltar, aterrissar — som, poeira — coletavel, checkpoint"),
             filhoObj("Puzzle: resolver — observar, testar, encaixar — som acerto/erro — fase avanca, estrelas"),
             filhoObj("Construcao/Sim: construir — posicionar, conectar, gerenciar — som de encaixe — recurso, desbloqueio"),
             filhoObj("Corrida: acelerar — curvar, frear, ultrapassar — motor, rastro — posicao, tempo, moeda"),
             filhoObj("Furtividade: evitar/infiltrar — observar padrao, esconder — icone de alerta — progresso sem ser visto"),
             filhoObj("Ritmo/Musica: acertar o tempo — tocar no beat — flash, combo sonoro — pontuacao, combo"),
             filhoObj("RPG: explorar/lutar — combater, coletar, conversar — barra de vida, dano — XP, equipamento"),
             filhoObj("Idle/Clicker: coletar — clicar, esperar, comprar upgrade — numero sobe — multiplicador, prestigio"),
             filhoObj("Terror/Survival: sobreviver — gerenciar recurso, fugir, esconder — som ambiente — continuar vivo, item raro"),
             filhoObj("Cartas/Estrategia: decidir — jogar carta, planejar turno — animacao de carta — vantagem, vitoria"),
             filhoObj("Tower Defense: posicionar — colocar torre, upgrade — tiro, explosao — ouro, onda vencida")
           ]),
           filhoObj("Loop de 5 min: 30s + 1 obstaculo novo + 1 recompensa", [
             filhoObj("Obstaculo novo: inimigo mais forte, tempo menor, peca extra, curva fechada, deteccao mais rapida"),
             filhoObj("Recompensa clara")
           ]),
           filhoObj("Vitoria da sessao (escolhe 1)", [
             filhoObj("Chegou ao fim da fase / pista / nivel"),
             filhoObj("Sobreviveu X tempo / X ondas"),
             filhoObj("Atingiu pontuacao / meta alvo"),
             filhoObj("Derrotou o chefe da sessao"),
             filhoObj("Completou todos os objetivos opcionais"),
             filhoObj("Tela de resultado: pontuacao + jogar de novo + recompensa (opcional)")
           ])
         ]
       },
       {
          id: "mundo-level-design",
          nome: "Mundo & Level Design",
          x: p1.x,
          y: p1.y,
          aba: "mundo",
          cores: clonarPaleta(PALETAS[2]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "Espaco minimo jogavel. Um so, curto o bastante pra testar.",
         filhos: [
           filhoObj("Espaco minimo jogavel (escolhe 1 tipo)", [
             filhoObj("Tipo: arena, sala de puzzle, fase linear, pista, tabuleiro/grid ou mapa aberto pequeno"),
             filhoObj("Layout legivel: da pra ir/agir sem tutorial escrito"),
             filhoObj("Limites claros: parede, queda, borda do tabuleiro, fim de pista"),
             filhoObj("1 variacao no prototipo: altura, cobertura, atalho ou obstaculo destrutivel")
           ]),
           filhoObj("Oponente / desafio-tipo", [
             filhoObj("Inimigo: idle + perseguicao + 1 ataque"),
             filhoObj("Puzzle com 1 regra nova / obstaculo de tempo / adversario IA / padrao de deteccao"),
             filhoObj("Regra de colisao: quando conta como acertou ou resolveu")
           ]),
           filhoObj("Objetivo fisico no espaco", [
             filhoObj("Porta/saida, item a coletar, alvo a eliminar, linha de chegada ou ultima peca"),
             filhoObj("Rota minima de ~20s ate o objetivo"),
             filhoObj("Fecha o ciclo e leva de volta ao Core Loop")
           ])
         ]
       },
       {
          id: "artes-visual",
          nome: "Artes & Visual",
          x: p2.x,
          y: p2.y,
          aba: "artes",
          cores: clonarPaleta(PALETAS[1]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "Depois do slice jogavel. Serve o loop, nao o portfolio.",
         filhos: [
           filhoObj("Concepts"),
           filhoObj("Personagens"),
           filhoObj("Cenario / Ambientacao"),
           filhoObj("Animacao"),
           filhoObj("Assets de UI"),
           filhoObj("VFX: particulas, brilhos, explosoes")
         ]
       },
       {
          id: "progressao",
          nome: "Sistema & Progressao",
          x: p3.x,
          y: p3.y,
          aba: "progressao",
          cores: clonarPaleta(PALETAS[3]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "So depois do loop viciar sem XP.",
         filhos: [
           filhoObj("Tipos de moeda", [
             filhoObj("Soft currency"),
             filhoObj("Hard currency"),
             filhoObj("XP"),
             filhoObj("Pontos de habilidade")
           ]),
           filhoObj("Tipos de desbloqueio", [
             filhoObj("Habilidade nova"),
             filhoObj("Area nova"),
             filhoObj("Cosmetico"),
             filhoObj("Slot de inventario")
           ]),
           filhoObj("Habilidades"),
           filhoObj("Experiencia"),
           filhoObj("Conquistas"),
           filhoObj("Loja / Upgrades")
         ]
       },
       {
          id: "build-release",
          nome: "Build & Release",
          x: p4.x,
          y: p4.y,
          aba: null,
          cores: clonarPaleta(PALETAS[6]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "",
         filhos: [
           filhoObj("Historico de versoes: o que mudou em cada build"),
           filhoObj("Checklist de loja", [
             filhoObj("Icone"),
             filhoObj("Nome"),
             filhoObj("Descricao curta / longa"),
             filhoObj("Screenshots"),
             filhoObj("Classificacao etaria"),
             filhoObj("Politica de privacidade")
           ])
         ]
       },
       {
          id: "testes-qa",
          nome: "Testes & QA",
          x: p5.x,
          y: p5.y,
          aba: null,
          cores: clonarPaleta(PALETAS[5]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "",
         filhos: [
           filhoObj("Bugs conhecidos (lista viva)"),
           filhoObj("Playtest — perguntas pra quem testou", [
             filhoObj("Voce entendeu o objetivo sem explicacao?"),
             filhoObj("Em que momento voce ficou entediado?"),
             filhoObj("Em que momento voce morreu/errou sem entender por que?"),
             filhoObj("Voce tentaria jogar de novo agora?")
           ]),
           filhoObj("Balanceamento", [
             filhoObj("Dificuldade sobe rapido demais?"),
             filhoObj("Recompensa compensa o esforco?")
           ])
         ]
       },
       {
          id: "configuracao-menu",
          nome: "Configuracoes",
          x: p6.x,
          y: p6.y,
          aba: "gameplay",
          cores: clonarPaleta(PALETAS[4]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "",
         filhos: [
           filhoObj("Menus", [
             filhoObj("Principal"),
             filhoObj("Pausa")
           ]),
           filhoObj("Opcoes", [
             filhoObj("Volume"),
             filhoObj("Controles"),
             filhoObj("Idioma"),
             filhoObj("Acessibilidade")
           ])
         ]
       },
       {
          id: "mecanicas",
          nome: "Mecanicas",
          x: p7.x,
          y: p7.y,
          aba: "mecanicas",
          cores: clonarPaleta(PALETAS[0]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "Marca so as opcoes do teu verbo. Nao preenche tudo.",
         filhos: [
           filhoObj("Mover", [
             filhoObj("Andar/virar livre"),
             filhoObj("Grid / tile-based"),
             filhoObj("Arrastar peca (match-3, cartas)"),
             filhoObj("Dirigir (veiculo)"),
             filhoObj("Voar / nadar"),
             filhoObj("Acao especial (1 no prototipo): dash, pulo duplo, teleporte curto, deslizar ou grappling"),
             filhoObj("Camera: segue (side-scroll), fixa, livre 3D ou top-down")
           ]),
           filhoObj("Agir (verbo central em detalhe)", [
             filhoObj("Acao basica: ataque leve, empurrar peca, apertar no tempo, plantar item, disparar"),
             filhoObj("Acao com custo: stamina, municao, cooldown, recurso limitado, risco de deteccao"),
             filhoObj("Janela de recuperacao: i-frame, recuo, respiro antes do proximo perigo")
           ]),
           filhoObj("Falhar", [
             filhoObj("Erro: tomar dano, errar tempo, peca errada, ser detectado, ficar sem recurso"),
             filhoObj("Fim de run: vida zerada, tempo esgotado, tabuleiro cheio, capturado"),
             filhoObj("Depois: reinicia a fase, volta ao checkpoint, perde a run ou penalidade parcial")
           ]),
           filhoObj("Feedback (checklist pra qualquer genero)", [
             filhoObj("Acerto: flash, hitstop, som de impacto, particula"),
             filhoObj("Erro/dano: indicador visivel, som de erro, pausa curta pra registrar"),
             filhoObj("Recompensa: som/popup, item no chao, juice ao completar objetivo")
           ])
         ]
       },
       {
          id: "audio",
          nome: "Audio",
          x: p8.x,
          y: p8.y,
          aba: "audio",
          cores: clonarPaleta(PALETAS[4]),
          feito: false,
          minimizado: true,
          fixo: false,
          nota: "Cada acao importante do Core Loop tem som proprio?",
         filhos: [
           filhoObj("Trilha sonora"),
           filhoObj("Efeitos sonoros (SFX)"),
           filhoObj("Vozes / dublagem"),
           filhoObj("Pergunta chave: cada acao importante do Core Loop tem som proprio?")
         ]
       }
     ];
   }
 
  let pilares = pilaresPadrao();
  let ligacoesExtras = [];
  let soltos = [];
  let linhasHit = [];
  let tesouraAlvo = null;
  let ligandoExtra = null;
   proximaPaleta = 9;
 
  const viewRoadmap = document.getElementById("view-roadmap");
  const painelHoverZona = document.getElementById("painel-hover-zona");
  const painelDireita = document.getElementById("painel-direita");
  let painelTravado = false;
  let timerPainel = null;
 
  function temJogo() {
    return Boolean(selectJogo.value);
  }
 
   function tamanhoDoViewport() {
     if (!viewport) {
       return { vw: 800, vh: 600 };
     }
     const vw = viewport.clientWidth || 800;
     const vh = viewport.clientHeight || 600;
     return { vw: vw, vh: vh };
   }
 
   function aposPainelMudar() {
     requestAnimationFrame(() => {
       if (zoomPilarId) {
         const no = acharNoPorId(zoomPilarId);
         if (no && no.tipo === "pai") {
           zoomNoPilar(no.ref.id);
           return;
         }
         if (no && no.tipo === "filho") {
           zoomNoFilho(no.pilar, no.ref);
           return;
         }
         if (no && no.tipo === "neto") {
           zoomNoNeto(no.ref);
           return;
         }
       }
       if (prefs.autoEncaixar) {
         encaixarMapa();
       } else {
         aplicarTransform();
       }
     });
   }
 
   function mostrarPainel(reflow) {
     if (!temJogo() || !viewRoadmap) {
       return;
     }
     const jaVisivel = viewRoadmap.classList.contains("painel-visivel");
     viewRoadmap.classList.remove("sem-jogo");
     viewRoadmap.classList.add("painel-visivel");
     if (!jaVisivel && reflow) {
       aposPainelMudar();
     }
   }
  
   function esconderPainel(reflow) {
     if (!viewRoadmap) {
       return;
     }
     const jaVisivel = viewRoadmap.classList.contains("painel-visivel");
     if (!temJogo()) {
       viewRoadmap.classList.add("sem-jogo");
     }
     viewRoadmap.classList.remove("painel-visivel");
     if (jaVisivel && reflow) {
       aposPainelMudar();
     }
   }
 
  function marcarUsoMapa() {
    if (!temJogo()) {
      return;
    }
    painelTravado = false;
    esconderPainel();
  }
 
  function alternarFicha() {
    if (!temJogo() || !viewRoadmap) {
      return;
    }
     if (viewRoadmap.classList.contains("painel-visivel")) {
       painelTravado = false;
       esconderPainel(true);
       return;
     }
     painelTravado = true;
     mostrarPainel(true);
  }
 
  if (painelHoverZona) {
    painelHoverZona.addEventListener("mouseenter", () => {
      if (!temJogo()) {
        return;
      }
      mostrarPainel();
    });
    painelHoverZona.addEventListener("click", (evento) => {
      evento.preventDefault();
      alternarFicha();
    });
  }
 
  const btnFicha = document.getElementById("btn-ficha");
  if (btnFicha) {
    btnFicha.addEventListener("click", alternarFicha);
  }
  const btnFecharFicha = document.getElementById("btn-fechar-ficha");
  if (btnFecharFicha) {
     btnFecharFicha.addEventListener("click", () => {
       painelTravado = false;
       esconderPainel(true);
     });
  }
 
  if (painelDireita) {
    painelDireita.addEventListener("mouseenter", () => {
      if (timerPainel) {
        clearTimeout(timerPainel);
      }
      painelTravado = true;
    });
    painelDireita.addEventListener("mouseleave", () => {
      painelTravado = false;
      timerPainel = setTimeout(() => {
        if (!painelTravado) {
          esconderPainel();
        }
      }, 280);
    });
  }
 
  let panX = 0;
  let panY = 0;
  let escala = 0.45;
  let zoomPilarId = null;
 
  function atualizarLabelZoom() {
    const el = document.getElementById("zoom-valor");
    if (el) {
      el.textContent = Math.round(escala * 100) + "%";
    }
  }
 
   function aplicarTransform() {
     canvas.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + escala + ")";
     atualizarLabelZoom();
   }
 
  function boundsDoMapa() {
    let minX = CENTRO_X - 120;
    let minY = CENTRO_Y - 90;
    let maxX = CENTRO_X + 120;
    let maxY = CENTRO_Y + 90;
 
    function incluir(x, y, w, h) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
 
         pilares.forEach((pilar) => {
          incluir(pilar.x, pilar.y, 240, 90);
          if (!ramoAberto(pilar)) {
            return;
          }
          pilar.filhos.forEach((filho, i) => {
            const pos = posicaoFilho(pilar, i, pilar.filhos.length);
            incluir(pos.x, pos.y, 180, 56);
            if (!subramoAberto(filho)) {
              return;
            }
            (filho.filhos || []).forEach((_, k) => {
              const posN = posicaoNeto(pos, pilar, k, filho.filhos.length, filho);
              incluir(posN.x, posN.y, 148, 48);
           });
           const nNetos = (filho.filhos || []).length;
           const posBtnNeto = posicaoNeto(pos, pilar, nNetos, nNetos + 1, filho);
           incluir(posBtnNeto.x, posBtnNeto.y, 22, 22);
         });
         const n = pilar.filhos.length;
         const posBtn = posicaoFilho(pilar, n, n + 1);
         incluir(posBtn.x, posBtn.y, 22, 22);
       });
      soltos.forEach((no) => incluir(no.x, no.y, 180, 56));
 
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }
 
   function centralizarNoJogo() {
     if (!viewport) {
       return;
     }
     const tamanho = tamanhoDoViewport();
     panX = tamanho.vw / 2 - CENTRO_X * escala;
     panY = tamanho.vh / 2 - CENTRO_Y * escala;
   }
  
     function encaixarMapa() {
       if (!viewport) {
         return;
       }
       garantirPosicoes();
       const tamanho = tamanhoDoViewport();
       const b = boundsDoMapa();
       const pad = 64;
       const w = Math.max(1, b.maxX - b.minX + pad * 2);
       const h = Math.max(1, b.maxY - b.minY + pad * 2);
       escala = Math.min(tamanho.vw / w, tamanho.vh / h, ZOOM_MAX);
       escala = Math.max(ZOOM_MIN, escala);
       zoomMinAtual = escala;
       centralizarNoJogo();
       zoomPilarId = null;
       document.querySelectorAll(".no-pilar, .no-filho, .no-neto").forEach((el) => el.classList.remove("focado"));
       aplicarTransform();
     }
 
      function abrirVistaInicial() {
        colapsarTodosOsRamos();
        if (layoutPaisBaguncado()) {
          organizarPaisEmAnel();
        }
        garantirPosicoes();
        renderizarRoadmap();
        encaixarMapa();
      }
  
    function aplicarZoomEmPonto(novaEscala, clientX, clientY) {
      if (!viewport) {
        return;
      }
      const rect = viewport.getBoundingClientRect();
      const px = clientX != null ? clientX - rect.left : rect.width / 2;
      const py = clientY != null ? clientY - rect.top : rect.height / 2;
      const mundoX = (px - panX) / escala;
      const mundoY = (py - panY) / escala;
      escala = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, novaEscala));
      panX = px - mundoX * escala;
      panY = py - mundoY * escala;
      aplicarTransform();
    }
  
    function ramoAberto(pilar) {
      return pilar && pilar.minimizado === false;
    }
 
      function zoomParaBounds(b, teto) {
        if (!viewport || !b) {
          return;
        }
        const tamanho = tamanhoDoViewport();
        const pad = 72;
        const w = Math.max(1, b.maxX - b.minX + pad * 2);
        const h = Math.max(1, b.maxY - b.minY + pad * 2);
        const fit = Math.min(tamanho.vw / w, tamanho.vh / h, teto || ZOOM_MAX);
        escala = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fit));
        const cx = (b.minX + b.maxX) / 2;
        const cy = (b.minY + b.maxY) / 2;
        panX = tamanho.vw / 2 - cx * escala;
        panY = tamanho.vh / 2 - cy * escala;
        aplicarTransform();
      }
 
      function subramoAberto(no) {
        return !no || no.minimizado !== true;
      }
 
  function marcarFoco(id) {
    zoomPilarId = id;
    document.querySelectorAll(".no-pilar, .no-filho, .no-neto").forEach((el) => {
      el.classList.toggle("focado", el.dataset.id === id);
    });
  }
 
  function boundsDoPilar(pilar) {
    let minX = pilar.x;
    let minY = pilar.y;
     let maxX = pilar.x + 240;
     let maxY = pilar.y + 90;
 
    function incluir(x, y, w, h) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
 
      if (ramoAberto(pilar)) {
        pilar.filhos.forEach((filho, i) => {
          const pos = posicaoFilho(pilar, i, pilar.filhos.length);
           incluir(pos.x, pos.y, 180, 56);
           if (!subramoAberto(filho)) {
             return;
           }
           (filho.filhos || []).forEach((_, k) => {
             const posN = posicaoNeto(pos, pilar, k, filho.filhos.length, filho);
             incluir(posN.x, posN.y, 148, 48);
          });
          const nNetos = (filho.filhos || []).length;
          const posBtnNeto = posicaoNeto(pos, pilar, nNetos, nNetos + 1, filho);
          incluir(posBtnNeto.x, posBtnNeto.y, 22, 22);
        });
  
       const n = pilar.filhos.length;
       const posBtn = posicaoFilho(pilar, n, n + 1);
       incluir(posBtn.x, posBtn.y, 22, 22);
     }
 
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }
 
    function expandirPilar(pilar) {
      if (!pilar) {
        return;
      }
      pilar.minimizado = false;
      espalharFilhos(pilar);
      garantirPosicoes();
      separarSobrepostos();
      renderizarRoadmap();
    }
 
   function zoomNoPilar(id) {
     const pilar = pilares.find((p) => p.id === id);
     if (!pilar || !viewport) {
       return;
     }
     if (!ramoAberto(pilar)) {
       expandirPilar(pilar);
     }
     marcarFoco(id);
     zoomParaBounds(boundsDoPilar(pilar), ZOOM_PAI);
   }
 
  function boundsDoFilho(pilar, filho) {
    const pos = { x: filho.x, y: filho.y };
    let minX = pos.x;
    let minY = pos.y;
     let maxX = pos.x + 180;
     let maxY = pos.y + 56;
 
    function incluir(x, y, w, h) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
 
    if (subramoAberto(filho)) {
      (filho.filhos || []).forEach((neto, k) => {
        if (!subramoAberto(neto)) {
          incluir(neto.x || 0, neto.y || 0, 148, 48);
          return;
        }
        const posN = posicaoNeto(pos, pilar, k, filho.filhos.length, filho);
        incluir(posN.x, posN.y, 148, 48);
      });
      const nNetos = (filho.filhos || []).length;
      const posBtnNeto = posicaoNeto(pos, pilar, nNetos, nNetos + 1, filho);
      incluir(posBtnNeto.x, posBtnNeto.y, 22, 22);
    }
 
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }
 
  function zoomNoFilho(pilar, filho) {
    if (!pilar || !filho || !viewport) {
      return;
    }
    marcarFoco(filho.id);
    zoomParaBounds(boundsDoFilho(pilar, filho), ZOOM_FILHO);
  }
 
  function boundsDoNeto(neto) {
    return {
      minX: neto.x,
      minY: neto.y,
       maxX: neto.x + 148,
       maxY: neto.y + 48
    };
  }
 
  function zoomNoNeto(neto) {
    if (!neto || !viewport) {
      return;
    }
    marcarFoco(neto.id);
    zoomParaBounds(boundsDoNeto(neto), ZOOM_NETO);
  }
 
  function zoomOut() {
    zoomPilarId = null;
    document.querySelectorAll(".no-pilar, .no-filho, .no-neto").forEach((el) => el.classList.remove("focado"));
    encaixarMapa();
  }
 
  function ladoDoPilar(pilar) {
    return pilar.x + 100 < CENTRO_X ? -1 : 1;
  }
 
    function baseFilho(pilar, indice, total) {
      const paraFora = ladoDoPilar(pilar);
      const n = Math.max(total, 1);
      const gap = 78;
      const start = -((n - 1) * gap) / 2;
      return {
        x: pilar.x + 100 + paraFora * 268 - 90,
        y: pilar.y + 38 + start + indice * gap - 28
      };
    }
   
    function baseNeto(posFilho, pilar, indice, total) {
      const paraFora = ladoDoPilar(pilar);
      const n = Math.max(total, 1);
      const gap = 62;
      const start = -((n - 1) * gap) / 2;
      return {
        x: posFilho.x + paraFora * 196,
        y: posFilho.y + start + indice * gap
      };
    }
 
    function espalharFilhos(pilar) {
      if (!pilar) {
        return;
      }
      (pilar.filhos || []).forEach((filho, i) => {
        const base = baseFilho(pilar, i, pilar.filhos.length);
        filho.x = base.x;
        filho.y = base.y;
        (filho.filhos || []).forEach((neto, k) => {
          const posN = baseNeto({ x: filho.x, y: filho.y }, pilar, k, filho.filhos.length);
          neto.x = posN.x;
          neto.y = posN.y;
        });
      });
    }
 
  function posicaoFilho(pilar, indice, total) {
    const filho = pilar.filhos[indice];
    if (filho && typeof filho.x === "number" && typeof filho.y === "number") {
      return { x: filho.x, y: filho.y };
    }
    return baseFilho(pilar, indice, total);
  }
 
  function posicaoNeto(posFilho, pilar, indice, total, filho) {
    const neto = filho && filho.filhos ? filho.filhos[indice] : null;
    if (neto && typeof neto.x === "number" && typeof neto.y === "number") {
      return { x: neto.x, y: neto.y };
    }
    return baseNeto(posFilho, pilar, indice, total);
  }
 
    function garantirPosicoes() {
      pilares.forEach((pilar) => {
        if (typeof pilar.x !== "number") {
          pilar.x = CENTRO_X;
        }
        if (typeof pilar.y !== "number") {
          pilar.y = CENTRO_Y;
        }
        (pilar.filhos || []).forEach((filho, i) => {
          if (typeof filho.x !== "number" || typeof filho.y !== "number") {
            const base = baseFilho(pilar, i, pilar.filhos.length);
            filho.x = base.x + (filho.dx || 0);
            filho.y = base.y + (filho.dy || 0);
          }
          (filho.filhos || []).forEach((neto, k) => {
            if (typeof neto.x !== "number" || typeof neto.y !== "number") {
              const pos = { x: filho.x, y: filho.y };
              const base = baseNeto(pos, pilar, k, filho.filhos.length);
              neto.x = base.x + (neto.dx || 0);
              neto.y = base.y + (neto.dy || 0);
            }
          });
        });
      });
    soltos.forEach((no) => {
      if (typeof no.x !== "number") {
        no.x = CENTRO_X - 75;
      }
      if (typeof no.y !== "number") {
        no.y = CENTRO_Y + 180;
      }
    });
  }
 
  function corLinha(pilar) {
    return pilar.cores.borda || pilar.cores.filho || pilar.cores.pai;
  }
 
  function galho(ax, ay, bx, by, cor, grossura, info) {
    const dx = bx - ax;
    const dy = by - ay;
    const mx = ax + dx * 0.45;
    const my = ay + dy * 0.12;
    const nx = ax + dx * 0.72;
    const ny = ay + dy * 0.78;
    const d = "M " + ax + " " + ay + " C " + mx + " " + my + ", " + nx + " " + ny + ", " + bx + " " + by;
 
    const glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glow.setAttribute("d", d);
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", cor);
    glow.setAttribute("stroke-width", String(grossura + 10));
    glow.setAttribute("stroke-opacity", "0.22");
    glow.setAttribute("stroke-linecap", "round");
    svgLacos.appendChild(glow);
 
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", cor);
    path.setAttribute("stroke-width", String(grossura));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svgLacos.appendChild(path);
 
    if (info) {
      const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hit.setAttribute("d", d);
      hit.setAttribute("fill", "none");
      hit.setAttribute("stroke", "transparent");
      hit.setAttribute("stroke-width", "18");
      hit.setAttribute("stroke-linecap", "round");
      hit.setAttribute("class", "linha-hit");
      hit.style.pointerEvents = "stroke";
      hit.style.cursor = "pointer";
      hit.addEventListener("mouseenter", (evento) => mostrarTesoura(evento, info, hit));
      hit.addEventListener("mousemove", (evento) => mostrarTesoura(evento, info, hit));
      svgLacos.appendChild(hit);
      linhasHit.push({ path: hit, info: info, ax: ax, ay: ay, bx: bx, by: by });
    }
  }
 
  function expandirCanvas() {
    let maxX = 4000;
    let maxY = 2800;
    function incluir(x, y, w, h) {
      if (typeof x !== "number" || typeof y !== "number") {
        return;
      }
      maxX = Math.max(maxX, x + w + 400);
      maxY = Math.max(maxY, y + h + 400);
    }
    incluir(CENTRO_X, CENTRO_Y, 220, 120);
    pilares.forEach((pilar) => {
      incluir(pilar.x, pilar.y, 260, 120);
      (pilar.filhos || []).forEach((filho) => {
        incluir(filho.x, filho.y, 220, 80);
        (filho.filhos || []).forEach((neto) => {
          incluir(neto.x, neto.y, 180, 70);
        });
      });
    });
    (typeof soltos !== "undefined" ? soltos : []).forEach((no) => {
      incluir(no.x, no.y, 220, 80);
    });
    CANVAS_W = maxX;
    CANVAS_H = maxY;
    canvas.style.width = CANVAS_W + "px";
    canvas.style.height = CANVAS_H + "px";
  }
 
  function desenharLacos() {
    expandirCanvas();
    svgLacos.setAttribute("width", String(CANVAS_W));
    svgLacos.setAttribute("height", String(CANVAS_H));
    svgLacos.innerHTML = "";
    linhasHit = [];
 
     pilares.forEach((pilar) => {
       const cor = corLinha(pilar);
       const px = pilar.x + 100;
       const py = pilar.y + 38;
       galho(CENTRO_X, CENTRO_Y, px, py, cor, 7);
 
        if (ramoAberto(pilar)) {
          pilar.filhos.forEach((filho, i) => {
            const pos = posicaoFilho(pilar, i, pilar.filhos.length);
            galho(px, py, pos.x + 75, pos.y + 25, cor, 5, { tipo: "pai-filho", pilarId: pilar.id, filhoId: filho.id });
            if (!subramoAberto(filho)) {
              return;
            }
            (filho.filhos || []).forEach((neto, k) => {
              const posN = posicaoNeto(pos, pilar, k, filho.filhos.length, filho);
              galho(pos.x + 75, pos.y + 25, posN.x + 60, posN.y + 21, cor, 3.2, {
                tipo: "filho-neto",
                pilarId: pilar.id,
                filhoId: filho.id,
                netoId: neto.id
              });
            });
          });
        }
    });
 
    ligacoesExtras.forEach((lig, idx) => {
      const a = centroDoNoPorId(lig.de);
      const b = centroDoNoPorId(lig.para);
      if (!a || !b) {
        return;
      }
      galho(a.x, a.y, b.x, b.y, lig.cor || "#e8b44a", 3.4, { tipo: "extra", index: idx });
    });
 
    if (ligandoExtra && ligandoExtra.x != null) {
      const origem = centroDoNoPorId(ligandoExtra.de);
      if (origem) {
        galho(origem.x, origem.y, ligandoExtra.x, ligandoExtra.y, "#e8b44a", 3);
      }
    }
  }
 
  function acharNoPorId(id) {
    if (!id) {
      return null;
    }
    const pilar = pilares.find((p) => p.id === id);
    if (pilar) {
      return { tipo: "pai", ref: pilar, pilar: pilar };
    }
    const solto = soltos.find((n) => n.id === id);
    if (solto) {
      return { tipo: "solto", ref: solto };
    }
    for (let p = 0; p < pilares.length; p += 1) {
      const pai = pilares[p];
      for (let f = 0; f < pai.filhos.length; f += 1) {
        const filho = pai.filhos[f];
        if (filho.id === id) {
          return { tipo: "filho", ref: filho, pilar: pai };
        }
        const netos = filho.filhos || [];
        for (let k = 0; k < netos.length; k += 1) {
          if (netos[k].id === id) {
            return { tipo: "neto", ref: netos[k], filho: filho, pilar: pai };
          }
        }
      }
    }
    return null;
  }
 
  function centroDoNoPorId(id) {
    const no = acharNoPorId(id);
    if (!no) {
      return null;
    }
    if (no.tipo === "pai") {
      return { x: no.ref.x + 100, y: no.ref.y + 38 };
    }
    return { x: no.ref.x + 75, y: no.ref.y + 25 };
  }
 
  const tesouraEl = document.getElementById("tesoura-corte");
 
  function esconderTesoura() {
    tesouraAlvo = null;
    if (tesouraEl) {
      tesouraEl.classList.remove("visivel");
    }
  }
 
  function mostrarTesoura(evento, info) {
    if (!prefs.tesoura || !tesouraEl || !viewport) {
      return;
    }
    tesouraAlvo = info;
    const rect = viewport.getBoundingClientRect();
    tesouraEl.style.left = (evento.clientX - rect.left - 14) + "px";
    tesouraEl.style.top = (evento.clientY - rect.top - 14) + "px";
    tesouraEl.classList.add("visivel");
  }
 
  function extrairNo(no) {
    if (!no) {
      return null;
    }
    if (no.tipo === "filho") {
      no.pilar.filhos = no.pilar.filhos.filter((f) => f.id !== no.ref.id);
      return no.ref;
    }
    if (no.tipo === "neto") {
      no.filho.filhos = (no.filho.filhos || []).filter((n) => n.id !== no.ref.id);
      return no.ref;
    }
    if (no.tipo === "solto") {
      soltos = soltos.filter((n) => n.id !== no.ref.id);
      return no.ref;
    }
    return null;
  }
 
  function anexarNo(noExtraido, destino) {
    if (!noExtraido || !destino) {
      return;
    }
    if (!Array.isArray(noExtraido.filhos)) {
      noExtraido.filhos = [];
    }
    if (destino.tipo === "pai") {
      destino.ref.filhos.push(noExtraido);
      return;
    }
    if (destino.tipo === "filho") {
      if (!Array.isArray(destino.ref.filhos)) {
        destino.ref.filhos = [];
      }
      destino.ref.filhos.push(noExtraido);
      return;
    }
    if (destino.tipo === "neto" && destino.filho) {
      if (!Array.isArray(destino.filho.filhos)) {
        destino.filho.filhos = [];
      }
      destino.filho.filhos.push(noExtraido);
    }
  }
 
  function contemNo(raiz, id) {
    if (!raiz || !id) {
      return false;
    }
    if (raiz.id === id) {
      return true;
    }
    return (raiz.filhos || []).some((filho) => contemNo(filho, id));
  }
 
  function religarNo(origem, destino) {
    if (!origem || !destino || origem.ref === destino.ref) {
      return false;
    }
    empilharUndo();
    if (origem.tipo === "pai") {
      return false;
    }
    if (contemNo(origem.ref, destino.ref.id)) {
      return false;
    }
    const extraido = extrairNo(origem);
    if (!extraido) {
      return false;
    }
    anexarNo(extraido, destino);
    return true;
  }
 
  function criarLigacaoExtra(deId, paraId) {
    if (!deId || !paraId || deId === paraId) {
      return;
    }
    const existe = ligacoesExtras.some((l) => (l.de === deId && l.para === paraId) || (l.de === paraId && l.para === deId));
    if (existe) {
      return;
    }
    empilharUndo();
    ligacoesExtras.push({ de: deId, para: paraId, cor: "#e8b44a" });
  }
 
  function cortarLinha(info) {
    if (!info) {
      return;
    }
    empilharUndo();
    if (info.tipo === "extra") {
      ligacoesExtras.splice(info.index, 1);
      renderizarRoadmap();
      aposMudarMapa();
      return;
    }
    if (info.tipo === "pai-filho") {
      const pilar = pilares.find((p) => p.id === info.pilarId);
      if (!pilar) {
        return;
      }
      const filho = pilar.filhos.find((f) => f.id === info.filhoId);
      if (!filho) {
        return;
      }
      pilar.filhos = pilar.filhos.filter((f) => f.id !== info.filhoId);
      soltos.push(filho);
      renderizarRoadmap();
      aposMudarMapa();
      return;
    }
    if (info.tipo === "filho-neto") {
      const pilar = pilares.find((p) => p.id === info.pilarId);
      if (!pilar) {
        return;
      }
      const filho = pilar.filhos.find((f) => f.id === info.filhoId);
      if (!filho) {
        return;
      }
      const neto = (filho.filhos || []).find((n) => n.id === info.netoId);
      if (!neto) {
        return;
      }
      filho.filhos = filho.filhos.filter((n) => n.id !== info.netoId);
      soltos.push(neto);
      renderizarRoadmap();
      aposMudarMapa();
      return;
    }
  }
 
  if (tesouraEl) {
    tesouraEl.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const alvo = tesouraAlvo;
      esconderTesoura();
      cortarLinha(alvo);
    });
    tesouraEl.addEventListener("mousedown", (evento) => evento.stopPropagation());
  }
 
  viewport.addEventListener("mouseleave", esconderTesoura);
 
  function limparNos() {
    canvas.querySelectorAll(".no-pilar, .no-filho, .no-neto, .btn-add-filho, .btn-add-neto, .aviso-solto").forEach((el) => el.remove());
  }
 
  function pinoLigacao(noId) {
    const pino = document.createElement("button");
    pino.type = "button";
    pino.className = "pino-no";
    pino.title = "Arraste para ligar em outro no";
    pino.addEventListener("pointerdown", (evento) => {
      if (evento.pointerType === "mouse" && evento.button !== 0) {
        return;
      }
      evento.stopPropagation();
      evento.preventDefault();
      const pt = pontoCliente(evento);
      const rect = canvas.getBoundingClientRect();
      ligandoExtra = {
        de: noId,
        x: (pt.x - rect.left) / escala,
        y: (pt.y - rect.top) / escala
      };
    });
    return pino;
  }
 
  function noSobPonto(mundoX, mundoY, ignorarRef) {
    return noProximo(mundoX, mundoY, ignorarRef, 88);
  }
 
  function noProximo(mundoX, mundoY, ignorarRef, raio) {
    const caixas = listaCaixas(ignorarRef ? { ref: ignorarRef } : null);
    let melhor = null;
    let melhorDist = raio || 88;
    for (let i = 0; i < caixas.length; i += 1) {
      const box = caixas[i];
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const dx = mundoX - cx;
      const dy = mundoY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const margem = 40;
      const dentro = mundoX >= box.x - margem && mundoX <= box.x + box.w + margem &&
        mundoY >= box.y - margem && mundoY <= box.y + box.h + margem;
      if (dentro && dist <= melhorDist) {
        melhor = box;
        melhorDist = dist;
      }
    }
    return melhor;
  }
 
  function destacarAlvo(alvo) {
    document.querySelectorAll(".no-alvo-drop").forEach((el) => el.classList.remove("no-alvo-drop"));
    if (!alvo || !alvo.ref) {
      return;
    }
    canvas.querySelectorAll(".no-pilar, .no-filho, .no-neto").forEach((el) => {
      if (el.dataset.id === String(alvo.ref.id)) {
        el.classList.add("no-alvo-drop");
      }
    });
  }
 
  const modalConfirma = document.querySelector(".modal-confirma");
  const tituloConfirma = document.getElementById("titulo-modal-confirma");
  const textoConfirma = document.querySelector(".confirma-texto");
  const btnConfirmaApagar = document.querySelector(".btn-confirma-apagar");
  const btnCancelarConfirma = document.querySelector(".btn-cancelar-confirma");
  const toastRestaurar = document.querySelector(".toast-restaurar");
  const toastTexto = document.querySelector(".toast-texto");
  const btnRestaurar = document.querySelector(".btn-restaurar");
  let acaoApagarPendente = null;
  let snapshotRestaurar = null;
  let timerToast = null;
 
  function fecharConfirma() {
    if (modalConfirma) {
      modalConfirma.classList.remove("aberto");
    }
    acaoApagarPendente = null;
  }
 
  function mostrarToast(nome) {
    if (!toastRestaurar) {
      return;
    }
    if (toastTexto) {
      toastTexto.textContent = '"' + nome + '" apagado.';
    }
    toastRestaurar.hidden = false;
    if (timerToast) {
      clearTimeout(timerToast);
    }
    timerToast = setTimeout(() => {
      toastRestaurar.hidden = true;
      snapshotRestaurar = null;
    }, 8000);
  }
 
  function pedirConfirmacao(nome, executar, opts) {
    const opcoes = opts || {};
    acaoApagarPendente = {
      nome: nome,
      executar: executar,
      semToast: !!opcoes.semToast
    };
    if (tituloConfirma) {
      tituloConfirma.textContent = opcoes.titulo || "Apagar";
    }
    if (btnConfirmaApagar) {
      btnConfirmaApagar.textContent = opcoes.ok || "Apagar";
    }
    if (textoConfirma) {
      if (opcoes.mensagem) {
        textoConfirma.textContent = opcoes.mensagem;
      } else if (opcoes.semToast) {
        textoConfirma.textContent = 'Tem certeza que quer apagar "' + nome + '"?';
      } else {
        textoConfirma.textContent = 'Tem certeza que quer apagar "' + nome + '"? Voce ainda podera restaurar depois.';
      }
    }
    if (modalConfirma) {
      modalConfirma.classList.add("aberto");
    }
  }
 
  if (btnCancelarConfirma) {
    btnCancelarConfirma.addEventListener("click", fecharConfirma);
  }
 
  if (btnConfirmaApagar) {
    btnConfirmaApagar.addEventListener("click", () => {
      if (!acaoApagarPendente) {
        return;
      }
      const nome = acaoApagarPendente.nome;
      const semToast = acaoApagarPendente.semToast;
      if (!semToast) {
        snapshotRestaurar = snapshotMapa();
      }
      acaoApagarPendente.executar();
      fecharConfirma();
      if (!semToast) {
        mostrarToast(nome);
      }
    });
  }
 
  if (btnRestaurar) {
    btnRestaurar.addEventListener("click", () => {
      if (!snapshotRestaurar) {
        return;
      }
      aplicarSnapshot(snapshotRestaurar);
      snapshotRestaurar = null;
      if (toastRestaurar) {
        toastRestaurar.hidden = true;
      }
      if (timerToast) {
        clearTimeout(timerToast);
      }
    });
  }
 
  function limparLigacoesDoNo(id) {
    ligacoesExtras = ligacoesExtras.filter((lig) => lig.de !== id && lig.para !== id);
  }
 
    function moverRamo(pilar, dx, dy) {
      (pilar.filhos || []).forEach((filho) => {
        if (typeof filho.x === "number") {
          filho.x = filho.x + dx;
        }
        if (typeof filho.y === "number") {
          filho.y = filho.y + dy;
        }
        (filho.filhos || []).forEach((neto) => {
          if (typeof neto.x === "number") {
            neto.x = neto.x + dx;
          }
          if (typeof neto.y === "number") {
            neto.y = neto.y + dy;
          }
        });
      });
    }
 
   function botaoMinimizar(pilar) {
     const btn = document.createElement("button");
     btn.type = "button";
     btn.className = "btn-min-no" + (ramoAberto(pilar) ? " aberto" : "");
     btn.textContent = ramoAberto(pilar) ? "–" : "+";
     btn.title = ramoAberto(pilar) ? "Minimizar ramo" : "Expandir ramo";
     btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
     btn.addEventListener("click", (evento) => {
       evento.stopPropagation();
       empilharUndo();
       if (ramoAberto(pilar)) {
         pilar.minimizado = true;
         if (zoomPilarId === pilar.id) {
           zoomPilarId = null;
         }
         renderizarRoadmap();
         aposMudarMapa();
         encaixarMapa();
         return;
       }
       expandirPilar(pilar);
       aposMudarMapa();
       zoomNoPilar(pilar.id);
     });
     return btn;
   }
 
   function botaoFixar(alvo) {
     const btn = document.createElement("button");
     btn.type = "button";
     btn.className = "btn-fixo-no" + (alvo.fixo ? " travado" : "");
     btn.textContent = alvo.fixo ? "●" : "○";
     btn.title = alvo.fixo ? "Destravar posicao" : "Travar posicao";
     btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
     btn.addEventListener("click", (evento) => {
       evento.stopPropagation();
       empilharUndo();
       alvo.fixo = !alvo.fixo;
       renderizarRoadmap();
       aposMudarMapa();
     });
     return btn;
   }
 
   function botaoExcluir(nome, aoClicar) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-del-no";
    btn.textContent = "×";
    btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      pedirConfirmacao(nome, aoClicar);
    });
    return btn;
  }
 
  function botaoFeito(alvo) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-feito-no";
    btn.textContent = "✓";
    btn.title = "Marcar como feito";
    if (alvo.feito) {
      btn.classList.add("marcado");
    }
    btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      empilharUndo();
      alvo.feito = !alvo.feito;
      renderizarRoadmap();
      aposMudarMapa();
    });
    return btn;
  }
 
  function botaoNota(alvo, titulo) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-nota-no";
    btn.textContent = "i";
    btn.title = "Observacao";
    if (alvo.nota) {
      btn.classList.add("tem-nota");
    }
    btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
    btn.addEventListener("click", (evento) => {
      evento.stopPropagation();
      abrirModalNota(alvo, titulo);
    });
    return btn;
  }
 
  function progressoDoPilar(pilar) {
    let total = 0;
    let feitos = 0;
    (pilar.filhos || []).forEach((filho) => {
      total += 1;
      if (filho.feito) {
        feitos += 1;
      }
      (filho.filhos || []).forEach((neto) => {
        total += 1;
        if (neto.feito) {
          feitos += 1;
        }
      });
    });
    if (!total) {
      return null;
    }
    return Math.round((feitos / total) * 100);
  }
 
  function barraProgresso(pct) {
    const wrap = document.createElement("div");
    wrap.className = "no-progresso";
    const bar = document.createElement("div");
    bar.className = "no-progresso-bar";
    const fill = document.createElement("div");
    fill.className = "no-progresso-fill";
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    const txt = document.createElement("span");
    txt.className = "no-progresso-txt";
    txt.textContent = pct + "%";
    wrap.appendChild(bar);
    wrap.appendChild(txt);
    return wrap;
  }
 
  function aplicarEstadoNo(el, alvo) {
    if (alvo.feito) {
      el.classList.add("feito");
    }
    el.appendChild(botaoFeito(alvo));
    el.appendChild(botaoNota(alvo, alvo.nome));
  }
 
   function botaoEditar(alvo, el, rotulo) {
     const btn = document.createElement("button");
     btn.type = "button";
     btn.className = "btn-editar-no";
     btn.textContent = "✎";
     btn.title = "Editar nome";
     btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
     btn.addEventListener("click", (evento) => {
       evento.stopPropagation();
       iniciarEdicao(alvo, el, rotulo);
     });
     return btn;
   }
 
   const comboCoresEl = document.getElementById("combo-cores");
   const comboCoresLista = document.getElementById("combo-cores-lista");
   const comboCorPai = document.getElementById("combo-cor-pai");
   const comboCorFilho = document.getElementById("combo-cor-filho");
   const comboCorLinha = document.getElementById("combo-cor-linha");
   let pilarCoresAlvo = null;
   let paletaNovoPilar = clonarPaleta(PALETAS[0]);
 
   function pintarChip(chip, cor) {
     chip.innerHTML = "";
     ["pai", "filho", "borda"].forEach((chave) => {
       const faixa = document.createElement("span");
       faixa.style.background = cor[chave];
       chip.appendChild(faixa);
     });
   }
 
   function montarPaletas(container, selecionada, onPick) {
     if (!container) {
       return;
     }
     container.innerHTML = "";
     PALETAS.forEach((cor, i) => {
       const chip = document.createElement("button");
       chip.type = "button";
       chip.className = "paleta-chip";
       if (coresIguais(cor, selecionada)) {
         chip.classList.add("ativa");
       }
       chip.title = "Paleta " + (i + 1);
       pintarChip(chip, cor);
       chip.addEventListener("click", (evento) => {
         evento.preventDefault();
         evento.stopPropagation();
         onPick(clonarPaleta(cor));
       });
       container.appendChild(chip);
     });
   }
 
   function sincronizarComboInputs(cores) {
     if (!cores) {
       return;
     }
     if (comboCorPai) {
       comboCorPai.value = cores.pai;
     }
     if (comboCorFilho) {
       comboCorFilho.value = cores.filho;
     }
     if (comboCorLinha) {
       comboCorLinha.value = cores.borda;
     }
   }
 
   function aplicarCoresNoPilar(pilar, cores) {
     if (!pilar || !cores) {
       return;
     }
     pilar.cores = {
       pai: cores.pai,
       filho: cores.filho,
       fio: cores.fio || cores.borda,
       borda: cores.borda
     };
   }
 
   function fecharComboCores() {
     pilarCoresAlvo = null;
     if (comboCoresEl) {
       comboCoresEl.hidden = true;
     }
   }
 
    function escolherPaletaDoPilar(cores) {
      if (!pilarCoresAlvo) {
        return;
      }
      empilharUndo();
      aplicarCoresNoPilar(pilarCoresAlvo, cores);
      sincronizarComboInputs(pilarCoresAlvo.cores);
      montarPaletas(comboCoresLista, pilarCoresAlvo.cores, escolherPaletaDoPilar);
      renderizarRoadmap();
      aposMudarMapa();
    }
 
    function abrirComboCores(pilar, ancora) {
      if (!comboCoresEl || !pilar) {
        return;
      }
      pilarCoresAlvo = pilar;
      sincronizarComboInputs(pilar.cores);
      montarPaletas(comboCoresLista, pilar.cores, escolherPaletaDoPilar);
      comboCoresEl.hidden = false;
      if (ancora) {
        const rect = ancora.getBoundingClientRect();
        comboCoresEl.style.left = Math.min(rect.right + 8, window.innerWidth - 240) + "px";
        comboCoresEl.style.top = Math.max(8, rect.top) + "px";
        comboCoresEl.style.right = "auto";
      }
    }
 
    function botaoCores(pilar, ancora) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-cores-no";
      btn.title = "Cores do ramo";
      btn.setAttribute("aria-label", "Cores do ramo");
      btn.addEventListener("mousedown", (evento) => evento.stopPropagation());
      btn.addEventListener("click", (evento) => {
        evento.stopPropagation();
        if (pilarCoresAlvo === pilar && comboCoresEl && !comboCoresEl.hidden) {
          fecharComboCores();
          return;
        }
        abrirComboCores(pilar, ancora);
      });
      return btn;
    }
 
    function aplicarCorEditada() {
      if (!pilarCoresAlvo) {
        return;
      }
      aplicarCoresNoPilar(pilarCoresAlvo, {
        pai: comboCorPai ? comboCorPai.value : pilarCoresAlvo.cores.pai,
        filho: comboCorFilho ? comboCorFilho.value : pilarCoresAlvo.cores.filho,
        borda: comboCorLinha ? comboCorLinha.value : pilarCoresAlvo.cores.borda
      });
      montarPaletas(comboCoresLista, pilarCoresAlvo.cores, escolherPaletaDoPilar);
      renderizarRoadmap();
      aposMudarMapa();
    }
 
    if (comboCorPai) {
      comboCorPai.addEventListener("input", aplicarCorEditada);
    }
    if (comboCorFilho) {
      comboCorFilho.addEventListener("input", aplicarCorEditada);
    }
    if (comboCorLinha) {
      comboCorLinha.addEventListener("input", aplicarCorEditada);
    }
    if (comboCoresEl) {
      comboCoresEl.addEventListener("mousedown", (evento) => evento.stopPropagation());
      comboCoresEl.addEventListener("click", (evento) => evento.stopPropagation());
    }
 
  function iniciarEdicao(alvo, el, rotulo) {
    if (el.querySelector(".input-editar-no")) {
      return;
    }
    const input = document.createElement("input");
    input.type = "text";
    input.className = "input-editar-no";
    input.value = alvo.nome;
    rotulo.replaceWith(input);
    input.focus();
    input.select();
 
    function confirmar() {
      const nome = input.value.trim();
      if (nome && nome !== alvo.nome) {
        empilharUndo();
        alvo.nome = nome;
        aposMudarMapa();
      }
      renderizarRoadmap();
    }
 
    input.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        confirmar();
      }
      if (evento.key === "Escape") {
        renderizarRoadmap();
      }
    });
    input.addEventListener("blur", confirmar);
    input.addEventListener("mousedown", (evento) => evento.stopPropagation());
    input.addEventListener("click", (evento) => evento.stopPropagation());
  }
 
   function caixaDoNo(tipo, x, y) {
     if (tipo === "pai") {
       return { x: x, y: y, w: 240, h: 90 };
     }
     if (tipo === "filho") {
       return { x: x, y: y, w: 180, h: 56 };
     }
     return { x: x, y: y, w: 148, h: 48 };
   }
 
  function listaCaixas(exceto) {
    const lista = [];
    pilares.forEach((pilar) => {
      const paiBox = caixaDoNo("pai", pilar.x, pilar.y);
      paiBox.ref = pilar;
      paiBox.tipo = "pai";
      if (!exceto || exceptoNaoE(exceto, paiBox)) {
        lista.push(paiBox);
      }
       if (ramoAberto(pilar)) {
         pilar.filhos.forEach((filho, i) => {
           const pos = posicaoFilho(pilar, i, pilar.filhos.length);
           const filhoBox = caixaDoNo("filho", pos.x, pos.y);
           filhoBox.ref = filho;
           filhoBox.tipo = "filho";
           filhoBox.pilar = pilar;
           if (!exceto || exceptoNaoE(exceto, filhoBox)) {
              lista.push(filhoBox);
            }
            if (!subramoAberto(filho)) {
              return;
            }
            (filho.filhos || []).forEach((neto, k) => {
             const posN = posicaoNeto(pos, pilar, k, filho.filhos.length, filho);
             const netoBox = caixaDoNo("neto", posN.x, posN.y);
             netoBox.ref = neto;
             netoBox.tipo = "neto";
             netoBox.filho = filho;
             netoBox.pilar = pilar;
             if (!exceto || exceptoNaoE(exceto, netoBox)) {
               lista.push(netoBox);
             }
           });
         });
       }
    });
    soltos.forEach((no) => {
      const box = caixaDoNo("filho", no.x, no.y);
      box.ref = no;
      box.tipo = "solto";
      if (!exceto || exceptoNaoE(exceto, box)) {
        lista.push(box);
      }
    });
    return lista;
  }
 
  function exceptoNaoE(exceto, box) {
    return exceto.ref !== box.ref;
  }
 
  function colidem(a, b, folga) {
    const g = folga || 16;
    return a.x < b.x + b.w + g && a.x + a.w + g > b.x && a.y < b.y + b.h + g && a.y + a.h + g > b.y;
  }
 
  function empurrar(origem) {
    const maxPassos = 18;
    for (let passo = 0; passo < maxPassos; passo += 1) {
      let mexeu = false;
      const caixas = listaCaixas(origem);
      const origemBox = caixaAtual(origem);
      caixas.forEach((box) => {
        if (!colidem(origemBox, box, 18)) {
          return;
        }
        const cxA = origemBox.x + origemBox.w / 2;
        const cyA = origemBox.y + origemBox.h / 2;
        const cxB = box.x + box.w / 2;
        const cyB = box.y + box.h / 2;
        let dx = cxB - cxA;
        let dy = cyB - cyA;
        if (dx === 0 && dy === 0) {
          dx = 1;
        }
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
         if (box.ref && box.ref.fixo) {
           return;
         }
         const empuxo = 36;
         moverNo(box, (dx / dist) * empuxo, (dy / dist) * empuxo);
         mexeu = true;
      });
      if (!mexeu) {
        break;
      }
    }
  }
 
  function caixaAtual(item) {
    if (item.tipo === "pai") {
      return caixaDoNo("pai", item.ref.x, item.ref.y);
    }
    if (item.tipo === "filho") {
      return caixaDoNo("filho", item.ref.x, item.ref.y);
    }
    if (item.tipo === "solto") {
      return caixaDoNo("filho", item.ref.x, item.ref.y);
    }
    return caixaDoNo("neto", item.ref.x, item.ref.y);
  }
 
   function moverNo(box, dx, dy) {
     if (box.ref && box.ref.fixo) {
       return;
     }
      box.ref.x = (box.ref.x || 0) + dx;
      box.ref.y = (box.ref.y || 0) + dy;
   }
 
   function separarSobrepostos() {
     const maxPassos = 24;
     for (let passo = 0; passo < maxPassos; passo += 1) {
       let mexeu = false;
       const caixas = listaCaixas(null);
       for (let i = 0; i < caixas.length; i += 1) {
         for (let j = i + 1; j < caixas.length; j += 1) {
           const a = caixas[i];
           const b = caixas[j];
           if (!colidem(a, b, 22)) {
             continue;
           }
           const cxA = a.x + a.w / 2;
           const cyA = a.y + a.h / 2;
           const cxB = b.x + b.w / 2;
           const cyB = b.y + b.h / 2;
           let dx = cxB - cxA;
           let dy = cyB - cyA;
           if (dx === 0 && dy === 0) {
             dx = 1;
           }
           const dist = Math.sqrt(dx * dx + dy * dy) || 1;
           const empuxo = 22;
           moverNo(a, -(dx / dist) * empuxo, -(dy / dist) * empuxo);
           moverNo(b, (dx / dist) * empuxo, (dy / dist) * empuxo);
           mexeu = true;
         }
       }
       if (!mexeu) {
         break;
       }
     }
   }
 
  let arrastando = null;
  let arrastandoCamera = null;
  let arrasteOffsetX = 0;
  let arrasteOffsetY = 0;
  let moveu = false;
  let timerCliqueNo = null;
  let recemPan = false;
 
  function alternarSubramo(alvo, pilar, tipo) {
    if (!alvo) {
      return;
    }
    empilharUndo();
    const estavaAberto = subramoAberto(alvo);
    alvo.minimizado = estavaAberto;
    alvo.subramoManual = true;
    if (!estavaAberto) {
      garantirPosicoes();
    }
    renderizarRoadmap();
    aposMudarMapa();
    if (tipo === "filho" && pilar) {
      zoomNoFilho(pilar, alvo);
      return;
    }
    zoomNoNeto(alvo);
  }
 
  function renderizarRoadmap() {
    garantirPosicoes();
    limparNos();
 
    pilares.forEach((pilar) => {
      const pai = document.createElement("div");
      pai.className = "no-pilar";
      pai.dataset.id = pilar.id;
      pai.style.left = pilar.x + "px";
      pai.style.top = pilar.y + "px";
      pai.style.setProperty("--no-cor", pilar.cores.borda);
      pai.style.setProperty("--no-fundo", pilar.cores.pai);
      if (zoomPilarId === pilar.id) {
        pai.classList.add("focado");
      }
 
      const rotuloPai = document.createElement("span");
      rotuloPai.className = "no-nome";
      rotuloPai.textContent = pilar.nome;
      pai.appendChild(rotuloPai);
      const pctPilar = progressoDoPilar(pilar);
      if (pctPilar !== null) {
        pai.appendChild(barraProgresso(pctPilar));
      }
 
       rotuloPai.title = pilar.nome;
       pai.appendChild(botaoEditar(pilar, pai, rotuloPai));
       pai.appendChild(botaoCores(pilar, pai));
        pai.appendChild(botaoExcluir(pilar.nome, () => {
         empilharUndo();
         limparLigacoesDoNo(pilar.id);
         pilares = pilares.filter((p) => p.id !== pilar.id);
         if (zoomPilarId === pilar.id) {
           zoomPilarId = null;
         }
         renderizarRoadmap();
         aposMudarMapa();
       }));
        aplicarEstadoNo(pai, pilar);
        pai.appendChild(pinoLigacao(pilar.id));
        pai.appendChild(botaoMinimizar(pilar));
        pai.appendChild(botaoFixar(pilar));
        if (pilar.fixo) {
          pai.classList.add("fixo");
        }
  
        pai.addEventListener("pointerdown", (evento) => {
         if (evento.pointerType === "mouse" && evento.button !== 0) {
           return;
         }
         if (evento.target.closest("button")) {
           return;
         }
         evento.stopPropagation();
         if (evento.pointerType !== "mouse") {
           evento.preventDefault();
         }
         if (pilar.fixo) {
           arrastando = null;
           moveu = false;
           return;
         }
         arrastando = { tipo: "pai", ref: pilar, pilar: pilar, ox: pilar.x, oy: pilar.y };
         moveu = false;
         const pt = pontoCliente(evento);
         const rect = canvas.getBoundingClientRect();
         arrasteOffsetX = (pt.x - rect.left) / escala - pilar.x;
         arrasteOffsetY = (pt.y - rect.top) / escala - pilar.y;
       });
 
       pai.addEventListener("click", (evento) => {
         evento.stopPropagation();
         if (moveu || (arrastandoCamera && arrastandoCamera.moveu)) {
           return;
         }
         if (pilar.aba) {
           abrirAba(pilar.aba);
         }
         zoomNoPilar(pilar.id);
       });
 
       canvas.appendChild(pai);
 
       if (!ramoAberto(pilar)) {
         return;
       }
  
       pilar.filhos.forEach((filhoData, i) => {
        const pos = posicaoFilho(pilar, i, pilar.filhos.length);
        const filho = document.createElement("div");
        filho.className = "no-filho";
         filho.style.left = pos.x + "px";
         filho.style.top = pos.y + "px";
          filho.style.setProperty("--no-cor", pilar.cores.borda);
          filho.style.setProperty("--no-fundo", pilar.cores.filho);
         if (zoomPilarId === filhoData.id) {
           filho.classList.add("focado");
         }
 
        const rotuloFilho = document.createElement("span");
         rotuloFilho.className = "no-nome";
         rotuloFilho.textContent = filhoData.nome;
         rotuloFilho.title = filhoData.nome;
         filho.appendChild(rotuloFilho);
 
        filho.appendChild(botaoEditar(filhoData, filho, rotuloFilho));
         filho.appendChild(botaoExcluir(filhoData.nome, () => {
           empilharUndo();
           limparLigacoesDoNo(filhoData.id);
           pilar.filhos = pilar.filhos.filter((f) => f.id !== filhoData.id);
           renderizarRoadmap();
           aposMudarMapa();
         }));
          aplicarEstadoNo(filho, filhoData);
          filho.dataset.id = filhoData.id;
          filho.appendChild(pinoLigacao(filhoData.id));
          filho.appendChild(botaoFixar(filhoData));
          if (filhoData.fixo) {
            filho.classList.add("fixo");
          }
  
          filho.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType === "mouse" && evento.button !== 0) {
              return;
            }
            if (evento.target.closest("button")) {
              return;
            }
            evento.stopPropagation();
            if (evento.pointerType !== "mouse") {
              evento.preventDefault();
            }
            if (filhoData.fixo) {
              arrastando = null;
              moveu = false;
              return;
            }
            arrastando = { tipo: "filho", ref: filhoData, pilar: pilar, ox: filhoData.x, oy: filhoData.y };
            moveu = false;
            const pt = pontoCliente(evento);
            const rect = canvas.getBoundingClientRect();
            arrasteOffsetX = (pt.x - rect.left) / escala - filhoData.x;
            arrasteOffsetY = (pt.y - rect.top) / escala - filhoData.y;
          });
          filho.addEventListener("click", (evento) => {
           evento.stopPropagation();
           if (moveu || (arrastandoCamera && arrastandoCamera.moveu)) {
             return;
           }
           if (timerCliqueNo) {
             clearTimeout(timerCliqueNo);
           }
           timerCliqueNo = setTimeout(() => {
             timerCliqueNo = null;
             if (pilar.aba) {
               abrirAba(pilar.aba);
             }
             zoomNoFilho(pilar, filhoData);
           }, 250);
         });
 
         filho.addEventListener("dblclick", (evento) => {
           evento.preventDefault();
           evento.stopPropagation();
           if (timerCliqueNo) {
             clearTimeout(timerCliqueNo);
             timerCliqueNo = null;
           }
            alternarSubramo(filhoData, pilar, "filho");
         });
 
         canvas.appendChild(filho);
 
         if (!subramoAberto(filhoData)) {
           return;
         }
 
         (filhoData.filhos || []).forEach((netoData, k) => {
          const posN = posicaoNeto(pos, pilar, k, filhoData.filhos.length, filhoData);
          const neto = document.createElement("div");
          neto.className = "no-neto";
           neto.style.left = posN.x + "px";
           neto.style.top = posN.y + "px";
            neto.style.setProperty("--no-cor", pilar.cores.borda);
            neto.style.setProperty("--no-fundo", pilar.cores.filho);
           if (zoomPilarId === netoData.id) {
             neto.classList.add("focado");
           }
 
          const rotuloNeto = document.createElement("span");
           rotuloNeto.className = "no-nome";
           rotuloNeto.textContent = netoData.nome;
           rotuloNeto.title = netoData.nome;
           neto.appendChild(rotuloNeto);
 
          neto.appendChild(botaoEditar(netoData, neto, rotuloNeto));
           neto.appendChild(botaoExcluir(netoData.nome, () => {
             empilharUndo();
             limparLigacoesDoNo(netoData.id);
             filhoData.filhos = filhoData.filhos.filter((n) => n.id !== netoData.id);
             renderizarRoadmap();
             aposMudarMapa();
           }));
            aplicarEstadoNo(neto, netoData);
            neto.dataset.id = netoData.id;
            neto.appendChild(pinoLigacao(netoData.id));
            neto.appendChild(botaoFixar(netoData));
            if (netoData.fixo) {
              neto.classList.add("fixo");
            }
  
            neto.addEventListener("pointerdown", (evento) => {
              if (evento.pointerType === "mouse" && evento.button !== 0) {
                return;
              }
              if (evento.target.closest("button")) {
                return;
              }
              evento.stopPropagation();
              if (evento.pointerType !== "mouse") {
                evento.preventDefault();
              }
              if (netoData.fixo) {
                arrastando = null;
                moveu = false;
                return;
              }
              arrastando = { tipo: "neto", ref: netoData, filho: filhoData, pilar: pilar };
              moveu = false;
              const pt = pontoCliente(evento);
              const rect = canvas.getBoundingClientRect();
              arrasteOffsetX = (pt.x - rect.left) / escala - netoData.x;
              arrasteOffsetY = (pt.y - rect.top) / escala - netoData.y;
            });
            neto.addEventListener("click", (evento) => {
             evento.stopPropagation();
             if (moveu || (arrastandoCamera && arrastandoCamera.moveu)) {
               return;
             }
             if (timerCliqueNo) {
               clearTimeout(timerCliqueNo);
             }
             timerCliqueNo = setTimeout(() => {
               timerCliqueNo = null;
               if (pilar.aba) {
                 abrirAba(pilar.aba);
               }
               zoomNoNeto(netoData);
             }, 250);
           });
           neto.addEventListener("dblclick", (evento) => {
             evento.preventDefault();
             evento.stopPropagation();
             if (timerCliqueNo) {
               clearTimeout(timerCliqueNo);
               timerCliqueNo = null;
             }
             alternarSubramo(netoData, pilar, "neto");
           });
          canvas.appendChild(neto);
        });
 
         const ladoFilho = ladoDoPilar(pilar);
         const btnNeto = document.createElement("button");
         btnNeto.type = "button";
         btnNeto.className = "btn-add-neto";
         btnNeto.textContent = "+";
         btnNeto.title = "Derivar deste filho";
         btnNeto.style.left = (pos.x + (ladoFilho > 0 ? 158 : -28)) + "px";
         btnNeto.style.top = (pos.y + 14) + "px";
        btnNeto.addEventListener("mousedown", (evento) => evento.stopPropagation());
        btnNeto.addEventListener("click", (evento) => {
          evento.stopPropagation();
          abrirModalNo("derivacao", pilar.id, filhoData.id);
        });
        canvas.appendChild(btnNeto);
      });
 
       const ladoPai = ladoDoPilar(pilar);
       const btnFilho = document.createElement("button");
       btnFilho.type = "button";
       btnFilho.className = "btn-add-filho";
       btnFilho.textContent = "+";
       btnFilho.title = "Adicionar filho neste pai";
       btnFilho.style.left = (pilar.x + (ladoPai > 0 ? 210 : -28)) + "px";
       btnFilho.style.top = (pilar.y + 26) + "px";
      btnFilho.addEventListener("mousedown", (evento) => evento.stopPropagation());
      btnFilho.addEventListener("click", (evento) => {
        evento.stopPropagation();
        abrirModalNo("filho", pilar.id, null);
      });
       canvas.appendChild(btnFilho);
     });
 
     soltos.forEach((no) => {
       const el = document.createElement("div");
       el.className = "no-filho no-solto";
       el.dataset.id = no.id;
        el.style.left = no.x + "px";
        el.style.top = no.y + "px";
        el.style.setProperty("--no-cor", "#e8b44a");
        el.style.setProperty("--no-fundo", "#3a2418");
       const rotulo = document.createElement("span");
       rotulo.className = "no-nome";
       rotulo.textContent = no.nome;
       el.appendChild(rotulo);
       el.appendChild(botaoEditar(no, el, rotulo));
       el.appendChild(botaoExcluir(no.nome, () => {
         empilharUndo();
         limparLigacoesDoNo(no.id);
         soltos = soltos.filter((s) => s.id !== no.id);
         renderizarRoadmap();
         aposMudarMapa();
       }));
       aplicarEstadoNo(el, no);
       el.appendChild(pinoLigacao(no.id));
       el.addEventListener("pointerdown", (evento) => {
         if (evento.pointerType === "mouse" && evento.button !== 0) {
           return;
         }
         if (evento.target.closest("button")) {
           return;
         }
         evento.stopPropagation();
         if (evento.pointerType !== "mouse") {
           evento.preventDefault();
         }
         arrastando = { tipo: "solto", ref: no };
         moveu = false;
         const pt = pontoCliente(evento);
         const rect = canvas.getBoundingClientRect();
         arrasteOffsetX = (pt.x - rect.left) / escala - no.x;
         arrasteOffsetY = (pt.y - rect.top) / escala - no.y;
       });
       canvas.appendChild(el);
       const aviso = document.createElement("div");
       aviso.className = "aviso-solto";
       aviso.textContent = "Arraste para um pai ou filho";
       aviso.style.left = (no.x + 75) + "px";
       aviso.style.top = no.y + "px";
       canvas.appendChild(aviso);
     });
 
     desenharLacos();
     agendarSalvar();
   }
 
  if (viewport) {
    viewport.addEventListener("pointerdown", (evento) => {
      if (evento.pointerType === "mouse" && evento.button !== 0) {
        return;
      }
      if (evento.target.closest(".no-pilar, .no-filho, .no-neto, button, .jogo-seletor-btn, .jogo-seletor-lista, .tesoura-corte, .pino-no, .combo-cores")) {
        return;
      }
      if (arrastando || ligandoExtra) {
        return;
      }
      const pt = pontoCliente(evento);
      arrastandoCamera = { x: pt.x, y: pt.y, panX: panX, panY: panY, moveu: false };
      if (viewport) {
        viewport.classList.add("pan-ativo");
      }
    });
  }
 
  window.addEventListener("pointermove", (evento) => {
    if (arrastandoCamera) {
      const pt = pontoCliente(evento);
      const dx = pt.x - arrastandoCamera.x;
      const dy = pt.y - arrastandoCamera.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        arrastandoCamera.moveu = true;
        recemPan = true;
      }
      panX = arrastandoCamera.panX + dx;
      panY = arrastandoCamera.panY + dy;
      aplicarTransform();
      return;
    }
    if (ligandoExtra) {
      const pt = pontoCliente(evento);
      const rect = canvas.getBoundingClientRect();
      ligandoExtra.x = (pt.x - rect.left) / escala;
      ligandoExtra.y = (pt.y - rect.top) / escala;
      destacarAlvo(noSobPonto(ligandoExtra.x, ligandoExtra.y, acharNoPorId(ligandoExtra.de) && acharNoPorId(ligandoExtra.de).ref));
      desenharLacos();
      return;
    }
    if (!arrastando) {
      return;
    }
    const pt = pontoCliente(evento);
    const rect = canvas.getBoundingClientRect();
    const nx = (pt.x - rect.left) / escala - arrasteOffsetX;
    const ny = (pt.y - rect.top) / escala - arrasteOffsetY;
 
     if (Math.abs(nx - (arrastando.ref.x || 0)) > 3 || Math.abs(ny - (arrastando.ref.y || 0)) > 3) {
       if (!moveu) {
         empilharUndo();
       }
       moveu = true;
     }
      const dx = nx - (arrastando.ref.x || 0);
      const dy = ny - (arrastando.ref.y || 0);
      arrastando.ref.x = nx;
      arrastando.ref.y = ny;
      if (arrastando.tipo === "pai" && (dx || dy)) {
        moverRamo(arrastando.ref, dx, dy);
      } else if (arrastando.tipo === "filho" && (dx || dy)) {
        (arrastando.ref.filhos || []).forEach((neto) => {
          if (typeof neto.x === "number") {
            neto.x = neto.x + dx;
          }
          if (typeof neto.y === "number") {
            neto.y = neto.y + dy;
          }
        });
      }
 
    const centroArraste = centroDoNoPorId(arrastando.ref.id) || { x: arrastando.ref.x + 75, y: arrastando.ref.y + 25 };
    const alvoDrop = arrastando.tipo === "pai" ? null : noProximo(centroArraste.x, centroArraste.y, arrastando.ref, 110);
 
    if (moveu) {
      if (arrastando.tipo !== "solto" && !alvoDrop) {
        empurrar(arrastando);
      }
      marcarUsoMapa();
    }
    renderizarRoadmap();
    if (moveu && arrastando.tipo !== "pai") {
      destacarAlvo(alvoDrop);
    }
  });
 
  window.addEventListener("pointerup", (evento) => {
    if (arrastandoCamera) {
      const moveuCam = arrastandoCamera.moveu;
      arrastandoCamera = null;
      if (viewport) {
        viewport.classList.remove("pan-ativo");
      }
      if (moveuCam) {
        return;
      }
    }
    if (ligandoExtra) {
      const pt = pontoCliente(evento);
      const rect = canvas.getBoundingClientRect();
      const mx = (pt.x - rect.left) / escala;
      const my = (pt.y - rect.top) / escala;
      const destino = noSobPonto(mx, my, acharNoPorId(ligandoExtra.de) && acharNoPorId(ligandoExtra.de).ref);
      if (destino && destino.ref && destino.ref.id !== ligandoExtra.de) {
        criarLigacaoExtra(ligandoExtra.de, destino.ref.id);
      }
      ligandoExtra = null;
      destacarAlvo(null);
      renderizarRoadmap();
      persistirJogoAtual();
      agendarSalvar();
      return;
    }
    if (arrastando && moveu) {
      if (arrastando.tipo !== "pai") {
        const centro = centroDoNoPorId(arrastando.ref.id) || { x: arrastando.ref.x + 75, y: arrastando.ref.y + 25 };
        const destino = noProximo(centro.x, centro.y, arrastando.ref, 110);
        if (destino && destino.ref !== arrastando.ref) {
          if (destino.tipo === "solto") {
            criarLigacaoExtra(arrastando.ref.id, destino.ref.id);
          } else {
            religarNo(arrastando, destino);
          }
        }
      }
      persistirJogoAtual();
      agendarSalvar();
      destacarAlvo(null);
      renderizarRoadmap();
    }
    arrastando = null;
  });
 
  window.addEventListener("pointercancel", () => {
    ligandoExtra = null;
    arrastando = null;
    arrastandoCamera = null;
    if (viewport) {
      viewport.classList.remove("pan-ativo");
    }
    destacarAlvo(null);
  });
 
   viewport.addEventListener("click", (evento) => {
     if (evento.target.closest(".combo-cores")) {
       return;
     }
     if (!evento.target.closest(".btn-cores-no")) {
       fecharComboCores();
     }
      if (recemPan) {
        recemPan = false;
        return;
      }
      if (evento.target === viewport || evento.target === canvas || evento.target === svgLacos) {
        if (zoomPilarId) {
          zoomOut();
        }
      }
   });
 
   window.addEventListener("resize", () => {
     if (document.getElementById("view-roadmap").classList.contains("active")) {
       aposPainelMudar();
     }
   });
  
   viewport.addEventListener("wheel", (evento) => {
     evento.preventDefault();
     const fator = evento.deltaY < 0 ? 1.12 : 1 / 1.12;
     aplicarZoomEmPonto(escala * fator, evento.clientX, evento.clientY);
   }, { passive: false });
  
     document.getElementById("btn-zoom-in").addEventListener("click", () => {
     if (!viewport) {
       return;
     }
     const rect = viewport.getBoundingClientRect();
     aplicarZoomEmPonto(escala * 1.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
   });
  
    document.getElementById("btn-zoom-out").addEventListener("click", () => {
      if (escala <= zoomMinAtual + 0.001) {
        return;
      }
      if (!viewport) {
        return;
      }
      const rect = viewport.getBoundingClientRect();
      aplicarZoomEmPonto(escala / 1.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
 
  function nomeJogoAtual() {
    const opt = selectJogo.options[selectJogo.selectedIndex];
    return opt && opt.value ? opt.textContent.trim() : "";
  }
 
  function avisarToolbar(texto) {
    const dica = document.querySelector(".roadmap-dica");
    if (!dica) {
      statusConfig(texto);
      return;
    }
    if (!dica.dataset.original) {
      dica.dataset.original = dica.textContent;
    }
    dica.textContent = texto;
    dica.classList.add("aviso");
    window.clearTimeout(avisarToolbar.timer);
    avisarToolbar.timer = window.setTimeout(() => {
      dica.textContent = dica.dataset.original;
      dica.classList.remove("aviso");
    }, 2800);
  }
 
  function duplicarJogoAtual() {
    const origem = selectJogo.value;
    const nomeOrigem = nomeJogoAtual();
    if (!origem || !nomeOrigem) {
      avisarToolbar("Escolhe um jogo no centro do mapa antes de duplicar.");
      return;
    }
    persistirJogoAtual();
    let copia = 2;
    let nomeNovo = nomeOrigem + " (copia)";
    while ([...selectJogo.options].some((opt) => slug(opt.textContent) === slug(nomeNovo))) {
      nomeNovo = nomeOrigem + " (copia " + copia + ")";
      copia += 1;
    }
    const valorNovo = slug(nomeNovo);
    const cardOrigem = [...lista.querySelectorAll(".card-ideia")].find((card) => slug(card.querySelector("h3").textContent) === origem);
    const descricao = cardOrigem ? cardOrigem.querySelector(".descricao").textContent : "";
    montarCardIdeia(nomeNovo, descricao);
    adicionarJogoNoSelect(nomeNovo);
    const snap = dadosJogos[origem] ? JSON.parse(JSON.stringify(dadosJogos[origem])) : {
      campos: {},
      imagens: {},
      pilares: snapshotPilares(),
      seqNo: seqNo,
      proximaPaleta: proximaPaleta,
      ligacoesExtras: JSON.parse(JSON.stringify(ligacoesExtras)),
      soltos: JSON.parse(JSON.stringify(soltos))
    };
    dadosJogos[valorNovo] = snap;
    escolherJogo(valorNovo, nomeNovo);
    registrarAtividade('Voce duplicou "' + nomeOrigem + '"');
    agendarSalvar();
  }
 
  function exportarMapaAtual() {
    if (!selectJogo.value) {
      avisarToolbar("Escolhe um jogo no centro do mapa antes de exportar.");
      return;
    }
    persistirJogoAtual();
    const nome = nomeJogoAtual() || "mapa";
    const blob = new Blob([JSON.stringify({
      jogo: nome,
      pilares: pilares,
      ligacoesExtras: ligacoesExtras,
      soltos: soltos,
      seqNo: seqNo,
      proximaPaleta: proximaPaleta
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slug(nome) + "-mapa.json";
    a.click();
    URL.revokeObjectURL(url);
  }
 
  const btnDuplicar = document.getElementById("btn-duplicar-jogo");
  if (btnDuplicar) {
    btnDuplicar.addEventListener("click", duplicarJogoAtual);
  }
  const btnDesfazer = document.getElementById("btn-desfazer");
  if (btnDesfazer) {
    btnDesfazer.addEventListener("click", desfazerMapa);
  }
  const btnRefazer = document.getElementById("btn-refazer");
  if (btnRefazer) {
    btnRefazer.addEventListener("click", refazerMapa);
  }
  const btnExportarMapa = document.getElementById("btn-exportar-mapa");
  if (btnExportarMapa) {
    btnExportarMapa.addEventListener("click", exportarMapaAtual);
  }
 
  window.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      if (modalConfirma && modalConfirma.classList.contains("aberto")) {
        fecharConfirma();
        return;
      }
      const aberto = document.querySelector(".modal-ideia.aberto, .modal-task.aberto, .modal-bloqueio.aberto, .modal-notas.aberto, .modal-pilar.aberto, .modal-filho.aberto, .modal-nota.aberto");
      if (aberto) {
        aberto.classList.remove("aberto");
        if (aberto.classList.contains("modal-ideia")) {
          resetarModalIdeia();
        }
        return;
      }
       if (comboCoresEl && !comboCoresEl.hidden) {
         fecharComboCores();
         return;
       }
       if (viewRoadmap && viewRoadmap.classList.contains("painel-visivel")) {
         painelTravado = false;
         esconderPainel(true);
       }
      return;
    }
    if (!(evento.ctrlKey || evento.metaKey)) {
      return;
    }
    const tag = (evento.target && evento.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") {
      return;
    }
    const tecla = evento.key.toLowerCase();
    if (tecla === "z" && !evento.shiftKey) {
      evento.preventDefault();
      desfazerMapa();
      return;
    }
    if (tecla === "y" || (tecla === "z" && evento.shiftKey)) {
      evento.preventDefault();
      refazerMapa();
    }
  });
  atualizarBotaoDesfazer();
 
  const modalPilar = document.querySelector(".modal-pilar");
  const formPilar = document.querySelector(".form-pilar");
  const modalFilho = document.querySelector(".modal-filho");
  const formFilho = document.querySelector(".form-filho");
  let alvoNo = null;
 
   function escolherPaletaNovo(cores) {
     paletaNovoPilar = cores;
     montarPaletas(document.getElementById("paleta-opcoes-novo"), paletaNovoPilar, escolherPaletaNovo);
   }
 
   document.querySelector(".btn-add-pilar").addEventListener("click", () => {
     modalPilar.classList.add("aberto");
     document.getElementById("nome-pilar").value = "";
     document.querySelector(".erro-pilar").textContent = "";
     paletaNovoPilar = paletaDaVez();
     escolherPaletaNovo(paletaNovoPilar);
   });
 
  document.querySelector(".btn-cancelar-pilar").addEventListener("click", () => {
    modalPilar.classList.remove("aberto");
  });
 
  formPilar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = document.getElementById("nome-pilar").value.trim();
    const erro = document.querySelector(".erro-pilar");
    if (!nome) {
      erro.textContent = "Da um nome pro pilar.";
      return;
    }
    erro.textContent = "";
 
    const angulo = (pilares.length / 8) * Math.PI * 2 - Math.PI / 2;
    const raio = 620;
    empilharUndo();
     pilares.push({
       id: "pilar-" + Date.now(),
       nome: nome,
       x: CENTRO_X - 100 + Math.cos(angulo) * raio,
       y: CENTRO_Y - 38 + Math.sin(angulo) * raio * 0.7,
       aba: null,
        cores: clonarPaleta(paletaNovoPilar),
       feito: false,
       minimizado: true,
       fixo: false,
       nota: "",
       filhos: []
     });
 
    modalPilar.classList.remove("aberto");
    renderizarRoadmap();
    aposMudarMapa();
  });
 
  function abrirModalNo(tipo, pilarId, filhoId) {
    alvoNo = { tipo: tipo, pilarId: pilarId, filhoId: filhoId };
    const titulo = document.getElementById("titulo-modal-filho");
    titulo.textContent = tipo === "derivacao" ? "Nova derivacao" : "Novo filho";
    modalFilho.classList.add("aberto");
    document.getElementById("nome-filho").value = "";
    document.querySelector(".erro-filho").textContent = "";
  }
 
  document.querySelector(".btn-cancelar-filho").addEventListener("click", () => {
    modalFilho.classList.remove("aberto");
    alvoNo = null;
  });
 
  formFilho.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = document.getElementById("nome-filho").value.trim();
    const erro = document.querySelector(".erro-filho");
    if (!nome) {
      erro.textContent = "Da um nome.";
      return;
    }
    if (!alvoNo) {
      return;
    }
    const pilar = pilares.find((p) => p.id === alvoNo.pilarId);
    if (!pilar) {
      return;
    }
    empilharUndo();
    if (alvoNo.tipo === "derivacao") {
      const filho = pilar.filhos.find((f) => f.id === alvoNo.filhoId);
      if (!filho) {
        return;
      }
      const novo = filhoObj(nome);
      const base = baseNeto({ x: filho.x, y: filho.y }, pilar, (filho.filhos || []).length, (filho.filhos || []).length + 1);
      novo.x = base.x;
      novo.y = base.y;
      filho.filhos.push(novo);
    } else {
      const novo = filhoObj(nome);
      const base = baseFilho(pilar, pilar.filhos.length, pilar.filhos.length + 1);
      novo.x = base.x;
      novo.y = base.y;
      pilar.filhos.push(novo);
    }
    modalFilho.classList.remove("aberto");
    alvoNo = null;
    renderizarRoadmap();
    aposMudarMapa();
  });
 
  const modalNota = document.querySelector(".modal-nota");
  const formNota = document.querySelector(".form-nota");
  let alvoNota = null;
 
  function abrirModalNota(alvo, titulo) {
    alvoNota = alvo;
    document.getElementById("titulo-modal-nota").textContent = "Observacao: " + (titulo || "");
    document.getElementById("texto-nota").value = alvo.nota || "";
    modalNota.classList.add("aberto");
  }
 
  document.querySelector(".btn-cancelar-nota").addEventListener("click", () => {
    modalNota.classList.remove("aberto");
    alvoNota = null;
  });
 
  formNota.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!alvoNota) {
      return;
    }
    const novaNota = document.getElementById("texto-nota").value.trim();
    if (novaNota !== (alvoNota.nota || "")) {
      empilharUndo();
      alvoNota.nota = novaNota;
      aposMudarMapa();
    }
    modalNota.classList.remove("aberto");
    alvoNota = null;
    renderizarRoadmap();
  });
 
  const criarIdeia = document.querySelector(".btn-add-ideia");
  const modalIdeia = document.querySelector(".modal-ideia");
  const btnCancelar = document.querySelector(".btn-cancelar");
  const formIdeia = document.querySelector(".form-ideia");
  const lista = document.querySelector(".lista-ideias");
 
  function slug(texto) {
    return texto.trim().toLowerCase().replaceAll(" ", "-");
  }
 
  function adicionarJogoNoSelect(nome) {
    const valor = slug(nome);
    const jaExiste = [...selectJogo.options].some((opt) => opt.value === valor);
    if (jaExiste) {
      return;
    }
    const option = document.createElement("option");
    option.textContent = nome;
    option.value = valor;
    selectJogo.appendChild(option);
    atualizarListaCustom();
  }
 
  lista.querySelectorAll(".card-ideia").forEach((card) => {
    adicionarJogoNoSelect(card.querySelector("h3").textContent);
  });
 
  let ideiaEmEdicao = null;
 
  function resetarModalIdeia() {
    ideiaEmEdicao = null;
    document.getElementById("titulo-modal-ideia").textContent = "Nova ideia";
    document.getElementById("btn-salvar-ideia").textContent = "Criar ideia";
    document.getElementById("nome-ideia").value = "";
    document.getElementById("descricao-ideia").value = "";
    document.querySelector(".erro-nome").textContent = "";
  }
 
  function abrirEdicaoIdeia(card) {
    ideiaEmEdicao = card;
    document.getElementById("titulo-modal-ideia").textContent = "Editar ideia";
    document.getElementById("btn-salvar-ideia").textContent = "Salvar";
    document.getElementById("nome-ideia").value = card.querySelector("h3").textContent;
    document.getElementById("descricao-ideia").value = card.querySelector(".descricao").textContent;
    document.querySelector(".erro-nome").textContent = "";
    modalIdeia.classList.add("aberto");
  }
 
  function apagarIdeia(card) {
    const nome = card.querySelector("h3").textContent.trim();
    const valor = slug(nome);
    selectJogo.querySelectorAll("option").forEach((option) => {
      if (option.value === valor || option.textContent.trim() === nome) {
        if (selectJogo.value === option.value) {
          selectJogo.value = "";
          seletorBtn.textContent = "Escolha um jogo";
          atualizarNomeHub("Escolha um jogo");
          escreverFicha(null);
          jogoAnterior = "";
          resetarMapaPadrao();
          renderizarRoadmap();
          esconderPainel();
        }
        delete dadosJogos[option.value];
        option.remove();
      }
    });
    atualizarListaCustom();
    card.remove();
    atualizarListasVazias();
    registrarAtividade('Voce apagou a ideia "' + nome + '"');
    agendarSalvar();
  }
 
  criarIdeia.addEventListener("click", () => {
    resetarModalIdeia();
    modalIdeia.classList.add("aberto");
  });
 
  btnCancelar.addEventListener("click", () => {
    resetarModalIdeia();
    modalIdeia.classList.remove("aberto");
  });
 
  function abrirIdeiaNoMapa(card) {
    const nomeJogo = card.querySelector("h3").textContent.trim();
    const valorJogo = slug(nomeJogo);
    adicionarJogoNoSelect(nomeJogo);
    escolherJogo(valorJogo, nomeJogo);
    irParaView("view-roadmap");
  }
 
  lista.addEventListener("click", (evento) => {
    const card = evento.target.closest(".card-ideia");
    if (!card) {
      return;
    }
    if (evento.target.classList.contains("btn-apagar")) {
      pedirConfirmacao(card.querySelector("h3").textContent.trim(), () => apagarIdeia(card), { semToast: true });
      return;
    }
    if (evento.target.classList.contains("btn-editar-ideia")) {
      abrirEdicaoIdeia(card);
      return;
    }
    abrirIdeiaNoMapa(card);
  });
 
  formIdeia.addEventListener("submit", (evento) => {
    evento.preventDefault();
 
    const nome = document.getElementById("nome-ideia").value;
    const descricao = document.getElementById("descricao-ideia").value;
    const erroNome = document.querySelector(".erro-nome");
 
    if (nome.trim() === "") {
      erroNome.textContent = ideiaEmEdicao ? "Da um nome pra ideia antes de salvar." : "Da um nome pra ideia antes de criar.";
      return;
    }
 
    const valorNovo = slug(nome);
    const cardDuplicado = [...lista.querySelectorAll(".card-ideia")].find((c) => {
      return c !== ideiaEmEdicao && slug(c.querySelector("h3").textContent) === valorNovo;
    });
    if (cardDuplicado) {
      erroNome.textContent = "Ja existe uma ideia com esse nome.";
      return;
    }
 
    erroNome.textContent = "";
 
    if (ideiaEmEdicao) {
      const nomeAntigo = ideiaEmEdicao.querySelector("h3").textContent.trim();
      const valorAntigo = slug(nomeAntigo);
      ideiaEmEdicao.querySelector("h3").textContent = nome.trim();
      ideiaEmEdicao.querySelector(".descricao").textContent = descricao;
      if (valorAntigo !== valorNovo) {
        if (jogoAnterior === valorAntigo) {
          persistirJogoAtual();
        }
        const opt = [...selectJogo.options].find((o) => o.value === valorAntigo);
        if (opt) {
          opt.value = valorNovo;
          opt.textContent = nome.trim();
        }
        if (dadosJogos[valorAntigo]) {
          dadosJogos[valorNovo] = dadosJogos[valorAntigo];
          delete dadosJogos[valorAntigo];
        }
        if (jogoAnterior === valorAntigo) {
          jogoAnterior = valorNovo;
          selectJogo.value = valorNovo;
          seletorBtn.textContent = nome.trim();
          atualizarNomeHub(nome.trim());
        }
        registrarAtividade('Voce renomeou "' + nomeAntigo + '" para "' + nome.trim() + '"');
      } else {
        const opt = [...selectJogo.options].find((o) => o.value === valorAntigo);
        if (opt) {
          opt.textContent = nome.trim();
        }
        if (selectJogo.value === valorNovo) {
          seletorBtn.textContent = nome.trim();
          atualizarNomeHub(nome.trim());
        }
        registrarAtividade('Voce editou a ideia "' + nome.trim() + '"');
      }
      atualizarListaCustom();
    } else {
      montarCardIdeia(nome, descricao);
      adicionarJogoNoSelect(nome);
      registrarAtividade('Voce criou a ideia "' + nome.trim() + '"');
    }
 
    modalIdeia.classList.remove("aberto");
    resetarModalIdeia();
    atualizarListasVazias();
    agendarSalvar();
  });
 
  const btnAddTask = document.querySelector(".btn-add-task");
  const modalTask = document.querySelector(".modal-task");
  const formTask = document.querySelector(".form-task");
  const btnCancelarTarefa = document.querySelector(".btn-cancelar-tarefa");
  const listaTask = document.querySelector(".lista-task");
 
  btnAddTask.addEventListener("click", () => {
    modalTask.classList.add("aberto");
  });
 
  btnCancelarTarefa.addEventListener("click", () => {
    modalTask.classList.remove("aberto");
  });
 
  listaTask.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("btn-excluir-task")) {
      return;
    }
    evento.target.closest(".item-task").remove();
    agendarSalvar();
  });
 
  listaTask.addEventListener("change", (evento) => {
    if (evento.target.type !== "checkbox") {
      return;
    }
 
    const item = evento.target.closest(".item-task");
 
    if (evento.target.checked) {
      item.classList.add("feita");
 
      const nome = item.querySelector(".tarefa-texto").textContent;
      const historico = document.querySelector(".lista-atividade");
      const registro = document.createElement("li");
      const texto = document.createElement("span");
      const hora = document.createElement("span");
 
      texto.classList.add("atividade-texto");
      hora.classList.add("atividade-hora");
      texto.textContent = 'Voce concluiu "' + nome + '"';
      hora.textContent = new Date().toLocaleString("pt-BR");
 
      registro.appendChild(texto);
      registro.appendChild(hora);
      historico.prepend(registro);
    } else {
      item.classList.remove("feita");
    }
    agendarSalvar();
  });
 
  formTask.addEventListener("submit", (evento) => {
    evento.preventDefault();
 
    const nome = document.getElementById("nome-da-task").value.trim();
    if (nome === "") {
      return;
    }
 
    const prioridade = formTask.querySelector('input[name="prioridade"]:checked').value;
 
    const item = document.createElement("li");
    const check = document.createElement("input");
    const texto = document.createElement("span");
    const selo = document.createElement("span");
    const btnX = document.createElement("button");
 
    item.classList.add("item-task");
    check.type = "checkbox";
    texto.classList.add("tarefa-texto");
    texto.textContent = nome;
    selo.classList.add("prioridade", prioridade);
    selo.textContent = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
    btnX.type = "button";
    btnX.classList.add("btn-excluir-task");
    btnX.textContent = "×";
 
    item.appendChild(check);
    item.appendChild(texto);
    item.appendChild(selo);
    item.appendChild(btnX);
    listaTask.appendChild(item);
    registrarAtividade('Voce criou a tarefa "' + nome + '"');
 
    modalTask.classList.remove("aberto");
    document.getElementById("nome-da-task").value = "";
    agendarSalvar();
  });
 
  const btnSessao = document.querySelector(".btn-sessao");
  const tempoSessao = document.getElementById("tempo-sessao");
  const selectFerramenta = document.getElementById("ferramenta-ativa");
  const inputFerramenta = document.getElementById("nova-ferramenta");
  const btnAddFerramenta = document.querySelector(".btn-add-ferramenta");
  const btnDelFerramenta = document.querySelector(".btn-del-ferramenta");
  const tempoHojeEl = document.querySelector(".tempo-hoje");
  const metaFill = document.querySelector(".meta-fill");
  const metaStatus = document.querySelector(".meta-status");
  const barraTempo = document.querySelector(".barra-tempo");
 
  let segundos = 0;
  let totalHoje = 0;
  let diaTempo = "";
  let intervalo = null;
 
  const tempos = {
    vs: 0,
    godot: 0,
    blender: 0,
    pixel: 0
  };
 
  function dataLocalHoje() {
    const agora = new Date();
    return agora.getFullYear() + "-" + String(agora.getMonth() + 1).padStart(2, "0") + "-" + String(agora.getDate()).padStart(2, "0");
  }
 
  function garantirTempoDoDia() {
    const hoje = dataLocalHoje();
    if (diaTempo !== hoje) {
      diaTempo = hoje;
      totalHoje = 0;
      Object.keys(tempos).forEach((id) => {
        tempos[id] = 0;
      });
    }
  }
 
  function formatarTempo(total) {
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segs = total % 60;
 
    if (horas > 0) {
      return horas + "h " + minutos + "min";
    }
    if (minutos > 0) {
      return minutos + "min " + segs + "s";
    }
    return segs + "s";
  }
 
  function atualizarMeta() {
    const metaHoras = Number(document.getElementById("meta-hoje").value) || 0;
    const metaSegundos = metaHoras * 3600;
    garantirTempoDoDia();
    const porcento = metaSegundos === 0 ? 0 : Math.min(100, (totalHoje / metaSegundos) * 100);
 
    metaFill.style.width = porcento + "%";
    tempoHojeEl.textContent = "Tempo de hoje: " + formatarTempo(totalHoje);
    metaStatus.textContent = formatarTempo(totalHoje) + " / " + metaHoras + "h";
  }
 
  function atualizarBarra() {
    let soma = 0;
    for (const id in tempos) {
      soma = soma + tempos[id];
    }
 
    barraTempo.querySelectorAll(".seg").forEach((seg) => {
      const id = seg.dataset.ferramenta;
      const parte = tempos[id] || 0;
      const n = barraTempo.querySelectorAll(".seg").length || 1;
      seg.style.width = soma === 0 ? (100 / n) + "%" : ((parte / soma) * 100) + "%";
      seg.textContent = seg.dataset.nome + ": " + formatarTempo(parte);
    });
  }
 
  btnSessao.addEventListener("click", () => {
    if (intervalo === null) {
      segundos = 0;
      intervalo = setInterval(() => {
        segundos = segundos + 1;
        garantirTempoDoDia();
        totalHoje = totalHoje + 1;
 
        const id = selectFerramenta.value;
        tempos[id] = (tempos[id] || 0) + 1;
 
        tempoSessao.textContent = formatarTempo(segundos);
        atualizarMeta();
        atualizarBarra();
        agendarSalvar();
      }, 1000);
 
      btnSessao.textContent = "Parar sessao";
    } else {
      clearInterval(intervalo);
      intervalo = null;
      btnSessao.textContent = "Iniciar nova sessao";
    }
  });
 
  btnAddFerramenta.addEventListener("click", () => {
    const nome = inputFerramenta.value.trim();
    if (nome === "") {
      return;
    }
 
    const id = nome.toLowerCase().replaceAll(" ", "-");
    if (tempos[id] !== undefined) {
      return;
    }
 
    tempos[id] = 0;
 
    const option = document.createElement("option");
    option.value = id;
    option.textContent = nome;
    selectFerramenta.appendChild(option);
 
    const seg = document.createElement("div");
    seg.classList.add("seg");
    seg.dataset.ferramenta = id;
    seg.dataset.nome = nome;
    seg.style.width = "0%";
    seg.textContent = nome + ": 0s";
    barraTempo.appendChild(seg);
 
    inputFerramenta.value = "";
    agendarSalvar();
  });
 
  btnDelFerramenta.addEventListener("click", () => {
    const id = selectFerramenta.value;
    if (!id || selectFerramenta.options.length === 1) {
      return;
    }
 
    delete tempos[id];
 
    selectFerramenta.querySelectorAll("option").forEach((opt) => {
      if (opt.value === id) {
        opt.remove();
      }
    });
 
    barraTempo.querySelectorAll(".seg").forEach((seg) => {
      if (seg.dataset.ferramenta === id) {
        seg.remove();
      }
    });
 
    atualizarBarra();
    agendarSalvar();
  });
 
  const btnAddBloqueio = document.querySelector(".btn-add-bloqueio");
  const modalBloqueio = document.querySelector(".modal-bloqueio");
  const formBloqueio = document.querySelector(".form-bloqueio");
  const btnCancelarBloqueio = document.querySelector(".btn-cancelar-bloqueio");
  const listaBloqueios = document.querySelector(".lista-bloqueios");
 
  btnAddBloqueio.addEventListener("click", () => {
    modalBloqueio.classList.add("aberto");
  });
 
  btnCancelarBloqueio.addEventListener("click", () => {
    modalBloqueio.classList.remove("aberto");
  });
 
  listaBloqueios.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("btn-excluir-bloqueio")) {
      return;
    }
    evento.target.closest(".item-bloqueio").remove();
    agendarSalvar();
  });
 
  formBloqueio.addEventListener("submit", (evento) => {
    evento.preventDefault();
 
    const texto = document.getElementById("texto-bloqueio").value.trim();
    if (texto === "") {
      return;
    }
 
    const item = document.createElement("li");
    const paragrafo = document.createElement("p");
    const btnX = document.createElement("button");
 
    item.classList.add("item-bloqueio");
    paragrafo.classList.add("bloqueio-texto");
    paragrafo.textContent = texto;
    btnX.type = "button";
    btnX.classList.add("btn-excluir-bloqueio");
    btnX.textContent = "×";
 
    item.appendChild(paragrafo);
    item.appendChild(btnX);
    listaBloqueios.appendChild(item);
    registrarAtividade("Voce registrou um bloqueio");
 
    modalBloqueio.classList.remove("aberto");
    document.getElementById("texto-bloqueio").value = "";
    agendarSalvar();
  });
 
  const btnAddNota = document.querySelector(".adicionar-nota");
  const modalNotas = document.querySelector(".modal-notas");
  const formNotas = document.querySelector(".form-notas");
  const btnCancelarNotas = document.querySelector(".btn-cancelar-notas");
  const listaNotas = document.querySelector(".notas-rapidas-ul");
 
  btnAddNota.addEventListener("click", () => {
    modalNotas.classList.add("aberto");
  });
 
  btnCancelarNotas.addEventListener("click", () => {
    modalNotas.classList.remove("aberto");
  });
 
  listaNotas.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("btn-excluir-nota")) {
      return;
    }
    evento.target.closest(".notas-rapidas-li").remove();
    agendarSalvar();
  });
 
  formNotas.addEventListener("submit", (evento) => {
    evento.preventDefault();
 
    const texto = document.getElementById("texto-notas-rapidas").value.trim();
    if (texto === "") {
      return;
    }
 
    const item = document.createElement("li");
    const paragrafo = document.createElement("p");
    const btnX = document.createElement("button");
 
    item.classList.add("notas-rapidas-li");
    paragrafo.classList.add("notas-rapidas-p");
    paragrafo.textContent = texto;
    btnX.type = "button";
    btnX.classList.add("btn-excluir-nota");
    btnX.textContent = "×";
 
    item.appendChild(paragrafo);
    item.appendChild(btnX);
    listaNotas.appendChild(item);
    registrarAtividade("Voce adicionou uma nota rapida");
 
    modalNotas.classList.remove("aberto");
    document.getElementById("texto-notas-rapidas").value = "";
    agendarSalvar();
  });
 
  function coletarEstado() {
    const ideias = [...lista.querySelectorAll(".card-ideia")].map((card) => ({
      nome: card.querySelector("h3").textContent,
      descricao: card.querySelector(".descricao").textContent
    }));
 
    const tarefas = [...listaTask.querySelectorAll(".item-task")].map((item) => ({
      texto: item.querySelector(".tarefa-texto").textContent,
      prioridade: item.querySelector(".prioridade").classList.contains("alta")
        ? "alta"
        : item.querySelector(".prioridade").classList.contains("media")
          ? "media"
          : "baixa",
      feita: item.classList.contains("feita") || item.querySelector("input").checked
    }));
 
    const atividades = [...document.querySelectorAll(".lista-atividade li")].map((item) => ({
      texto: item.querySelector(".atividade-texto").textContent,
      hora: item.querySelector(".atividade-hora").textContent
    }));
 
    const bloqueios = [...listaBloqueios.querySelectorAll(".item-bloqueio")].map((item) => ({
      texto: item.querySelector(".bloqueio-texto").textContent
    }));
 
    const notas = [...listaNotas.querySelectorAll(".notas-rapidas-li")].map((item) => ({
      texto: item.querySelector(".notas-rapidas-p").textContent
    }));
 
    const ferramentas = [...selectFerramenta.options].map((opt) => ({
      id: opt.value,
      nome: opt.textContent,
      tempo: tempos[opt.value] || 0
    }));
 
    persistirJogoAtual();
 
    return {
      ideias: ideias,
      dadosJogos: dadosJogos,
      jogoAtual: selectJogo.value,
      pilares: pilares,
      seqNo: seqNo,
      proximaPaleta: proximaPaleta,
      ligacoesExtras: ligacoesExtras,
      soltos: soltos,
      tarefas: tarefas,
      atividades: atividades,
      bloqueios: bloqueios,
      notas: notas,
      ferramentas: ferramentas,
      totalHoje: totalHoje,
      diaTempo: diaTempo,
       metaHoje: Number(document.getElementById("meta-hoje").value) || 8,
       prefs: JSON.parse(JSON.stringify(prefs)),
       limpezaTesteDash: true
     };
   }
 
  function montarCardIdeia(nome, descricao) {
    const card = document.createElement("div");
    const titulo = document.createElement("h3");
    const texto = document.createElement("p");
    const acoes = document.createElement("div");
    const btnAbrir = document.createElement("button");
    const btnEditar = document.createElement("button");
    const btnApagar = document.createElement("button");
    card.classList.add("card-ideia");
    texto.classList.add("descricao");
    acoes.classList.add("card-ideia-acoes");
    btnAbrir.classList.add("btn-abrir-roadmap");
    btnAbrir.type = "button";
    btnAbrir.textContent = "Abrir no mapa";
    btnEditar.classList.add("btn-editar-ideia");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnApagar.classList.add("btn-apagar");
    btnApagar.type = "button";
    btnApagar.textContent = "Apagar";
    titulo.textContent = nome;
    texto.textContent = descricao;
    acoes.appendChild(btnAbrir);
    acoes.appendChild(btnEditar);
    acoes.appendChild(btnApagar);
    card.appendChild(titulo);
    card.appendChild(texto);
    card.appendChild(acoes);
    lista.insertBefore(card, criarIdeia);
    atualizarListasVazias();
  }
 
  function montarTarefa(dados) {
    const item = document.createElement("li");
    const check = document.createElement("input");
    const texto = document.createElement("span");
    const selo = document.createElement("span");
    const btnX = document.createElement("button");
    item.classList.add("item-task");
    check.type = "checkbox";
    texto.classList.add("tarefa-texto");
    texto.textContent = dados.texto;
    selo.classList.add("prioridade", dados.prioridade);
    selo.textContent = dados.prioridade.charAt(0).toUpperCase() + dados.prioridade.slice(1);
    btnX.type = "button";
    btnX.classList.add("btn-excluir-task");
    btnX.textContent = "×";
    if (dados.feita) {
      item.classList.add("feita");
      check.checked = true;
    }
    item.appendChild(check);
    item.appendChild(texto);
    item.appendChild(selo);
    item.appendChild(btnX);
    listaTask.appendChild(item);
  }
 
  function estadoEhBackup(estado) {
    return !!(estado && typeof estado === "object" && (Array.isArray(estado.ideias) || (estado.dadosJogos && typeof estado.dadosJogos === "object")));
  }
 
  function aplicarEstado(estado) {
    historicoMapa = [];
    futuroMapa = [];
    lista.querySelectorAll(".card-ideia").forEach((card) => card.remove());
    selectJogo.querySelectorAll("option").forEach((opt) => {
      if (opt.value) {
        opt.remove();
      }
    });
    (estado.ideias || []).forEach((ideia) => {
      montarCardIdeia(ideia.nome, ideia.descricao);
      adicionarJogoNoSelect(ideia.nome);
    });
 
    Object.keys(dadosJogos).forEach((chave) => {
      delete dadosJogos[chave];
    });
    Object.assign(dadosJogos, estado.dadosJogos || {});
 
    if (Array.isArray(estado.pilares) && estado.pilares.length) {
      pilares = estado.pilares;
    }
    if (typeof estado.seqNo === "number") {
      seqNo = estado.seqNo;
    }
    if (typeof estado.proximaPaleta === "number") {
      proximaPaleta = estado.proximaPaleta;
    }
    ligacoesExtras = Array.isArray(estado.ligacoesExtras) ? estado.ligacoesExtras : [];
    soltos = Array.isArray(estado.soltos) ? estado.soltos : [];
    garantirPosicoes();
    sincronizarSeqNo();
    migrarSubramos();
 
    const jogo = estado.jogoAtual || "";
    if (jogo && [...selectJogo.options].some((opt) => opt.value === jogo)) {
      const opt = [...selectJogo.options].find((o) => o.value === jogo);
      selectJogo.value = jogo;
      seletorBtn.textContent = opt.textContent;
      atualizarNomeHub(opt.textContent);
      escreverFicha(dadosJogos[jogo]);
      jogoAnterior = jogo;
      carregarRoadmapDoJogo(jogo);
      esconderPainel();
    } else {
      selectJogo.value = "";
      seletorBtn.textContent = "Escolha um jogo";
      atualizarNomeHub("Escolha um jogo");
      escreverFicha(null);
      jogoAnterior = "";
      resetarMapaPadrao();
      esconderPainel();
    }
 
    listaTask.innerHTML = "";
    (estado.tarefas || []).forEach(montarTarefa);
 
    const historico = document.querySelector(".lista-atividade");
    historico.innerHTML = "";
    (estado.atividades || []).forEach((atividade) => {
      const registro = document.createElement("li");
      const texto = document.createElement("span");
      const hora = document.createElement("span");
      texto.classList.add("atividade-texto");
      hora.classList.add("atividade-hora");
      texto.textContent = atividade.texto;
      hora.textContent = atividade.hora;
      registro.appendChild(texto);
      registro.appendChild(hora);
      historico.appendChild(registro);
    });
 
    listaBloqueios.innerHTML = "";
    (estado.bloqueios || []).forEach((bloqueio) => {
      const item = document.createElement("li");
      const paragrafo = document.createElement("p");
      const btnX = document.createElement("button");
      item.classList.add("item-bloqueio");
      paragrafo.classList.add("bloqueio-texto");
      paragrafo.textContent = bloqueio.texto;
      btnX.type = "button";
      btnX.classList.add("btn-excluir-bloqueio");
      btnX.textContent = "×";
      item.appendChild(paragrafo);
      item.appendChild(btnX);
      listaBloqueios.appendChild(item);
    });
 
    listaNotas.innerHTML = "";
    (estado.notas || []).forEach((nota) => {
      const item = document.createElement("li");
      const paragrafo = document.createElement("p");
      const btnX = document.createElement("button");
      item.classList.add("notas-rapidas-li");
      paragrafo.classList.add("notas-rapidas-p");
      paragrafo.textContent = nota.texto;
      btnX.type = "button";
      btnX.classList.add("btn-excluir-nota");
      btnX.textContent = "×";
      item.appendChild(paragrafo);
      item.appendChild(btnX);
      listaNotas.appendChild(item);
    });
 
    if (Array.isArray(estado.ferramentas) && estado.ferramentas.length) {
      Object.keys(tempos).forEach((id) => {
        delete tempos[id];
      });
      selectFerramenta.innerHTML = "";
      barraTempo.innerHTML = "";
      estado.ferramentas.forEach((ferramenta) => {
        tempos[ferramenta.id] = ferramenta.tempo || 0;
        const option = document.createElement("option");
        option.value = ferramenta.id;
        option.textContent = ferramenta.nome;
        selectFerramenta.appendChild(option);
        const seg = document.createElement("div");
        seg.classList.add("seg");
        if (["vs", "godot", "blender", "pixel"].indexOf(ferramenta.id) !== -1) {
          seg.classList.add(ferramenta.id);
        }
        seg.dataset.ferramenta = ferramenta.id;
        seg.dataset.nome = ferramenta.nome;
        seg.style.width = "25%";
        seg.textContent = ferramenta.nome + ": 0s";
        barraTempo.appendChild(seg);
      });
    }
 
     diaTempo = estado.diaTempo || dataLocalHoje();
     totalHoje = estado.totalHoje || 0;
     garantirTempoDoDia();
     if (estado.metaHoje) {
       document.getElementById("meta-hoje").value = estado.metaHoje;
     }
     if (estado.prefs) {
       Object.assign(prefs, estado.prefs);
       if (estado.prefs.cores) {
         prefs.cores = Object.assign({}, prefs.cores, estado.prefs.cores);
       }
       if (estado.prefs.contato) {
         prefs.contato = Object.assign({}, prefs.contato, estado.prefs.contato);
       }
       aplicarPrefsNaTela();
     }
     atualizarMeta();
     atualizarBarra();
     renderizarRoadmap();
     atualizarListasVazias();
     atualizarBotaoDesfazer();
   }
 
   function salvarAgora() {
     if (!persistenciaLigada) {
       return;
     }
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(coletarEstado()));
     } catch (erro) {
       persistenciaLigada = false;
       statusConfig("Nao deu para salvar (armazenamento cheio ou bloqueado). Tira imagens da ficha ou exporta o JSON.");
     }
   }
 
  function agendarSalvar() {
    atualizarResumoDash();
    if (!persistenciaLigada) {
      return;
    }
    if (timerSalvar) {
      clearTimeout(timerSalvar);
    }
    timerSalvar = setTimeout(salvarAgora, 250);
  }
 
     function limparDadosDeTeste(estado) {
       if (!estado || estado.limpezaTesteDash) {
         return estado;
       }
       estado.tarefas = [];
       estado.atividades = [];
       estado.bloqueios = [];
       estado.notas = [];
       estado.totalHoje = 0;
       estado.diaTempo = "";
       if (Array.isArray(estado.ferramentas)) {
         estado.ferramentas = estado.ferramentas.map((ferramenta) => ({
           id: ferramenta.id,
           nome: ferramenta.nome,
           tempo: 0
         }));
       }
       estado.limpezaTesteDash = true;
       return estado;
     }
 
     function carregarEstado() {
     let bruto = null;
     try {
       bruto = localStorage.getItem(STORAGE_KEY);
     } catch (erro) {
       bruto = null;
     }
      if (!bruto) {
        persistenciaLigada = true;
        return;
      }
      try {
        const parsed = limparDadosDeTeste(JSON.parse(bruto));
        aplicarEstado(parsed);
        if (parsed.limpezaTesteDash) {
          persistenciaLigada = true;
          salvarAgora();
        }
      } catch (erro) {
        persistenciaLigada = false;
        statusConfig("Os dados salvos estao corrompidos. Nada foi apagado. Exporta se puder, ou reseta em Configuracoes.");
        return;
      }
      persistenciaLigada = true;
    }
 
  document.getElementById("meta-hoje").addEventListener("input", agendarSalvar);
  window.addEventListener("beforeunload", salvarAgora);
 
  function irParaView(id) {
    const botao = [...navButtons].find((btn) => btn.getAttribute("data-view") === id);
    if (botao) {
      botao.click();
    }
  }
 
  function cumprimentoDoDia(hora) {
    if (hora < 5 || hora >= 18) {
      return "Boa noite";
    }
    if (hora < 12) {
      return "Bom dia";
    }
    return "Boa tarde";
  }
 
  function rotuloQuantidade(qtd, um, varios) {
    if (qtd === 1) {
      return "1 " + um;
    }
    return qtd + " " + varios;
  }
 
  function atualizarResumoDash() {
    const listaTarefasEl = document.querySelector(".lista-task");
    const listaBloqueiosEl = document.querySelector(".lista-bloqueios");
    const listaNotasEl = document.querySelector(".notas-rapidas-ul");
    if (!listaTarefasEl || !listaBloqueiosEl || !listaNotasEl) {
      return;
    }
    const tarefas = [...listaTarefasEl.querySelectorAll(".item-task")];
    const feitas = tarefas.filter((item) => item.classList.contains("feita") || item.querySelector("input").checked).length;
    const abertas = tarefas.filter((item) => !item.classList.contains("feita") && !(item.querySelector("input") && item.querySelector("input").checked));
    const alta = abertas.filter((item) => item.querySelector(".prioridade.alta")).length;
    const media = abertas.filter((item) => item.querySelector(".prioridade.media")).length;
    const baixa = abertas.filter((item) => item.querySelector(".prioridade.baixa")).length;
    const bloqueios = listaBloqueiosEl.querySelectorAll(".item-bloqueio").length;
    const notas = listaNotasEl.querySelectorAll(".notas-rapidas-li").length;
    const contador = document.getElementById("contador-tarefas");
    const titulo = document.getElementById("dash-saudacao-titulo");
    const resumo = document.getElementById("dash-resumo");
    const agora = new Date();
    const dias = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
    const hora = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0");
    const nome = ((prefs.contato && prefs.contato.nome) || "").trim();
    const primeiroNome = nome.split(/\s+/)[0] || "";
    const saudacao = cumprimentoDoDia(agora.getHours()) + (primeiroNome ? ", " + primeiroNome + "!" : "!");
    const partes = [];
    if (alta) {
      partes.push(rotuloQuantidade(alta, "tarefa urgente", "tarefas urgentes"));
    }
    if (media) {
      partes.push(rotuloQuantidade(media, "tarefa media", "tarefas medias"));
    }
    if (baixa) {
      partes.push(rotuloQuantidade(baixa, "tarefa baixa", "tarefas baixas"));
    }
    const fila = partes.length ? partes.join(", ") : "Nenhuma tarefa em aberto";
    if (contador) {
      contador.textContent = feitas + "/" + tarefas.length;
    }
    if (titulo) {
      titulo.textContent = saudacao;
    }
    if (resumo) {
      resumo.textContent = dias[agora.getDay()] + " · " + hora + " · " + fila + " · " + bloqueios + " bloqueios";
    }
  }
 
  function coletarBusca() {
    const ideias = [...lista.querySelectorAll(".card-ideia")].map((card) => ({
      tipo: "Ideia",
      texto: card.querySelector("h3").textContent,
      extra: card.querySelector(".descricao").textContent,
      view: "view-ideias",
      el: card
    }));
    const tarefas = [...listaTask.querySelectorAll(".item-task")].map((item) => ({
      tipo: "Tarefa",
      texto: item.querySelector(".tarefa-texto").textContent,
      extra: item.querySelector(".prioridade").textContent,
      view: "view-visao-solo",
      el: item
    }));
    const bloqueios = [...listaBloqueios.querySelectorAll(".item-bloqueio")].map((item) => ({
      tipo: "Bloqueio",
      texto: item.querySelector(".bloqueio-texto").textContent,
      extra: "",
      view: "view-visao-solo",
      el: item
    }));
    const notas = [...listaNotas.querySelectorAll(".notas-rapidas-li")].map((item) => ({
      tipo: "Nota",
      texto: item.querySelector(".notas-rapidas-p").textContent,
      extra: "",
      view: "view-visao-solo",
      el: item
    }));
    return ideias.concat(tarefas, bloqueios, notas);
  }
 
  function coincide(texto, termo) {
    const t = texto.toLowerCase();
    const q = termo.toLowerCase();
    return t.indexOf(q) !== -1;
  }
 
  const inputBuscaGlobal = document.getElementById("busca-global");
  const dropdownBusca = document.getElementById("busca-dropdown");
 
  function fecharBusca() {
    if (dropdownBusca) {
      dropdownBusca.hidden = true;
      dropdownBusca.innerHTML = "";
    }
  }
 
  function destacarItem(el) {
    if (!el) {
      return;
    }
    el.classList.add("destaque-busca");
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setTimeout(() => el.classList.remove("destaque-busca"), 1600);
  }
 
  function renderizarBusca(termo) {
    if (!dropdownBusca) {
      return;
    }
    dropdownBusca.innerHTML = "";
    if (!termo) {
      fecharBusca();
      return;
    }
    const grupos = {};
    coletarBusca().forEach((item) => {
      if (!coincide(item.texto, termo) && !coincide(item.extra || "", termo)) {
        return;
      }
      if (!grupos[item.tipo]) {
        grupos[item.tipo] = [];
      }
      grupos[item.tipo].push(item);
    });
    const tipos = Object.keys(grupos);
    if (!tipos.length) {
      const vazio = document.createElement("li");
      vazio.className = "busca-vazio";
      vazio.textContent = "Nada encontrado para \"" + termo + "\"";
      dropdownBusca.appendChild(vazio);
      dropdownBusca.hidden = false;
      return;
    }
    tipos.forEach((tipo) => {
      const grupo = document.createElement("li");
      grupo.className = "busca-grupo";
      grupo.textContent = tipo;
      dropdownBusca.appendChild(grupo);
      grupos[tipo].forEach((item) => {
        const li = document.createElement("li");
        li.className = "busca-item";
        const selo = document.createElement("span");
        selo.className = "busca-item-tipo";
        selo.textContent = item.tipo;
        const nome = document.createElement("span");
        nome.textContent = item.texto;
        li.appendChild(selo);
        li.appendChild(nome);
        li.addEventListener("mousedown", (evento) => evento.preventDefault());
        li.addEventListener("click", () => {
          irParaView(item.view);
          fecharBusca();
          if (inputBuscaGlobal) {
            inputBuscaGlobal.value = "";
          }
          setTimeout(() => destacarItem(item.el), 40);
        });
        dropdownBusca.appendChild(li);
      });
    });
    dropdownBusca.hidden = false;
  }
 
  if (inputBuscaGlobal) {
    inputBuscaGlobal.addEventListener("input", () => renderizarBusca(inputBuscaGlobal.value.trim()));
    inputBuscaGlobal.addEventListener("focus", () => {
      if (inputBuscaGlobal.value.trim()) {
        renderizarBusca(inputBuscaGlobal.value.trim());
      }
    });
    inputBuscaGlobal.addEventListener("blur", () => setTimeout(fecharBusca, 120));
  }
 
  const btnCaptura = document.getElementById("btn-captura-rapida");
  if (btnCaptura) {
    btnCaptura.addEventListener("click", () => {
      modalNotas.classList.add("aberto");
    });
  }
 
  function pintarApp(cores) {
    const raiz = document.documentElement;
    raiz.style.setProperty("--bg-principal", cores.fundo);
    raiz.style.setProperty("--bg-painel", cores.painel);
    raiz.style.setProperty("--borda-sutil", cores.borda);
    raiz.style.setProperty("--accent-ciano", cores.destaque);
    raiz.style.setProperty("--texto-principal", cores.texto);
    raiz.style.setProperty("--texto-secundario", cores.texto2);
    raiz.style.setProperty("--bg-input", cores.painel);
  }
 
  function aplicarPrefsNaTela() {
    pintarApp(prefs.cores);
    document.documentElement.style.setProperty("--fonte-escala", String(prefs.fonte / 100));
    document.documentElement.style.setProperty("--fonte-mapa", String((prefs.fonteMapa || 100) / 100));
    document.body.classList.toggle("sem-tesoura", !prefs.tesoura);
    atualizarAutorSidebar();
 
    const mapa = {
      fundo: "cfg-cor-fundo",
      painel: "cfg-cor-painel",
      borda: "cfg-cor-borda",
      destaque: "cfg-cor-destaque",
      texto: "cfg-cor-texto",
      texto2: "cfg-cor-texto2"
    };
    Object.keys(mapa).forEach((chave) => {
      const el = document.getElementById(mapa[chave]);
      if (el) {
        el.value = prefs.cores[chave];
      }
    });
 
    document.querySelectorAll(".tema-btn").forEach((btn) => {
      btn.classList.toggle("ativo", btn.dataset.tema === prefs.tema);
    });
 
    const rangeFonte = document.getElementById("cfg-fonte");
    const labelFonte = document.getElementById("cfg-fonte-valor");
    if (rangeFonte) {
      rangeFonte.value = String(prefs.fonte);
    }
    if (labelFonte) {
      labelFonte.textContent = prefs.fonte + "%";
    }
 
    const rangeMapa = document.getElementById("cfg-fonte-mapa");
    const labelMapa = document.getElementById("cfg-fonte-mapa-valor");
    if (rangeMapa) {
      rangeMapa.value = String(prefs.fonteMapa || 100);
    }
    if (labelMapa) {
      labelMapa.textContent = (prefs.fonteMapa || 100) + "%";
    }
 
    const autoEl = document.getElementById("cfg-auto-encaixar");
    const tesouraCfg = document.getElementById("cfg-tesoura");
    if (autoEl) {
      autoEl.checked = prefs.autoEncaixar;
    }
    if (tesouraCfg) {
      tesouraCfg.checked = prefs.tesoura;
    }
 
    const nomeEl = document.getElementById("cfg-contato-nome");
    const emailEl = document.getElementById("cfg-contato-email");
    const recadoEl = document.getElementById("cfg-contato-recado");
    if (nomeEl) {
      nomeEl.value = prefs.contato.nome || "";
    }
    if (emailEl) {
      emailEl.value = prefs.contato.email || "";
    }
    if (recadoEl) {
      recadoEl.value = prefs.contato.recado || "";
    }
  }
 
  function statusConfig(texto) {
    const el = document.getElementById("cfg-status");
    if (el) {
      el.textContent = texto;
    }
  }
 
  document.querySelectorAll(".tema-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nome = btn.dataset.tema;
      const tema = TEMAS[nome];
      if (!tema) {
        return;
      }
      prefs.tema = nome;
      prefs.cores = Object.assign({}, tema);
      aplicarPrefsNaTela();
      agendarSalvar();
    });
  });
 
  ["fundo", "painel", "borda", "destaque", "texto", "texto2"].forEach((chave) => {
    const mapa = {
      fundo: "cfg-cor-fundo",
      painel: "cfg-cor-painel",
      borda: "cfg-cor-borda",
      destaque: "cfg-cor-destaque",
      texto: "cfg-cor-texto",
      texto2: "cfg-cor-texto2"
    };
    const el = document.getElementById(mapa[chave]);
    if (!el) {
      return;
    }
    el.addEventListener("input", () => {
      prefs.cores[chave] = el.value;
      prefs.tema = "custom";
      document.querySelectorAll(".tema-btn").forEach((btn) => btn.classList.remove("ativo"));
      pintarApp(prefs.cores);
      agendarSalvar();
    });
  });
 
  const rangeFonte = document.getElementById("cfg-fonte");
  if (rangeFonte) {
    rangeFonte.addEventListener("input", () => {
      prefs.fonte = Number(rangeFonte.value) || 100;
      document.getElementById("cfg-fonte-valor").textContent = prefs.fonte + "%";
      document.documentElement.style.setProperty("--fonte-escala", String(prefs.fonte / 100));
      agendarSalvar();
    });
  }
 
  const rangeMapa = document.getElementById("cfg-fonte-mapa");
  if (rangeMapa) {
    rangeMapa.addEventListener("input", () => {
      prefs.fonteMapa = Number(rangeMapa.value) || 100;
      document.getElementById("cfg-fonte-mapa-valor").textContent = prefs.fonteMapa + "%";
      document.documentElement.style.setProperty("--fonte-mapa", String(prefs.fonteMapa / 100));
      agendarSalvar();
    });
  }
 
  function atualizarAutorSidebar() {
    const box = document.getElementById("sidebar-autor");
    const dica = document.getElementById("sidebar-autor-dica");
    const nome = (prefs.contato && prefs.contato.nome) || "";
    const email = (prefs.contato && prefs.contato.email) || "";
    const recado = (prefs.contato && prefs.contato.recado) || "";
    if (!box) {
      return;
    }
    const temAlgo = Boolean(nome || email || recado);
    if (dica) {
      dica.hidden = temAlgo;
    }
    const nomeEl = document.getElementById("sidebar-autor-nome");
    const emailEl = document.getElementById("sidebar-autor-email");
    const recadoEl = document.getElementById("sidebar-autor-recado");
    if (nomeEl) {
      nomeEl.textContent = nome;
      nomeEl.hidden = !nome;
    }
    if (emailEl) {
      emailEl.textContent = email;
      emailEl.hidden = !email;
    }
    if (recadoEl) {
      recadoEl.textContent = recado;
      recadoEl.hidden = !recado;
    }
  }
 
  const boxAutor = document.getElementById("sidebar-autor");
  if (boxAutor) {
    boxAutor.addEventListener("click", () => irParaView("view-config"));
  }
 
  const autoEl = document.getElementById("cfg-auto-encaixar");
  if (autoEl) {
    autoEl.addEventListener("change", () => {
      prefs.autoEncaixar = autoEl.checked;
      agendarSalvar();
    });
  }
 
  const tesouraCfg = document.getElementById("cfg-tesoura");
  if (tesouraCfg) {
    tesouraCfg.addEventListener("change", () => {
      prefs.tesoura = tesouraCfg.checked;
      document.body.classList.toggle("sem-tesoura", !prefs.tesoura);
      if (!prefs.tesoura) {
        esconderTesoura();
      }
      agendarSalvar();
    });
  }
 
  ["cfg-contato-nome", "cfg-contato-email", "cfg-contato-recado"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.addEventListener("input", () => {
      prefs.contato = {
        nome: document.getElementById("cfg-contato-nome").value,
        email: document.getElementById("cfg-contato-email").value,
        recado: document.getElementById("cfg-contato-recado").value
      };
      atualizarAutorSidebar();
      atualizarResumoDash();
      agendarSalvar();
    });
  });
 
  const btnExportar = document.getElementById("cfg-exportar");
  if (btnExportar) {
    btnExportar.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(coletarEstado(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brainstorm-backup.json";
      a.click();
      URL.revokeObjectURL(url);
      statusConfig("Backup baixado.");
    });
  }
 
  const inputArquivo = document.getElementById("cfg-arquivo");
  const btnImportar = document.getElementById("cfg-importar");
  if (btnImportar && inputArquivo) {
    btnImportar.addEventListener("click", () => inputArquivo.click());
    inputArquivo.addEventListener("change", () => {
      const arquivo = inputArquivo.files && inputArquivo.files[0];
      inputArquivo.value = "";
      if (!arquivo) {
        return;
      }
      const leitor = new FileReader();
      leitor.onload = () => {
        let parsed;
        try {
          parsed = JSON.parse(leitor.result);
        } catch (erro) {
          statusConfig("Arquivo invalido.");
          return;
        }
        if (!estadoEhBackup(parsed)) {
          statusConfig("Isso e um mapa, nao um backup. Use Exportar JSON em Configuracoes.");
          return;
        }
        pedirConfirmacao("dados atuais", () => {
          aplicarEstado(parsed);
          persistenciaLigada = true;
          salvarAgora();
          statusConfig("Backup importado.");
        }, {
          semToast: true,
          titulo: "Importar backup",
          ok: "Importar",
          mensagem: "Importar substitui ideias, ficha, mapa e dashboard deste navegador."
        });
      };
      leitor.readAsText(arquivo);
    });
  }
 
  const btnResetar = document.getElementById("cfg-resetar");
  if (btnResetar) {
    btnResetar.addEventListener("click", () => {
      pedirConfirmacao("todos os dados", () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (erro) {
          statusConfig("Nao deu para apagar os dados salvos.");
          return;
        }
        window.location.reload();
      }, {
        semToast: true,
        titulo: "Resetar dados",
        ok: "Resetar",
        mensagem: "Apagar ideias, tarefas e roadmap deste navegador? Nao tem como desfazer."
      });
    });
  }
 
  aplicarPrefsNaTela();
  carregarEstado();
  atualizarNomeHub();
  atualizarListaCustom();
  atualizarListasVazias();
  atualizarBotaoDesfazer();
  atualizarResumoDash();
  setInterval(atualizarResumoDash, 30000);
});