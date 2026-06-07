import "styled-components";

import type colors from "styles/defaultTheme/colors";
import type effects from "styles/defaultTheme/effects";
import type formats from "styles/defaultTheme/formats";
import type sizes from "styles/defaultTheme/sizes";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: typeof colors;
    effects: typeof effects;
    formats: typeof formats;
    name: string;
    sizes: typeof sizes;
  }
  export function useTheme(): DefaultTheme;
}
