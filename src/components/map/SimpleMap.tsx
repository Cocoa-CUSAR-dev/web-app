"use client";

import { Box, CircularProgress } from "@mui/material";
import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { XYZ } from "ol/source";
import View from "ol/View";
import { useEffect, useRef } from "react";

function SimpleMap({
  center = {
    lat: 13.76495273150578,
    long: 100.53831082133252,
  },
  isLoading = false,
}: {
  center?: {
    lat: number;
    long: number;
  };
  isLoading?: boolean;
}) {
  const mapElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([center.long, center.lat]),
        zoom: 12,
      }),
      controls: [],
    });

    return () => {
      initialMap.setTarget(undefined);
    };
  }, [center.lat, center.long]);

  return (
    <Box
      ref={mapElement}
      width={"100%"}
      height={"100%"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      position={"relative"}
      sx={{
        bgcolor: "#FFFFFF",
      }}
    >
      {isLoading && (
        <Box
          width={"100%"}
          height={"100%"}
          position={"absolute"}
          top={"0"}
          left={"0"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

export default SimpleMap;
