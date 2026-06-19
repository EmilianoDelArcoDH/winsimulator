import { type VscodeTutorialTranslation } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialPt: VscodeTutorialTranslation = {
  controls: {
    back: "Voltar",
    finish: "Finalizar",
    next: "Próximo",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Pular",
    skipStep: "Pular etapa",
  },
  panel: {
    completed:
      "Tutorial concluído. Você criou o projeto mi-sitio com index.html e abriu o terminal do Visual Studio Code.",
    description:
      "Aprenda a usar o Visual Studio Code: crie pastas, arquivos HTML e abra o terminal integrado, passo a passo.",
    inProgress:
      "Tutorial em andamento. Cada etapa avança quando você conclui a ação indicada.",
    reset: "Reiniciar",
    resume: "Continuar a partir da etapa {step}",
    start: "Iniciar tutorial do VS Code",
  },
  steps: {
    "create-file": {
      description:
        "Primeiro, clique na pasta mi-sitio no Explorador para selecioná-la. Em seguida, clique no ícone Novo Arquivo destacado (o primeiro dos dois ícones). Digite index.html e pressione Enter.",
      optionalHint: "Selecione mi-sitio e crie index.html",
      title: "Crie index.html",
    },
    "create-folder": {
      description:
        "No painel Explorador à esquerda, clique no ícone Nova Pasta destacado (o segundo ícone ao lado do título EXPLORADOR). Digite mi-sitio e pressione Enter. A pasta aparecerá na árvore de arquivos.",
      optionalHint: "Crie a pasta mi-sitio",
      title: "Crie uma pasta",
    },
    finish: {
      description:
        "Ótimo trabalho! Você aprendeu a criar pastas e arquivos no VS Code e a abrir o terminal integrado. Seu projeto mi-sitio com index.html está pronto para editar.",
      title: "Tutorial concluído!",
    },
    "open-file": {
      description:
        "O arquivo index.html abriu automaticamente no editor. Você pode ver seu conteúdo HTML na área central. Observe a aba ativa na parte superior do editor. Quando estiver pronto, clique em Próximo.",
      title: "Revise o editor",
    },
    "open-terminal": {
      description:
        "Clique no botão Terminal destacado na barra de menu superior. No submenu que aparece, selecione Toggle Terminal. O terminal integrado abrirá na parte inferior do editor.",
      optionalHint: "Terminal → Toggle Terminal",
      title: "Abra o terminal",
    },
    "open-vscode": {
      description:
        "Clique no botão Iniciar (🏠) na barra de tarefas para abrir o menu de aplicativos. Na próxima etapa você vai escolher o Visual Studio Code.",
      optionalHint: "Clique em Iniciar 🏠",
      title: "Abra o Iniciar",
    },
    "select-vscode": {
      description:
        "Agora selecione Visual Studio Code no menu Iniciar. O tutorial avançará automaticamente quando o editor estiver pronto.",
      optionalHint: "Selecione Visual Studio Code",
      title: "Escolha Visual Studio Code",
    },
    welcome: {
      description:
        "Neste tutorial você vai aprender a abrir o Visual Studio Code, criar uma pasta de projeto chamada mi-sitio, criar seu primeiro arquivo HTML e abrir o terminal integrado.",
      title: "Tutorial do Visual Studio Code",
    },
  },
};

export default vscodeTutorialPt;
