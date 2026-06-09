import { memo, useCallback } from "react";
import StyledLanguageSwitcher from "components/system/Taskbar/LanguageSwitcher/StyledLanguageSwitcher";
import { useSession } from "contexts/session";
import { FOCUSABLE_ELEMENT } from "utils/constants";
import { LANGUAGE_OPTIONS, t } from "utils/i18n";
import { label } from "utils/functions";

type LanguageSwitcherProps = {
  clockWidth: number;
  hasAI: boolean;
};

const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ clockWidth, hasAI }) => {
  const { language, setLanguage } = useSession();
  const onClick = useCallback(() => {
    const currentIndex = LANGUAGE_OPTIONS.indexOf(language);
    const nextLanguage =
      LANGUAGE_OPTIONS[(currentIndex + 1) % LANGUAGE_OPTIONS.length];

    setLanguage(nextLanguage);
  }, [language, setLanguage]);

  return (
    <StyledLanguageSwitcher
      $clockWidth={clockWidth}
      $hasAI={hasAI}
      onClick={onClick}
      {...label(
        `${t(language, "taskbar.language")}: ${language.toUpperCase()}`
      )}
      {...FOCUSABLE_ELEMENT}
    >
      {language.toUpperCase()}
    </StyledLanguageSwitcher>
  );
};

export default memo(LanguageSwitcher);
