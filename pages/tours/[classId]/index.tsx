import dynamic from "next/dynamic";
import { memo } from "react";
import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";

const ClassTourRunner = dynamic(() => import("components/tours/ClassTourRunner"), {
  ssr: false,
});

const ClassTourPage = (): React.ReactElement => (
  <Desktop>
    <Taskbar />
    <AppsLoader />
    <ClassTourRunner />
  </Desktop>
);

export default memo(ClassTourPage);
