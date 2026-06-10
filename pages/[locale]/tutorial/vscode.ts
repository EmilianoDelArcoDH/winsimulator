// eslint-disable-next-line no-restricted-exports
export { default } from "pages/tutorial/vscode";

export const getStaticPaths = (): {
  fallback: false;
  paths: { params: { locale: string } }[];
} => ({
  fallback: false,
  paths: ["es", "en", "pt"].map((locale) => ({
    params: { locale },
  })),
});

export const getStaticProps = (): { props: Record<string, never> } => ({
  props: {},
});
