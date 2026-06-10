import { type VscodeTutorialTranslation } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialPt: VscodeTutorialTranslation = {
  controls: {
    back: "Voltar",
    finish: "Finalizar",
    next: "Próximo",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Pular",
  },
  panel: {
    completed:
      "Tutorial concluído. Você criou um projeto web e abriu o terminal do Visual Studio Code.",
    description:
      "Aprenda a criar uma pasta, um arquivo index.html e abrir o terminal integrado.",
    inProgress:
      "Tutorial em andamento. Cada etapa avança quando você conclui a ação indicada.",
    reset: "Reiniciar",
    resume: "Continuar a partir da etapa {step}",
    start: "Iniciar tutorial do VS Code",
  },
  steps: {
    "create-file": {
      description:
        "Com a pasta mi-sitio selecionada, abra File > New File e digite index.html. Esta etapa avançará quando o arquivo existir dentro da pasta.",
      optionalHint: "Crie mi-sitio/index.html",
      title: "Crie index.html",
    },
    "create-folder": {
      description:
        "Abra File > New Folder, digite mi-sitio e confirme com Enter. Aguardaremos até que a pasta exista.",
      optionalHint: "Crie a pasta mi-sitio",
      title: "Crie uma pasta",
    },
    finish: {
      description:
        "Você criou a pasta mi-sitio, seu index.html e abriu o terminal integrado. Agora pode começar a editar seu site.",
      title: "Tutorial concluído",
    },
    "open-file": {
      description:
        "index.html deve estar aberto no editor. Se não estiver, selecione-o no Explorador.",
      optionalHint: "Abra index.html",
      title: "Abra o arquivo",
    },
    "open-terminal": {
      description:
        "Abra o menu Terminal e selecione a opção que mostra o terminal integrado.",
      optionalHint: "Abra o terminal integrado",
      title: "Abra o terminal",
    },
    "open-vscode": {
      description:
        "Abra o Iniciar 🏠 e selecione Visual Studio Code. Aguardaremos até que o editor esteja pronto.",
      optionalHint: "Clique em Iniciar 🏠 e depois em Visual Studio Code",
      title: "Abra o Visual Studio Code",
    },
    welcome: {
      description:
        "Neste tour, você usará o Visual Studio Code real para criar a pasta mi-sitio, adicionar index.html e abrir o terminal.",
      title: "Tutorial do Visual Studio Code",
    },
  },
};

export default vscodeTutorialPt;
