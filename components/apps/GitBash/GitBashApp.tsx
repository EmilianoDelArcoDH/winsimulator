import dynamic from "next/dynamic";
import { type FC } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const GitBash = dynamic(() => import("./index"), { ssr: false });

const GitBashApp: FC<ComponentProcessProps> = (props) => <GitBash {...props} />;

export default GitBashApp;
