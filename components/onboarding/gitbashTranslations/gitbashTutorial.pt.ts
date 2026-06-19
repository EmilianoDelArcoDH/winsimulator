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
        "Abra o Inicio e selecione GitBash. O console deve iniciar na pasta da area de trabalho.",
      optionalHint: "Clique em Inicio e depois em GitBash",
      title: "Abra o GitBash",
    },
    "run-ls": {
      description:
        "No console, digite ls e pressione Enter para mostrar as pastas e arquivos que estao na area de trabalho.",
      optionalHint: "Digite ls e pressione Enter",
      title: "Liste a area de trabalho",
    },
    welcome: {
      description:
        "Neste percurso, voce vai praticar seu primeiro comando no GitBash. Voce comecara em Desktop e usara ls para ver o que existe nessa pasta.",
      title: "Tutorial de GitBash",
    },
  },
};

export default gitbashTutorialPt;
