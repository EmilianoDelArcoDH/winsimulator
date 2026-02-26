import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFileSystem } from "contexts/fileSystem";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const HISTORY_KEY = "gitbash_history";

const GitBash: React.FC<ComponentProcessProps> = () => {
    const fs = useFileSystem();
    const fsRef = useRef(fs);
    const [cwd, setCwd] = useState<string>("/Users/Public");
    const cwdRef = useRef<string>("/Users/Public");
    const [lines, setLines] = useState<string[]>(["Welcome to Git Bash"]);
    const [input, setInput] = useState("");
    const outputRef = useRef<HTMLDivElement | null>(null);
    const gitRepos = useRef<Record<string, { initialized: boolean; staged: Set<string> }>>({});

    const prompt = useMemo(
        () => `user@winsim:${cwd.replace("/Users/Public", "~")}$`,
        [cwd]
    );

    const appendLine = useCallback((value: string): void => {
        setLines((current) => [...current, value]);
    }, []);

    const pushHistory = useCallback((command: string): void => {
        if (!command.trim()) return;

        try {
            const history = window.localStorage.getItem(HISTORY_KEY) || "";
            const nextHistory = history ? `${history}\n${command}` : command;

            window.localStorage.setItem(HISTORY_KEY, nextHistory);
        } catch {
            // Ignore localStorage failures
        }
    }, []);

    useEffect(() => {
        fsRef.current = fs;
    }, [fs]);

    useEffect(() => {
        outputRef.current?.scrollTo({
            top: outputRef.current.scrollHeight,
        });
    }, [lines]);

    const runCommand = useCallback(
        async (command: string): Promise<void> => {
            const fileSystem = fsRef.current;
            const currentCwd = cwdRef.current;
            const args = command.trim().split(/\s+/);
            const cmd = args[0];
            const params = args.slice(1);

            const ANSI_RESET = "\u001B[0m";
            const ANSI_GREEN = "\u001B[32m";
            const ANSI_BLUE = "\u001B[34m";
            const ANSI_GRAY = "\u001B[37m";
            const print = (message: string) => appendLine(message);

            try {
                switch (cmd) {
                    case "ll": {
                        const files = await fileSystem.readdir(currentCwd);

                        for (const file of files) {
                            const filePath = `${currentCwd}/${file}`.replace(/\/+/g, "/");
                            let color = ANSI_GRAY;
                            let perms = "-rw-r--r--";

                            try {
                                const stat = await fileSystem.lstat(filePath);

                                if (stat.isDirectory()) {
                                    color = ANSI_BLUE;
                                    perms = "drwxr-xr-x";
                                }
                            } catch {
                                // Ignore file stat failures
                            }

                            print(
                                `${perms} 1 user user 0 Jan 1 00:00 ${color}${file}${ANSI_RESET}`
                            );
                        }
                        break;
                    }
                    case "rm":
                        if (params[0]) {
                            const filePath = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");

                            if (await fileSystem.exists(filePath)) {
                                await fileSystem.unlink(filePath);
                            } else {
                                print(
                                    `rm: no se puede borrar '${params[0]}': No such file or directory`
                                );
                            }
                        } else {
                            print("rm: falta el operando del archivo");
                        }
                        break;

                    case "cp":
                        if (params[0] && params[1]) {
                            const src = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");
                            const dest = `${currentCwd}/${params[1]}`.replace(/\/+/g, "/");

                            if (await fileSystem.exists(src)) {
                                const content = await fileSystem.readFile(src);

                                await fileSystem.writeFile(dest, content);
                            } else {
                                print(`cp: no se puede copiar '${params[0]}': No such file`);
                            }
                        } else {
                            print("cp: falta archivo origen o destino");
                        }
                        break;

                    case "mv":
                        if (params[0] && params[1]) {
                            const src = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");
                            const dest = `${currentCwd}/${params[1]}`.replace(/\/+/g, "/");

                            if (await fileSystem.exists(src)) {
                                const content = await fileSystem.readFile(src);

                                await fileSystem.writeFile(dest, content);
                                await fileSystem.unlink(src);
                            } else {
                                print(`mv: no se puede mover '${params[0]}': No such file`);
                            }
                        } else {
                            print("mv: falta archivo origen o destino");
                        }
                        break;

                    case "history":
                        try {
                            const history = window.localStorage.getItem(HISTORY_KEY);

                            if (history) {
                                history.split("\n").forEach((entry, index) => {
                                    print(`${index + 1}  ${entry}`);
                                });
                            } else {
                                print("Sin historial");
                            }
                        } catch {
                            print("No soportado en este entorno");
                        }
                        break;

                    case "ls": {
                        const files = await fileSystem.readdir(currentCwd);
                        let output = "";

                        for (const file of files) {
                            const filePath = `${currentCwd}/${file}`.replace(/\/+/g, "/");
                            let color = ANSI_GRAY;

                            try {
                                const stat = await fileSystem.lstat(filePath);

                                if (stat.isDirectory()) color = ANSI_BLUE;
                            } catch {
                                // Ignore file stat failures
                            }
                            output += `${color}${file}${ANSI_RESET}  `;
                        }

                        print(output.trim());
                        break;
                    }
                    case "pwd":
                        print(currentCwd);
                        break;

                    case "cd":
                        if (params[0]) {
                            let newPath = params[0].startsWith("/")
                                ? params[0]
                                : `${currentCwd}/${params[0]}`;

                            newPath = newPath.replace(/\/+/g, "/").replace(/\/.\$/, "");

                            if (await fileSystem.exists(newPath)) {
                                cwdRef.current = newPath;
                                setCwd(newPath);
                            } else {
                                print(`cd: ${params[0]}: No such directory`);
                            }
                        }
                        break;

                    case "mkdir":
                        if (params[0]) {
                            const dirPath = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");

                            await fileSystem.mkdir(dirPath);
                        }
                        break;

                    case "touch":
                        if (params[0]) {
                            const filePath = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");

                            await fileSystem.writeFile(filePath, "");
                        }
                        break;

                    case "cat":
                        if (params[0]) {
                            const filePath = `${currentCwd}/${params[0]}`.replace(/\/+/g, "/");

                            if (await fileSystem.exists(filePath)) {
                                const contentBuffer = await fileSystem.readFile(filePath);

                                print(contentBuffer.toString());
                            } else {
                                print(`cat: ${params[0]}: No such file`);
                            }
                        }
                        break;

                    case "echo":
                        print(params.join(" "));
                        break;

                    case "git":
                        if (params[0] === "--version") {
                            print("git version 2.42.0");
                        } else if (params[0] === "init") {
                            if (!gitRepos.current[currentCwd]) {
                                gitRepos.current[currentCwd] = {
                                    initialized: true,
                                    staged: new Set(),
                                };
                                print(`Initialized empty Git repository in ${currentCwd}/.git/`);
                            } else if (gitRepos.current[currentCwd].initialized) {
                                print("Reinitialized existing Git repository.");
                            } else {
                                gitRepos.current[currentCwd].initialized = true;
                                print(`Initialized empty Git repository in ${currentCwd}/.git/`);
                            }
                        } else if (params[0] === "add") {
                            if (
                                !gitRepos.current[currentCwd]?.initialized
                            ) {
                                print(
                                    "fatal: not a git repository (or any of the parent directories): .git"
                                );
                            } else if (params[1] === ".") {
                                const files = await fileSystem.readdir(currentCwd);

                                files.forEach((file) =>
                                    gitRepos.current[currentCwd].staged.add(file)
                                );
                                print("Todos los archivos agregados al área de staging.");
                            } else if (params[1]) {
                                const target = params[1];
                                const files = await fileSystem.readdir(currentCwd);

                                if (files.includes(target)) {
                                    gitRepos.current[currentCwd].staged.add(target);
                                    print(`${target} agregado al área de staging.`);
                                } else {
                                    print(`fatal: pathspec '${target}' did not match any files`);
                                }
                            } else {
                                print("git add: falta el archivo a agregar");
                            }
                        } else {
                            print(
                                "Comando git soportado: --version, init, add <archivo> o add ."
                            );
                        }
                        break;

                    case "help":
                        [
                            "Comandos básicos disponibles:",
                            "",
                            "  ls         Lista archivos y carpetas",
                            "  ll         Lista detallada (alias ls -l)",
                            "  pwd        Muestra el directorio actual",
                            "  cd DIR     Cambia de directorio",
                            "  mkdir DIR  Crea un directorio",
                            "  touch FILE Crea un archivo vacío",
                            "  cat FILE   Muestra el contenido de un archivo",
                            "  echo TEXT  Imprime texto",
                            "  rm FILE    Elimina un archivo",
                            "  cp SRC DST Copia archivo",
                            "  mv SRC DST Mueve/renombra archivo",
                            "  history    Muestra historial de comandos",
                            "  clear      Limpia la pantalla",
                            "  git --version  Muestra la versión de git simulada",
                            "  help       Muestra esta ayuda",
                            "",
                            "Ejemplo de uso:",
                            "  cd carpeta",
                            "  ls",
                            "  cat archivo.txt",
                            "  rm archivo.txt",
                        ].forEach(print);
                        break;

                    case "clear":
                        setLines([]);
                        break;

                    case "":
                        break;
                    default:
                        print(`${cmd}: comando no encontrado`);
                }
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Error desconocido";

                print(`Error: ${message}`);
            }
        },
        [appendLine]
    );

    const runInput = useCallback(async (): Promise<void> => {
        const command = input;

        appendLine(`${prompt} ${command}`);
        setInput("");
        pushHistory(command);
        await runCommand(command);
    }, [appendLine, input, prompt, pushHistory, runCommand]);

    return (
        <div
            style={{
                background: "#1d1f21",
                color: "#c5c8c6",
                display: "flex",
                flexDirection: "column",
                fontFamily: "monospace",
                fontSize: 14,
                height: "100%",
                padding: 8,
                width: "100%",
            }}
        >
            <div
                ref={outputRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                {lines.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                ))}
            </div>

            <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                <span style={{ color: "#32cd32" }}>{prompt}</span>
                <input
                    onChange={({ target }) => setInput(target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            void runInput();
                        }
                    }}
                    spellCheck={false}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#c5c8c6",
                        flex: 1,
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        outline: "none",
                    }}
                    value={input}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default GitBash;
