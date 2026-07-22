"use client";

import { HelpRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { useEffect } from "react";
import { EventHandler, Step, useJoyride } from "react-joyride";

interface SeenObject {
  seen: boolean;
  expireDate: string;
}

function UnControlledRerunableTutorial({
  steps,
  keyString = "cocoa_rerunable_tutorial_default_key",
  disabledCheckIfAlreadyRun = false,
  skipInitialRun = false,
  continuous = true,
  showProgress = true,
  skipScroll = false,
  skipBeacon,
  StartComponent,
  showIcon = true,
  isIconButton = false,
  icon = <HelpRounded />,
  isStartIcon = true,
  buttonLabel = "Start Guide",
  onEvent,
  isRerunable = true,
  isButtonOutlined = true,
}: {
  steps: Step[];
  keyString?: string;
  disabledCheckIfAlreadyRun?: boolean;
  skipInitialRun?: boolean;
  continuous?: boolean;
  showProgress?: boolean;
  skipScroll?: boolean;
  skipBeacon?: boolean;
  StartComponent?: (props: { onClick: () => void }) => React.ReactNode;
  showIcon?: boolean;
  isIconButton?: boolean;
  icon?: React.ReactNode;
  isStartIcon?: boolean;
  buttonLabel?: string;
  onEvent?: EventHandler;
  isRerunable?: boolean;
  isButtonOutlined?: boolean;
}) {
  const { controls, on, Tour } = useJoyride({
    onEvent: onEvent,
    continuous: continuous,
    options: {
      showProgress: showProgress,
      skipScroll: skipScroll,
      skipBeacon: skipBeacon,
    },
    steps: steps,
  });

  useEffect(() => {
    return isRerunable
      ? on("tour:end", () => {
          controls.reset();
        })
      : undefined;
  }, [controls, isRerunable, on]);

  useEffect(() => {
    if (skipInitialRun) return;
    if (disabledCheckIfAlreadyRun) {
      controls.start();
      return;
    }

    try {
      const storedData = localStorage.getItem(keyString);
      const now = new Date();

      const getNewExpiry = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString();
      };

      if (!storedData) {
        controls.start();
        localStorage.setItem(
          keyString,
          JSON.stringify({ seen: true, expireDate: getNewExpiry() }),
        );
        return;
      }

      const { seen, expireDate }: SeenObject = JSON.parse(storedData);

      const isExpired = expireDate ? new Date(expireDate) < now : true;

      if (!seen || isExpired) {
        controls.start();
        localStorage.setItem(
          keyString,
          JSON.stringify({
            seen: true,
            expireDate: getNewExpiry(),
          }),
        );
      }
    } catch (e) {
      console.error("Tour localStorage error:", e);
      controls.start();
    }
  }, [controls, disabledCheckIfAlreadyRun, keyString, skipInitialRun]);

  if (StartComponent) {
    return (
      <>
        {Tour}
        <StartComponent
          onClick={() => {
            controls.start();
          }}
        />
      </>
    );
  }

  if (!showIcon) {
    return <>{Tour}</>;
  }

  if (isIconButton) {
    return (
      <>
        {Tour}
        <IconButton
          onClick={() => {
            controls.start();
          }}
        >
          {icon}
        </IconButton>
      </>
    );
  }

  return (
    <>
      {Tour}
      <Button
        variant={isButtonOutlined ? "outlined" : "contained"}
        startIcon={isStartIcon ? icon : undefined}
        endIcon={isStartIcon ? undefined : icon}
        onClick={() => {
          controls.start();
        }}
      >
        {buttonLabel}
      </Button>
    </>
  );
}

export default UnControlledRerunableTutorial;
