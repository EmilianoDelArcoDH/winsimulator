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

  // Parser y ejecución de comandos
  const runCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;
    const args = command.trim().split(/\s+/);
    const cmd = args[0];
    const params = args.slice(1);
    try {
      switch (cmd) {
        case "ls": {
          const files = await fs.readdir(cwd);
          term.writeln(files.join("  "));
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
            // Normalizar path
            newPath = newPath.replace(/\/+/g, "/").replace(/\/\.$/, "");
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
          } else {
            term.writeln("Comando git. Solo --version soportado.");
          }
          break;
        }
        case "help": {
          term.writeln(
            "Comandos soportados: ls, pwd, cd, mkdir, touch, cat, echo, git --version, help"
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

  useLayoutEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new Terminal({
        theme: {
          background: "#1d1f21",
          foreground: "#c5c8c6",
        },
        fontFamily: "monospace",
        fontSize: 14,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddonRef.current = fitAddon;
      term.writeln("Welcome to Git Bash");
      (term as Terminal & { prompt: () => void }).prompt = () => {
        term.write(`\r\nuser@winsim:${cwd.replace("/Users/Public", "~")}$ `);
      };
      (term as Terminal & { prompt: () => void }).prompt();
      let buffer = "";
      term.onKey(async ({ key, domEvent }) => {
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
      });
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
  }, []);

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
    // Llamar fit después de un pequeño timeout para asegurar el render
    const timeout = setTimeout(fit, 0);
    return () => clearTimeout(timeout);
  });

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "100%", background: "#1d1f21" }}
    />
  );
};

export default GitBash;
