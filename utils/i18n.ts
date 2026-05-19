/* eslint-disable sort-keys-fix/sort-keys-fix */
import { type SessionLanguage } from "contexts/session/types";
import { DEFAULT_LANGUAGE } from "utils/constants";

type I18nKey =
  | "taskbar.search.bestMatch"
  | "taskbar.search.close"
  | "taskbar.search.fileType.app"
  | "taskbar.search.fileType.folder"
  | "taskbar.search.fileType.nostrUri"
  | "taskbar.search.fileType.youtubeVideo"
  | "taskbar.search.findMostRelevantResults"
  | "taskbar.search.findResultsIn"
  | "taskbar.search.gamesForYou"
  | "taskbar.search.lastModified"
  | "taskbar.search.location"
  | "taskbar.search.noResultsFoundFor"
  | "taskbar.search.open"
  | "taskbar.search.openFileLocation"
  | "taskbar.search.openFolderLocation"
  | "taskbar.search.placeholder"
  | "taskbar.search.recent"
  | "taskbar.search.searchIn"
  | "taskbar.search.startTypingToSearch"
  | "taskbar.search.suggested"
  | "taskbar.search.tab.all"
  | "taskbar.search.tab.documents"
  | "taskbar.search.tab.photos"
  | "taskbar.search.tab.videos"
  | "taskbar.start"
  | "taskbar.search"
  | "taskbar.clock"
  | "taskbar.calendar"
  | "taskbar.language"
  | "taskbar.clock.localTime"
  | "taskbar.clock.serverTime";

type TranslationDictionary = Record<I18nKey, string>;

const I18N_DICTIONARY: Record<SessionLanguage, TranslationDictionary> = {
  en: {
    "taskbar.calendar": "Calendar",
    "taskbar.clock": "Clock",
    "taskbar.clock.localTime": "Local time",
    "taskbar.clock.serverTime": "Server time",
    "taskbar.language": "Language",
    "taskbar.search.bestMatch": "Best match",
    "taskbar.search.close": "Close Search",
    "taskbar.search.fileType.app": "App",
    "taskbar.search.fileType.folder": "File folder",
    "taskbar.search.fileType.nostrUri": "Nostr URI",
    "taskbar.search.fileType.youtubeVideo": "YouTube Video",
    "taskbar.search.findMostRelevantResults": "Find the most relevant results",
    "taskbar.search.findResultsIn": "Find results in {{section}}",
    "taskbar.search.gamesForYou": "Games for you",
    "taskbar.search.lastModified": "Last modified",
    "taskbar.search.location": "Location",
    "taskbar.search.noResultsFoundFor": "No results found for '{{term}}'",
    "taskbar.search.open": "Open",
    "taskbar.search": "Type here to search",
    "taskbar.search.openFileLocation": "Open file location",
    "taskbar.search.openFolderLocation": "Open folder location",
    "taskbar.search.placeholder": "Type here to search",
    "taskbar.search.recent": "Recent",
    "taskbar.search.searchIn": "Search {{section}}",
    "taskbar.search.startTypingToSearch": "Start typing to search {{section}}",
    "taskbar.search.suggested": "Suggested",
    "taskbar.search.tab.all": "All",
    "taskbar.search.tab.documents": "Documents",
    "taskbar.search.tab.photos": "Photos",
    "taskbar.search.tab.videos": "Videos",
    "taskbar.start": "Start",
  },
  es: {
    "taskbar.calendar": "Calendario",
    "taskbar.clock": "Reloj",
    "taskbar.clock.localTime": "Hora local",
    "taskbar.clock.serverTime": "Hora del servidor",
    "taskbar.language": "Idioma",
    "taskbar.search.bestMatch": "Mejor coincidencia",
    "taskbar.search.close": "Cerrar búsqueda",
    "taskbar.search.fileType.app": "Aplicación",
    "taskbar.search.fileType.folder": "Carpeta",
    "taskbar.search.fileType.nostrUri": "URI de Nostr",
    "taskbar.search.fileType.youtubeVideo": "Video de YouTube",
    "taskbar.search.findMostRelevantResults": "Encontrar los resultados más relevantes",
    "taskbar.search.findResultsIn": "Buscar resultados en {{section}}",
    "taskbar.search.gamesForYou": "Juegos para ti",
    "taskbar.search.lastModified": "Última modificación",
    "taskbar.search.location": "Ubicación",
    "taskbar.search.noResultsFoundFor": "No se encontraron resultados para '{{term}}'",
    "taskbar.search.open": "Abrir",
    "taskbar.search": "Escribe aquí para buscar",
    "taskbar.search.openFileLocation": "Abrir ubicación del archivo",
    "taskbar.search.openFolderLocation": "Abrir ubicación de la carpeta",
    "taskbar.search.placeholder": "Escribe aquí para buscar",
    "taskbar.search.recent": "Recientes",
    "taskbar.search.searchIn": "Buscar en {{section}}",
    "taskbar.search.startTypingToSearch": "Empieza a escribir para buscar {{section}}",
    "taskbar.search.suggested": "Sugeridos",
    "taskbar.search.tab.all": "Todo",
    "taskbar.search.tab.documents": "Documentos",
    "taskbar.search.tab.photos": "Fotos",
    "taskbar.search.tab.videos": "Videos",
    "taskbar.start": "Inicio",
  },
  pt: {
    "taskbar.calendar": "Calendário",
    "taskbar.clock": "Relógio",
    "taskbar.clock.localTime": "Hora local",
    "taskbar.clock.serverTime": "Hora do servidor",
    "taskbar.language": "Idioma",
    "taskbar.search.bestMatch": "Melhor correspondência",
    "taskbar.search.close": "Fechar pesquisa",
    "taskbar.search.fileType.app": "Aplicativo",
    "taskbar.search.fileType.folder": "Pasta",
    "taskbar.search.fileType.nostrUri": "URI do Nostr",
    "taskbar.search.fileType.youtubeVideo": "Vídeo do YouTube",
    "taskbar.search.findMostRelevantResults": "Encontrar os resultados mais relevantes",
    "taskbar.search.findResultsIn": "Encontrar resultados em {{section}}",
    "taskbar.search.gamesForYou": "Jogos para você",
    "taskbar.search.lastModified": "Última modificação",
    "taskbar.search.location": "Localização",
    "taskbar.search.noResultsFoundFor": "Nenhum resultado encontrado para '{{term}}'",
    "taskbar.search.open": "Abrir",
    "taskbar.search": "Digite aqui para pesquisar",
    "taskbar.search.openFileLocation": "Abrir localização do arquivo",
    "taskbar.search.openFolderLocation": "Abrir localização da pasta",
    "taskbar.search.placeholder": "Digite aqui para pesquisar",
    "taskbar.search.recent": "Recentes",
    "taskbar.search.searchIn": "Pesquisar em {{section}}",
    "taskbar.search.startTypingToSearch": "Comece a digitar para pesquisar {{section}}",
    "taskbar.search.suggested": "Sugeridos",
    "taskbar.search.tab.all": "Tudo",
    "taskbar.search.tab.documents": "Documentos",
    "taskbar.search.tab.photos": "Fotos",
    "taskbar.search.tab.videos": "Vídeos",
    "taskbar.start": "Iniciar",
  },
};

const UI_TEXT_TO_KEY: Partial<Record<string, I18nKey>> = {
  "Close Search": "taskbar.search.close",
  "Open file location": "taskbar.search.openFileLocation",
  "Type here to search": "taskbar.search.placeholder",
};

const UI_TEXT_TRANSLATIONS: Record<
  SessionLanguage,
  Partial<Record<string, string>>
> = {
  en: {},
  es: {
    "Add file(s)": "Agregar archivo(s)",
    "Add to archive...": "Agregar al archivo...",
    Ascending: "Ascendente",
    Background: "Fondo",
    Bottom: "Abajo",
    Center: "Centrar",
    Close: "Cerrar",
    Copy: "Copiar",
    "Copy address": "Copiar dirección",
    "Create shortcut": "Crear acceso directo",
    Cut: "Cortar",
    "Date modified": "Fecha de modificación",
    Delete: "Eliminar",
    Descending: "Descendente",
    Disconnect: "Desconectar",
    Download: "Descargar",
    Edit: "Editar",
    "Extract Here": "Extraer aquí",
    Fill: "Rellenar",
    "File Explorer": "Explorador de archivos",
    Fit: "Ajustar",
    Folder: "Carpeta",
    Inspect: "Inspeccionar",
    "Item type": "Tipo de elemento",
    "Map directory": "Mapear directorio",
    "Map OPFS": "Mapear OPFS",
    Maximize: "Maximizar",
    Minimize: "Minimizar",
    "Music Visualization": "Visualización de música",
    Name: "Nombre",
    New: "Nuevo",
    "Open in new window": "Abrir en nueva ventana",
    "Open Terminal here": "Abrir terminal aquí",
    "Open with": "Abrir con",
    "Page Down": "Página abajo",
    "Page Up": "Página arriba",
    Paste: "Pegar",
    Properties: "Propiedades",
    Refresh: "Actualizar",
    Rename: "Renombrar",
    Restore: "Restaurar",
    "Rich Text Document": "Documento de texto enriquecido",
    Run: "Ejecutar",
    "Save to desktop": "Guardar en escritorio",
    "Scroll Down": "Desplazar abajo",
    "Scroll Here": "Desplazar aquí",
    "Scroll Up": "Desplazar arriba",
    "Set as background": "Establecer como fondo",
    "Set as mouse pointer": "Establecer como puntero del mouse",
    Share: "Compartir",
    Size: "Tamaño",
    "Sort by": "Ordenar por",
    Stretch: "Estirar",
    "Summarize Text (AI)": "Resumir texto (IA)",
    Terminal: "Terminal",
    "Text Document": "Documento de texto",
    Tile: "Mosaico",
    "Toggle Minimap": "Activar/desactivar minimapa",
    "Toggle Word Wrap": "Activar/desactivar ajuste de línea",
    Top: "Arriba",
    "Choose another app": "Elegir otra aplicación",
    "Convert to": "Convertir a",
    "Convert to M3U": "Convertir a M3U",
    "View page source": "Ver código fuente de la página",
  },
  pt: {
    "Add file(s)": "Adicionar arquivo(s)",
    "Add to archive...": "Adicionar ao arquivo...",
    Ascending: "Ascendente",
    Background: "Plano de fundo",
    Bottom: "Fundo",
    Center: "Centralizar",
    Close: "Fechar",
    Copy: "Copiar",
    "Copy address": "Copiar endereço",
    "Create shortcut": "Criar atalho",
    Cut: "Recortar",
    "Date modified": "Data de modificação",
    Delete: "Excluir",
    Descending: "Descendente",
    Disconnect: "Desconectar",
    Download: "Baixar",
    Edit: "Editar",
    "Extract Here": "Extrair aqui",
    Fill: "Preencher",
    "File Explorer": "Explorador de arquivos",
    Fit: "Ajustar",
    Folder: "Pasta",
    Inspect: "Inspecionar",
    "Item type": "Tipo de item",
    "Map directory": "Mapear diretório",
    "Map OPFS": "Mapear OPFS",
    Maximize: "Maximizar",
    Minimize: "Minimizar",
    "Music Visualization": "Visualização de música",
    Name: "Nome",
    New: "Novo",
    "Open in new window": "Abrir em nova janela",
    "Open Terminal here": "Abrir terminal aqui",
    "Open with": "Abrir com",
    "Page Down": "Página abaixo",
    "Page Up": "Página acima",
    Paste: "Colar",
    Properties: "Propriedades",
    Refresh: "Atualizar",
    Rename: "Renomear",
    Restore: "Restaurar",
    "Rich Text Document": "Documento de texto rico",
    Run: "Executar",
    "Save to desktop": "Salvar na área de trabalho",
    "Scroll Down": "Rolar para baixo",
    "Scroll Here": "Rolar aqui",
    "Scroll Up": "Rolar para cima",
    "Set as background": "Definir como plano de fundo",
    "Set as mouse pointer": "Definir como ponteiro do mouse",
    Share: "Compartilhar",
    Size: "Tamanho",
    "Sort by": "Ordenar por",
    Stretch: "Esticar",
    "Summarize Text (AI)": "Resumir texto (IA)",
    Terminal: "Terminal",
    "Text Document": "Documento de texto",
    Tile: "Mosaico",
    "Toggle Minimap": "Alternar minimapa",
    "Toggle Word Wrap": "Alternar quebra de linha",
    Top: "Topo",
    "Choose another app": "Escolher outro aplicativo",
    "Convert to": "Converter para",
    "Convert to M3U": "Converter para M3U",
    "View page source": "Ver código-fonte da página",
  },
};

const NON_TRANSLATABLE_COMMANDS = new Set([
  "bash",
  "cat",
  "cd",
  "cmd",
  "cp",
  "curl",
  "find",
  "git",
  "grep",
  "ls",
  "mkdir",
  "mv",
  "node",
  "npm",
  "pnpm",
  "powershell",
  "pwsh",
  "python",
  "rm",
  "rmdir",
  "sh",
  "touch",
  "wget",
  "yarn",
]);

const isCommandText = (value: string): boolean => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  const [firstToken = ""] = trimmedValue.toLowerCase().split(/\s+/u);

  return (
    NON_TRANSLATABLE_COMMANDS.has(trimmedValue.toLowerCase()) ||
    NON_TRANSLATABLE_COMMANDS.has(firstToken) ||
    /(^|\s)-[\w-]+/u.test(trimmedValue)
  );
};

export const normalizeLanguage = (language?: string): SessionLanguage => {
  const normalizedLanguage = language?.trim().toLowerCase().split("-")[0];

  if (normalizedLanguage === "es" || normalizedLanguage === "pt") {
    return normalizedLanguage;
  }

  return "en";
};

const getDictionary = (language: SessionLanguage): TranslationDictionary => {
  switch (language) {
    case "es":
      return I18N_DICTIONARY.es;
    case "pt":
      return I18N_DICTIONARY.pt;
    default:
      return I18N_DICTIONARY.en;
  }
};

export const t = (language: SessionLanguage, key: I18nKey): string =>
  getDictionary(language)[key];

export const getActiveLanguage = (): SessionLanguage => {
  const documentLanguage =
    typeof document === "object" ? document.documentElement?.lang : "";

  return normalizeLanguage(documentLanguage || DEFAULT_LANGUAGE);
};

export const translateUiText = (
  language: SessionLanguage,
  value: string
): string => {
  if (isCommandText(value)) {
    return value;
  }

  const translationKey = UI_TEXT_TO_KEY[value];

  if (translationKey) {
    return t(language, translationKey);
  }

  const translationsByLanguage =
    language === "es"
      ? UI_TEXT_TRANSLATIONS.es
      : language === "pt"
      ? UI_TEXT_TRANSLATIONS.pt
      : UI_TEXT_TRANSLATIONS.en;

  return translationsByLanguage[value] || value;
};

export const tf = (
  language: SessionLanguage,
  key: I18nKey,
  values: Record<string, string>
): string =>
  Object.entries(values).reduce(
    (text, [token, value]) => text.replaceAll(`{{${token}}}`, value),
    t(language, key)
  );

export const LANGUAGE_OPTIONS: SessionLanguage[] = ["es", "en", "pt"];
/* eslint-enable sort-keys-fix/sort-keys-fix */
