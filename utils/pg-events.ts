import { sendPgEvent } from "utils/pg-event";

type ActivityPgEventPayload = {
  completed: boolean;
  message?: string;
  reason: string[];
  state: unknown;
};

export const sendActivityPgEvent = ({
  completed,
  message,
  reason,
  state,
}: ActivityPgEventPayload): void => {
  const eventMessage =
    message || (completed ? "Ejercicio resuelto" : "Hay errores en tu actividad");

  globalThis.console?.log?.("[sendActivityPgEvent]", {
    completed,
    event: completed ? "SUCCESS" : "FAILURE",
    message: eventMessage,
    reason,
    state,
  });

  sendPgEvent({
    event: completed ? "SUCCESS" : "FAILURE",
    message: eventMessage,
    reasons: reason,
    state,
  });
};
