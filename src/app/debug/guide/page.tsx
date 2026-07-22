"use client";

import { Box, Stack, Typography } from "@mui/material";
import { type Step } from "react-joyride";

import UnControlledRerunableTutorial from "@/components/utility/UnControlledRerunableTutorial";

const debugSteps: Step[] = [
  {
    target: "#heyheyhey-10",
    content: "Test Content 1",
    skipBeacon: true,
  },
  {
    target: "#heyheyhey-12",
    content: "Yep, it works.",
    skipBeacon: true,
  },
];

function DebugGuide() {
  const items = [
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
    {
      id: "heyheyhey",
    },
  ];
  return (
    <>
      <Stack padding={"3rem"} spacing={2} alignItems={"start"}>
        <UnControlledRerunableTutorial steps={debugSteps} />
        {items.map((item, idx) => {
          return (
            <Box
              key={item.id + idx}
              id={item.id + "-" + idx}
              padding={"1rem"}
              borderRadius={"0.5rem"}
              bgcolor={"lightblue"}
            >
              <Typography variant="body1">{item.id + " " + idx}</Typography>
            </Box>
          );
        })}
      </Stack>
    </>
  );
}

export default DebugGuide;
