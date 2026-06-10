import { type TutorialTranslation } from "components/onboarding/translations/types";

const navigation = {
  buttonBack: "Voltar",
  buttonFinish: "Finalizar",
  buttonNext: "Próximo",
};

const tutorialPt: TutorialTranslation = {
  controls: {
    close: "Fechar",
    open: "Abrir explicação",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Pular",
  },
  panel: {
    completed: "Tour concluído. Agora você tem uma visão geral da plataforma.",
    description:
      "Explore a área de trabalho, os aplicativos e o fluxo completo de uma atividade Git.",
    inProgress: "Tour em andamento. Você pode pausá-lo pelo painel.",
    reset: "Reiniciar",
    resume: "Continuar a partir da etapa {step}",
    start: "Iniciar Tour Guiado",
  },
  steps: {
    "activities-info": {
      ...navigation,
      description:
        "As atividades combinam objetivos, instruções, ferramentas e validações. Elas são abertas quando você escolhe uma atividade, não durante este tour geral.",
      title: "Como funcionam as atividades",
    },
    desktop: {
      ...navigation,
      description:
        "Esta é a área de trabalho real. Aqui aparecem atalhos, janelas abertas e a barra de tarefas.",
      title: "A área de trabalho",
    },
    "file-explorer": {
      ...navigation,
      description:
        "O Explorador permite navegar por pastas, abrir arquivos e organizar o workspace usado pelos aplicativos.",
      title: "Explorador de Arquivos",
    },
    finish: {
      ...navigation,
      description:
        "Agora você conhece a área de trabalho, o Iniciar, o Terminal, o Visual Studio Code, o Explorador e os controles de janela. Você já pode começar a praticar.",
      title: "Tour concluído",
    },
    "open-files": {
      ...navigation,
      description:
        "Abra o Iniciar e selecione Documents para conhecer o Explorador de Arquivos.",
      optionalHint: "Clique em Iniciar e depois em Documents",
      title: "Abra Documents",
    },
    "open-terminal": {
      ...navigation,
      description:
        "Clique em Iniciar e depois em Terminal. A janela só será aberta quando você selecionar o aplicativo.",
      optionalHint: "Clique em Iniciar e depois em Terminal",
      title: "Abra o Terminal",
    },
    "open-vscode": {
      ...navigation,
      description:
        "Abra o Iniciar e selecione Visual Studio Code para conhecer o editor real.",
      optionalHint: "Clique em Iniciar e depois em Visual Studio Code",
      title: "Abra o Visual Studio Code",
    },
    terminal: {
      ...navigation,
      description:
        "No Terminal, você pode digitar comandos e executá-los com Enter. As atividades Git registram os comandos e o estado resultante.",
      title: "Usar o Terminal",
    },
    vscode: {
      ...navigation,
      description:
        "Aqui você pode editar os arquivos dos projetos, usar o terminal integrado e validar atividades de workspace.",
      title: "Visual Studio Code",
    },
    welcome: {
      ...navigation,
      description:
        "Boas-vindas ao DH Console. Você vai explorar a plataforma usando seus controles e aplicativos reais.",
      title: "Boas-vindas ao DH Console",
    },
    "window-controls": {
      ...navigation,
      description:
        "Todos os aplicativos usam estes controles reais para minimizar, maximizar ou fechar a janela.",
      title: "Controles de janela",
    },
  },
};

export default tutorialPt;
