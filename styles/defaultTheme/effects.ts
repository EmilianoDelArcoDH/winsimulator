const effects = {
  acrylic: {
    background: "rgba(32, 32, 32, 0.78)",
    backgroundFallback: "rgb(32, 32, 32)",
    blur: "20px",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.0837)",
    strong: "rgba(255, 255, 255, 0.14)",
  },
  mica: {
    active: "rgba(32, 32, 32, 0.88)",
    inactive: "rgba(43, 43, 43, 0.92)",
  },
  radius: {
    control: "4px",
    menu: "8px",
    panel: "12px",
    window: "8px",
  },
  shadow: {
    flyout: "0 8px 16px rgba(0, 0, 0, 0.26), 0 0 2px rgba(0, 0, 0, 0.24)",
    window: "0 32px 64px rgba(0, 0, 0, 0.38), 0 2px 8px rgba(0, 0, 0, 0.28)",
    windowInactive:
      "0 16px 32px rgba(0, 0, 0, 0.28), 0 1px 4px rgba(0, 0, 0, 0.22)",
  },
  transition: {
    fast: "100ms cubic-bezier(0.1, 0.9, 0.2, 1)",
    normal: "200ms cubic-bezier(0.1, 0.9, 0.2, 1)",
  },
};

export default effects;
