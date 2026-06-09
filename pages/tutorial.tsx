import Head from "next/head";
import TutorialWorkspace from "components/onboarding/TutorialWorkspace";

const TutorialPage = (): React.ReactElement => (
  <>
    <Head>
      <title>Tour Guiado | DH Console</title>
      <meta
        content="Aprende a usar el escritorio y las actividades Git de DH Console."
        name="description"
      />
    </Head>
    <TutorialWorkspace />
  </>
);

export default TutorialPage;
