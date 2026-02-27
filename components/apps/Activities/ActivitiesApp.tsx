import dynamic from "next/dynamic";
import { type FC } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Activities = dynamic(() => import("./index"), {
    ssr: false,
});

const ActivitiesApp: FC<ComponentProcessProps> = (props) => (
    <Activities {...props} />
);

export default ActivitiesApp;
