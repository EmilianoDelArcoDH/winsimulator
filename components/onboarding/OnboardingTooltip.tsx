import { useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { type TooltipRenderProps } from "react-joyride";
import { type OnboardingStepData } from "hooks/useOnboardingTour";
import { TOOLTIP_RESIZE_EVENT } from "components/onboarding/tooltipPlacement";

const FollowUpTooltipPosition = createGlobalStyle`
  body.onboarding-follow-up-active .react-joyride__floater[data-testid="floater"] {
    inset: auto 10px 50px 10px !important;
    max-width: none !important;
    pointer-events: none;
    position: fixed !important;
    transform: none !important;
    width: auto !important;
  }
`;

const StyledTooltip = styled.div`
  backdrop-filter: blur(18px) saturate(120%);
  background: hsl(0 0% 13% / 94%);
  border: 1px solid hsl(0 0% 48% / 55%);
  border-radius: 7px;
  box-shadow:
    0 12px 36px rgb(0 0 0 / 52%),
    inset 0 1px rgb(255 255 255 / 7%);
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.formats.systemFont};
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  max-width: min(360px, calc(100vw - 24px));
  overflow: hidden;
  padding: 17px;
  width: 360px;

  h2 {
    font-size: 17px;
    font-weight: 600;
    margin: 0 0 12px;
    text-align: center;
  }

  .content {
    color: hsl(0 0% 88%);
    font-size: 14px;
    line-height: 1.5;
    min-height: 0;
    overflow-y: auto;
    text-align: center;
  }

  footer {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
    flex-shrink: 0;
  }

  @media (width > 1024px) {
    max-height: calc(100vh - 32px);
    max-width: min(360px, calc(100vw - 32px));
  }

  @media (width < 600px) {
    max-height: calc(100vh - 16px);
    max-width: min(360px, calc(100vw - 16px));
  }

  .spacer {
    flex: 1;
  }

  .action-label {
    color: ${({ theme }) => theme.colors.highlight};
    flex-basis: 100%;
    font-size: 12px;
    margin-bottom: 2px;
    text-align: center;
  }

  button {
    background: hsl(0 0% 100% / 7%);
    border: 1px solid hsl(0 0% 55% / 35%);
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    min-height: 34px;
    padding: 7px 10px;

    &:hover {
      background: ${({ theme }) => theme.colors.taskbar.hover};
      border-color: hsl(0 0% 65% / 50%);
    }

    &.primary {
      background: #0078d4;
      border-color: #2387cf;
      color: white;
      font-weight: 600;

      &:hover {
        background: #1689d8;
      }
    }
  }

  @media (width <= 460px), (height <= 520px) {
    padding: 13px;

    h2 {
      font-size: 15px;
      margin-bottom: 8px;
    }

    .content {
      font-size: 13px;
    }

    footer {
      gap: 6px;
      margin-top: 12px;
    }

    button {
      min-height: 32px;
      padding: 6px 8px;
    }
  }

  body.onboarding-follow-up-active & {
    align-items: center;
    display: flex;
    justify-content: center;
    max-height: none;
    max-width: none;
    min-height: 34px;
    overflow: hidden;
    padding: 8px 10px;
    width: auto;

    h2,
    .content,
    footer button,
    .spacer {
      display: none;
    }

    footer {
      margin: 0;
      min-width: 0;
    }

    .action-label {
      flex-basis: auto;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

const OnboardingTooltip: FC<TooltipRenderProps> = ({
  backProps,
  controls,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const {
    actionLabel,
    buttonBack,
    buttonFinish,
    buttonNext,
    buttonPause,
    buttonSkip,
    progress,
    requiresAction,
    usesModalFallback = false,
  } = (step.data as OnboardingStepData | undefined) || {};

  useEffect(() => {
    const tooltip = tooltipRef.current;
    const reportSize = (): void => {
      if (!tooltip) return;

      const { height, width } = tooltip.getBoundingClientRect();

      window.dispatchEvent(
        new CustomEvent(TOOLTIP_RESIZE_EVENT, {
          detail: {
            height: Math.ceil(height),
            width: Math.ceil(width),
          },
        })
      );
    };

    const resizeObserver =
      tooltip && typeof ResizeObserver === "function"
        ? new ResizeObserver(reportSize)
        : undefined;

    if (tooltip) {
      resizeObserver?.observe(tooltip);
      reportSize();
    }

    return () => resizeObserver?.disconnect();
  }, [/* effect dep */ index]);

  return (
    <>
      <FollowUpTooltipPosition />
      <StyledTooltip
        ref={tooltipRef}
        data-modal-fallback={usesModalFallback}
        {...tooltipProps}
      >
        {step.title && <h2>{step.title}</h2>}
        <div className="content">{step.content}</div>
        <footer>
          {requiresAction && (
            <strong className="action-label">{actionLabel}</strong>
          )}
          <button type="button" {...skipProps}>
            {buttonSkip}
          </button>
          <button onClick={() => controls.stop()} type="button">
            {buttonPause}
          </button>
          <span className="spacer" />
          {index > 0 && (
            <button type="button" {...backProps}>
              {buttonBack}
            </button>
          )}
          {!requiresAction && (
            <button className="primary" type="button" {...primaryProps}>
              {isLastStep
                ? buttonFinish
                : `${buttonNext} (${(progress || "{current} de {total}")
                    .replace("{current}", String(index + 1))
                    .replace("{total}", String(size))})`}
            </button>
          )}
        </footer>
      </StyledTooltip>
    </>
  );
};

export default OnboardingTooltip;
