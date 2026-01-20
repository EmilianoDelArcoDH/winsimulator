import React, { useRef, useState, useEffect } from "react";
import { useProcesses } from "contexts/process";

const DEFAULT_CWD = "C:\\Users\\usuario\\Desktop";

const TerminalTrainer: React.FC<{ id: string }> = ({ id }) => {
    const { processes } = useProcesses();
    const processCwd = processes[id]?.cwd as string | undefined;
    const [lines, setLines] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [currentCwd, setCurrentCwd] = useState(processCwd || DEFAULT_CWD);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [lines]);

    useEffect(() => {
        if (processCwd && processCwd !== currentCwd) {
            setCurrentCwd(processCwd);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processCwd]);

    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const trimmed = input.trim();
            let output = "";
            if (trimmed === "dir") {
                output = "[mock] Directory listing...";
            } else if (trimmed.startsWith("cd ")) {
                const newDir = trimmed.slice(3).trim();
                setCurrentCwd(newDir ? newDir : currentCwd);
                output = `Changed directory to ${newDir || currentCwd}`;
            } else if (trimmed) {
                output = `'${trimmed}' is not recognized as an internal or external command.`;
            }
            setLines([...lines, `${currentCwd}> ${input}`, output]);
            setInput("");
        }
    };

    return (
        <div
            style={{
                background: "#111",
                color: "#eee",
                fontFamily: "Consolas, monospace",
                padding: 16,
                height: 320,
                overflowY: "auto",
            }}
            onClick={() => inputRef.current?.focus()}
        >
            {lines.map((line, idx) => (
                <div key={idx} style={{ whiteSpace: "pre-wrap" }}>
                    {line}
                </div>
            ))}
            <div style={{ display: "flex", alignItems: "center" }}>
                <span>{currentCwd}&gt; </span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInput}
                    style={{
                        background: "#111",
                        color: "#eee",
                        border: "none",
                        outline: "none",
                        fontFamily: "Consolas, monospace",
                        flex: 1,
                    }}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default TerminalTrainer;
