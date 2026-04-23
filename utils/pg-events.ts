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
  sendPgEvent({
    event: completed ? "SUCCES" : "FAILURE",
    message: completed ? "Ejercicio resuleto" : "Hay errores en tu actividad",
    reasons: reason,
    state,
  });
};
