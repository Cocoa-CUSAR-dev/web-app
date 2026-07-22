"use client";

import { Button, Stack } from "@mui/material";

import { handleFileResponseXlsx } from "@/libs/handleFileResponse";

function DebugDownload() {
  const handleDownloadHarvest = async () => {
    const response = await fetch("/api/v1/forms/download?sheets=HARVEST", {
      method: "GET",
      credentials: "include",
    });
    await handleFileResponseXlsx(response);
  };
  const handleDownloadFarm = async () => {
    const response = await fetch("/api/v1/forms/download?sheets=FARM", {
      method: "GET",
      credentials: "include",
    });
    await handleFileResponseXlsx(response);
  };
  const handleDownloadHarvestFarm = async () => {
    const response = await fetch("/api/v1/forms/download?sheets=FARM,HARVEST", {
      method: "GET",
      credentials: "include",
    });
    await handleFileResponseXlsx(response);
  };
  const handleDownloadBadRequest = async () => {
    const response = await fetch("/api/v1/forms/download", {
      method: "GET",
      credentials: "include",
    });
    await handleFileResponseXlsx(response);
  };

  return (
    <Stack padding={"3rem"} spacing={2}>
      <Button
        variant="outlined"
        onClick={() => {
          handleDownloadHarvest();
        }}
      >
        {"Harvest"}
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          handleDownloadHarvestFarm();
        }}
      >
        {"Harvest"}
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          handleDownloadFarm();
        }}
      >
        {"Harvest"}
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          handleDownloadBadRequest();
        }}
      >
        {"Harvest"}
      </Button>
    </Stack>
  );
}

export default DebugDownload;
