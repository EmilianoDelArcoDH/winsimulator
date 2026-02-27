import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useEffect } from "react";
import { setCurrentActivityId } from "utils/activityRuntime";

const Activities = dynamic(() => import("components/apps/Activities"), {
    ssr: false,
});

const StandaloneActivityPage = (): React.ReactElement => {
    const router = useRouter();
    const activityId = String(router.query.id || "");

    useEffect(() => {
        if (activityId) {
            setCurrentActivityId(activityId);
        }
    }, [activityId]);

    return <Activities forcedActivityId={activityId} id="standalone-activity" standalone />;
};

export default memo(StandaloneActivityPage);
