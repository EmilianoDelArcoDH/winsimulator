import { sendPgEvent } from "utils/pg-event";

type ActivityPgEventPayload = {
  completed: boolean;
  reason: string[];
  state: unknown;
};

export const sendActivityPgEvent = ({
  completed,
  reason,
  state,
}: ActivityPgEventPayload): void => {
  globalThis.console?.log?.("[sendActivityPgEvent]", {
    completed,
    event: completed ? "SUCCESS" : "FAILURE",
    message: completed ? "Ejercicio resuleto" : "Hay errores en tu actividad",
    reason,
    state,
  });

  sendPgEvent({
    event: completed ? "SUCCESS" : "FAILURE",
    message: completed ? "Ejercicio resuleto" : "Hay errores en tu actividad",
    reasons: reason,
    state,
  });
};
