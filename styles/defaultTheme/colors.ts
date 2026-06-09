const colors = {
  accent: "#0078D4",
  accentHover: "#1084D8",
  accentPressed: "#0067B8",
  background: "#000",
  fileEntry: {
    background: "hsla(207, 30%, 72%, 25%)",
    backgroundFocused: "hsla(207, 60%, 72%, 35%)",
    backgroundFocusedHover: "hsla(207, 90%, 72%, 30%)",
    border: "hsla(207, 30%, 72%, 30%)",
    borderFocused: "hsla(207, 60%, 72%, 35%)",
    borderFocusedHover: "hsla(207, 90%, 72%, 40%)",
    text: "#FFF",
    textShadow: `
      0 0 1px rgba(0, 0, 0, 75%),
      0 0 2px rgba(0, 0, 0, 50%),

      0 1px 1px rgba(0, 0, 0, 75%),
      0 1px 2px rgba(0, 0, 0, 50%),

      0 2px 1px rgba(0, 0, 0, 75%),
      0 2px 2px rgba(0, 0, 0, 50%)`,
  },
  highlight: "#60CDFF",
  progress: "hsla(113, 78%, 56%, 90%)",
  progressBackground: "hsla(104, 22%, 45%, 70%)",
  progressBarRgb: "rgb(6, 176, 37)",
  selectionHighlight: "#0078D4",
  selectionHighlightBackground: "rgba(0, 120, 212, 0.3)",
  taskbar: {
    active: "rgba(255, 255, 255, 0.06)",
    activeForeground: "rgba(255, 255, 255, 0.1)",
    ai: {
      balanced: ["rgb(112, 203, 255)", "rgb(40, 112, 234)", "rgb(0, 95, 184)"],
      creative: [
        "rgb(215, 167, 187)",
        "rgb(145, 72, 135)",
        "rgb(139, 37, 126)",
      ],
      precise: ["rgb(167, 224, 235)", "rgb(0, 104, 128)", "rgb(0, 83, 102)"],
    },
    background: "rgba(32, 32, 32, 0.78)",
    button: {
      color: "#FFF",
    },
    foreground: "rgba(255, 255, 255, 0.1)",
    foregroundHover: "rgba(255, 255, 255, 0.14)",
    foregroundProgress: "hsla(104, 22%, 45%, 30%)",
    hover: "rgba(255, 255, 255, 0.08)",
    peekBorder: "hsla(0, 0%, 50%, 50%)",
  },
  text: "rgba(255, 255, 255, 0.92)",
  textSecondary: "rgba(255, 255, 255, 0.66)",
  titleBar: {
    background: "rgba(32, 32, 32, 0.96)",
    backgroundHover: "rgba(255, 255, 255, 0.08)",
    backgroundInactive: "rgba(43, 43, 43, 0.96)",
    buttonInactive: "rgb(128, 128, 128)",
    closeHover: "rgb(232, 17, 35)",
    text: "rgb(255, 255, 255)",
    textInactive: "rgb(170, 170, 170)",
  },
  window: {
    background: "rgb(32, 32, 32)",
    outline: "rgba(255, 255, 255, 0.14)",
    outlineInactive: "rgba(255, 255, 255, 0.08)",
    shadow: "0 32px 64px rgba(0, 0, 0, 0.38), 0 2px 8px rgba(0, 0, 0, 0.28)",
    shadowInactive:
      "0 16px 32px rgba(0, 0, 0, 0.28), 0 1px 4px rgba(0, 0, 0, 0.22)",
  },
};

export default colors;
