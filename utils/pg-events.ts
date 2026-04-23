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
  // eslint-disable-next-line no-console
  console.log("[sendActivityPgEvent]", {
    completed,
    event: completed ? "SUCCES" : "FAILURE",
    message: completed ? "Ejercicio resuleto" : "Hay errores en tu actividad",
    reason,
    state,
  });

  sendPgEvent({
    event: completed ? "SUCCES" : "FAILURE",
    message: completed ? "Ejercicio resuleto" : "Hay errores en tu actividad",
    reasons: reason,
    state,
  });
};
