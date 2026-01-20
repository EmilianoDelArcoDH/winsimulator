import React, { useState } from "react";
import { useProcesses } from "contexts/process";

const mockFiles = [
    { name: "Documents", type: "folder" },
    { name: "Photos", type: "folder" },
    { name: "notes.txt", type: "file" },
    { name: "todo.md", type: "file" },
];

export interface ExplorerTrainerProps {
    cwd?: string;
    onOpenTerminal?: (cwd: string) => void;
}

const ExplorerTrainer: React.FC<ExplorerTrainerProps> = ({
    cwd = "C:\\Users\\usuario\\Desktop",
    onOpenTerminal,
}) => {
    const [currentPath, setCurrentPath] = useState(cwd);
    const { open } = useProcesses();

    const handleBreadcrumbClick = (index: number) => {
        const parts = currentPath.split("\\").slice(0, index + 1);
        setCurrentPath(parts.join("\\"));
    };

    const handleOpenTerminal = () => {
        if (onOpenTerminal) {
            onOpenTerminal(currentPath);
        } else {
            open("TerminalTrainer", { cwd: currentPath });
        }
    };

    const breadcrumbs = currentPath.split("\\");

    return (
        <div style={{ padding: 16, fontFamily: "Segoe UI, sans-serif" }}>
            <div style={{ marginBottom: 8 }}>
                {breadcrumbs.map((crumb, idx) => (
                    <span key={idx}>
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "#0078d4",
                                cursor: "pointer",
                            }}
                            onClick={() => handleBreadcrumbClick(idx)}
                        >
                            {crumb || "Root"}
                        </button>
                        {idx < breadcrumbs.length - 1 && <span> \\ </span>}
                    </span>
                ))}
            </div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 16 }}>
                {mockFiles.map((file, idx) => (
                    <li key={idx} style={{ margin: "4px 0" }}>
                        <span role="img" aria-label={file.type} style={{ marginRight: 8 }}>
                            {file.type === "folder" ? "📁" : "📄"}
                        </span>
                        {file.name}
                    </li>
                ))}
            </ul>
            <button
                onClick={handleOpenTerminal}
                style={{
                    padding: "6px 12px",
                    background: "#222",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                }}
            >
                Open Terminal Here
            </button>
        </div>
    );
};

export default ExplorerTrainer;
