import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import { useFileSystem } from "contexts/fileSystem";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const GitBash: React.FC<ComponentProcessProps> = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const fs = useFileSystem();
  const [cwd, setCwd] = useState<string>("/Users/Public");
  const [input, setInput] = useState<string>("");
  // Estado simulado de git repos por cwd
  const gitRepos = useRef<{
    [dir: string]: { initialized: boolean; staged: Set<string> };
  }>({});

  // Parser y ejecución de comandos
  const runCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;
    const args = command.trim().split(/\s+/);
    const cmd = args[0];
    const params = args.slice(1);
    // ANSI colors
    const ANSI_RESET = "\x1b[0m";
    const ANSI_GREEN = "\x1b[32m";
    const ANSI_BLUE = "\x1b[34m";
    const ANSI_GRAY = "\x1b[37m";
    try {
      switch (cmd) {
        case "ll": {
          const files = await fs.readdir(cwd);
          for (const file of files) {
            const filePath = `${cwd}/${file}`.replace(/\/+/g, "/");
            let color = ANSI_GRAY;
            let perms = "-rw-r--r--";
            try {
              const stat = await fs.lstat(filePath);
              if (stat.isDirectory()) {
                color = ANSI_BLUE;
                perms = "drwxr-xr-x";
              }
            } catch { }
            term.writeln(
              `${perms} 1 user user 0 Jan 1 00:00 ${color}${file}${ANSI_RESET}`
            );
          }
          break;
        }
        case "rm": {
          if (params[0]) {
            const filePath = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            if (await fs.exists(filePath)) {
              await fs.unlink(filePath);
            } else {
              term.writeln(
                `rm: no se puede borrar '${params[0]}': No such file or directory`
              );
            }
          } else {
            term.writeln("rm: falta el operando del archivo");
          }
          break;
        }
        case "cp": {
          if (params[0] && params[1]) {
            const src = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            const dest = `${cwd}/${params[1]}`.replace(/\/+/g, "/");
            if (await fs.exists(src)) {
              const content = await fs.readFile(src);
              await fs.writeFile(dest, content);
            } else {
              term.writeln(
                `cp: no se puede copiar '${params[0]}': No such file`
              );
            }
          } else {
            term.writeln("cp: falta archivo origen o destino");
          }
          break;
        }
        case "mv": {
          if (params[0] && params[1]) {
            const src = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            const dest = `${cwd}/${params[1]}`.replace(/\/+/g, "/");
            if (await fs.exists(src)) {
              const content = await fs.readFile(src);
              await fs.writeFile(dest, content);
              await fs.unlink(src);
            } else {
              term.writeln(
                `mv: no se puede mover '${params[0]}': No such file`
              );
            }
          } else {
            term.writeln("mv: falta archivo origen o destino");
          }
          break;
        }
        case "history": {
          if (window.localStorage) {
            const hist = window.localStorage.getItem("gitbash_history");
            if (hist) {
              hist
                .split("\n")
                .forEach((h, i) => term.writeln(`${i + 1}  ${h}`));
            } else {
              term.writeln("Sin historial");
            }
          } else {
            term.writeln("No soportado en este entorno");
          }
          break;
        }
        case "ls": {
          const files = await fs.readdir(cwd);
          let output = "";
          for (const file of files) {
            const filePath = `${cwd}/${file}`.replace(/\/+/g, "/");
            let color = ANSI_GRAY;
            try {
              const stat = await fs.lstat(filePath);
              if (stat.isDirectory()) color = ANSI_BLUE;
            } catch { }
            output += `${color}${file}${ANSI_RESET}  `;
          }
          term.writeln(output.trim());
          break;
        }
        case "pwd": {
          term.writeln(cwd);
          break;
        }
        case "cd": {
          if (params[0]) {
            let newPath = params[0].startsWith("/")
              ? params[0]
              : `${cwd}/${params[0]}`;
            newPath = newPath.replace(/\/+/g, "/").replace(/\/.\$/, "");
            if (await fs.exists(newPath)) {
              setCwd(newPath);
            } else {
              term.writeln(`cd: ${params[0]}: No such directory`);
            }
          }
          break;
        }
        case "mkdir": {
          if (params[0]) {
            const dirPath = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            await fs.mkdir(dirPath);
          }
          break;
        }
        case "touch": {
          if (params[0]) {
            const filePath = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            await fs.writeFile(filePath, "");
          }
          break;
        }
        case "cat": {
          if (params[0]) {
            const filePath = `${cwd}/${params[0]}`.replace(/\/+/g, "/");
            if (await fs.exists(filePath)) {
              const contentBuffer = await fs.readFile(filePath);
              const content = contentBuffer.toString();
              term.writeln(content);
            } else {
              term.writeln(`cat: ${params[0]}: No such file`);
            }
          }
          break;
        }
        case "echo": {
          const text = params.join(" ");
          term.writeln(text);
          break;
        }
        case "git": {
          if (params[0] === "--version") {
            term.writeln("git version 2.42.0");
          } else if (params[0] === "init") {
            if (!gitRepos.current[cwd]) {
              gitRepos.current[cwd] = { initialized: true, staged: new Set() };
              term.writeln(`Initialized empty Git repository in ${cwd}/.git/`);
            } else if (!gitRepos.current[cwd].initialized) {
              gitRepos.current[cwd].initialized = true;
              term.writeln(`Initialized empty Git repository in ${cwd}/.git/`);
            } else {
              term.writeln("Reinitialized existing Git repository.");
            }
          } else if (params[0] === "add") {
            if (!gitRepos.current[cwd] || !gitRepos.current[cwd].initialized) {
              term.writeln(
                "fatal: not a git repository (or any of the parent directories): .git"
              );
            } else if (params[1] === ".") {
              const files = await fs.readdir(cwd);
              files.forEach((f) => gitRepos.current[cwd].staged.add(f));
              term.writeln("Todos los archivos agregados al área de staging.");
            } else if (params[1]) {
              const filePath = params[1];
              const files = await fs.readdir(cwd);
              if (files.includes(filePath)) {
                gitRepos.current[cwd].staged.add(filePath);
                term.writeln(`${filePath} agregado al área de staging.`);
              } else {
                term.writeln(
                  `fatal: pathspec '${filePath}' did not match any files`
                );
              }
            } else {
              term.writeln("git add: falta el archivo a agregar");
            }
          } else {
            term.writeln(
              "Comando git soportado: --version, init, add <archivo> o add ."
            );
          }
          break;
        }
        case "help": {
          term.writeln("Comandos básicos disponibles:\n");
          term.writeln("  ls         Lista archivos y carpetas");
          term.writeln("  ll         Lista detallada (alias ls -l)");
          term.writeln("  pwd        Muestra el directorio actual");
          term.writeln("  cd DIR     Cambia de directorio");
          term.writeln("  mkdir DIR  Crea un directorio");
          term.writeln("  touch FILE Crea un archivo vacío");
          term.writeln("  cat FILE   Muestra el contenido de un archivo");
          term.writeln("  echo TEXT  Imprime texto");
          term.writeln("  rm FILE    Elimina un archivo");
          term.writeln("  cp SRC DST Copia archivo");
          term.writeln("  mv SRC DST Mueve/renombra archivo");
          term.writeln("  history    Muestra historial de comandos");
          term.writeln("  clear      Limpia la pantalla");
          term.writeln("  git --version  Muestra la versión de git simulada");
          term.writeln("  help       Muestra esta ayuda\n");
          term.writeln("Ejemplo de uso:");
          term.writeln(
            "  cd carpeta\n  ls\n  cat archivo.txt\n  rm archivo.txt\n"
          );
          term.writeln(
            "Colores y prompt inspirados en Bash real.\nPara más comandos, ¡sigue explorando!"
          );
          break;
        }
        case "clear": {
          term.clear();
          break;
        }
        case "":
          break;
        default:
          term.writeln(`${cmd}: comando no encontrado`);
      }
    } catch (e: any) {
      term.writeln(`Error: ${e.message}`);
    }
  };
  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        theme: {
          background: "#1d1f21",
          foreground: "#c5c8c6",
        },
        fontFamily: "monospace",
        fontSize: 14,
        cursorBlink: true,
        windowsMode: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddonRef.current = fitAddon;
      term.writeln("\x1b[1;32mWelcome to Git Bash\x1b[0m");
      (term as Terminal & { prompt: () => void }).prompt = () => {
        const ANSI_GREEN = "\x1b[32m";
        const ANSI_RESET = "\x1b[0m";
        term.write(
          `\r\n${ANSI_GREEN}user@winsim${ANSI_RESET}:${cwd.replace("/Users/Public", "~")}$ `
        );
      };
      (term as Terminal & { prompt: () => void }).prompt();
      let buffer = "";
      term.onKey(
        async ({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
          if (domEvent.key === "Enter") {
            term.write("\r\n");
            await runCommand(buffer);
            buffer = "";
            (term as Terminal & { prompt: () => void }).prompt();
          } else if (domEvent.key === "Backspace") {
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1);
              term.write("\b \b");
            }
          } else if (domEvent.key.length === 1) {
            buffer += key;
            term.write(key);
          }
        }
      );
      xtermRef.current = term;
    }
    // Fit on resize
    const handleResize = () => {
      if (
        fitAddonRef.current &&
        terminalRef.current &&
        terminalRef.current.offsetWidth > 0 &&
        terminalRef.current.offsetHeight > 0
      ) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // Silenciar errores de fit
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      xtermRef.current?.dispose();
      xtermRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, [cwd]);

  // Ajustar fit después del render inicial y cuando cambie el tamaño del contenedor
  useLayoutEffect(() => {
    const fit = () => {
      if (
        fitAddonRef.current &&
        terminalRef.current &&
        terminalRef.current.offsetWidth > 0 &&
        terminalRef.current.offsetHeight > 0
      ) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // Silenciar errores de fit
        }
      }
    };
    const timeout = setTimeout(fit, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "100%", background: "#1d1f21" }}
    />
  );
};

export default GitBash;
