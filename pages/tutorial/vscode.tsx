import Head from "next/head";
import VscodeTutorialWorkspace from "components/onboarding/VscodeTutorialWorkspace";

const VscodeTutorialPage = (): React.ReactElement => (
  <>
    <Head>
      <title>Visual Studio Code Tutorial | DH Console</title>
      <meta
        content="Learn to create a folder, an index.html file, and use the Visual Studio Code terminal."
        name="description"
      />
    </Head>
    <VscodeTutorialWorkspace />
  </>
);

export default VscodeTutorialPage;
