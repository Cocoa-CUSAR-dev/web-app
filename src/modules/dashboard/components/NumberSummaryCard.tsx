"use client";

import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const defaultOldDate = "1970-01";

function NumberSummaryCard({
  title,
  interval = 7,
  onLoadData,
  unit,
}: {
  title: string;
  interval?: number;
  onLoadData: (from: string, to: string) => Promise<number>;
  unit?: string;
}) {
  const [primaryValue, setPrimaryValue] = useState<number | null>(null);
  const [secondaryValue, setSecondaryValue] = useState<number | null>(null);
  const { today, xDaysAgo } = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - interval);

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return { today: fmt(to), xDaysAgo: fmt(from) };
  }, [interval]);

  useEffect(() => {
    (async () => {
      try {
        const [pNumber, sNumber] = await Promise.all([
          onLoadData(defaultOldDate, today),
          onLoadData(xDaysAgo, today),
        ]);
        setPrimaryValue(pNumber);
        setSecondaryValue(sNumber);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [onLoadData, today, xDaysAgo]);

  const content = useMemo(() => {
    if (!primaryValue || !secondaryValue) {
      return (
        <Box
          width={"100%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <CircularProgress />
        </Box>
      );
    }
    return (
      <>
        <Typography variant={"caption"}>{title}</Typography>
        <Typography variant={"h3"}>{primaryValue + (unit ?? "")}</Typography>
        <Typography>
          {(secondaryValue >= 0 ? "+" : "-") +
            secondaryValue +
            " " +
            (unit ?? " ") +
            `in the past ${interval} days`}
        </Typography>
      </>
    );
  }, [interval, primaryValue, secondaryValue, title, unit]);

  return (
    <Stack
      component={Paper}
      elevation={2}
      width={"100%"}
      height={"100%"}
      padding={"1rem"}
    >
      {content}
    </Stack>
  );
}

export default NumberSummaryCard;
