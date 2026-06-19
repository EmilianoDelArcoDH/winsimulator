import Head from "next/head";
import GitbashTutorialWorkspace from "components/onboarding/GitbashTutorialWorkspace";

const GitbashTutorialPage = (): React.ReactElement => (
  <>
    <Head>
      <title>GitBash Tutorial | DH Console</title>
      <meta
        content="Learn to open GitBash from Desktop and run ls to list folders."
        name="description"
      />
    </Head>
    <GitbashTutorialWorkspace />
  </>
);

export default GitbashTutorialPage;
