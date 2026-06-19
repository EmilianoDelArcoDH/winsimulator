import { type GitbashTutorialTranslation } from "components/onboarding/gitbashTranslations/types";

const gitbashTutorialPt: GitbashTutorialTranslation = {
  controls: {
    back: "Voltar",
    finish: "Finalizar",
    next: "Seguinte",
    pause: "Pausar",
    skip: "Pular",
  },
  panel: {
    completed:
      "Tutorial concluido. Voce executou ls a partir da area de trabalho no GitBash.",
    description:
      "Aprenda a abrir o GitBash a partir da area de trabalho e listar as pastas disponiveis.",
    inProgress:
      "Tutorial em andamento. Cada etapa avanca quando voce conclui a acao indicada.",
    start: "Iniciar tutorial de GitBash",
  },
  steps: {
    finish: {
      description:
        "Voce usou o GitBash a partir de Desktop e executou ls para ver o conteudo da area de trabalho.",
      title: "Tutorial concluido",
    },
    "open-gitbash": {
      description:
        "Clique no botão Inicio na barra de tarefas para abrir o menu de aplicativos. Na próxima etapa você vai escolher o GitBash.",
      optionalHint: "Clique em Inicio",
      title: "Abra o Inicio",
    },
    "run-ls": {
      description:
        "No console, digite ls e pressione Enter para mostrar as pastas e arquivos que estao na area de trabalho.",
      optionalHint: "Digite ls e pressione Enter",
      title: "Liste a area de trabalho",
    },
    "select-gitbash": {
      description:
        "Agora selecione GitBash no menu Inicio. O console abrirá em Desktop para que você possa executar seu primeiro comando.",
      optionalHint: "Selecione GitBash",
      title: "Escolha GitBash",
    },
    welcome: {
      description:
        "Neste percurso, voce vai praticar seu primeiro comando no GitBash. Voce comecara em Desktop e usara ls para ver o que existe nessa pasta.",
      title: "Tutorial de GitBash",
    },
  },
};

export default gitbashTutorialPt;
