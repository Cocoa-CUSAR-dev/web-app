"use client";

import { ZoomInMapRounded, ZoomOutMapRounded } from "@mui/icons-material";
import { Box, Divider, Stack, Typography } from "@mui/material";
import bbox from "@turf/bbox";
import center from "@turf/center";
import { MapLayerMouseEvent } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useState } from "react";

import UtilityMap from "@/components/map/UtilityMap";

import { dashboardMapModuleContents } from "../dashboardConstants";
import { useDashboardTitle } from "../DashboardLayout";
import { useDashboardContent } from "../hooks/useDashboardContent";
import DashboardMapHarvestSubmodule from "./submodule/DashboardMapHarvestSubmodule";
import DashboardMapUserSubmodule from "./submodule/DashboardMapUserSubmodule";

function DashboardMapModule() {
  // #region context
  const { setTitle } = useDashboardTitle();
  // #region pageState
  const [selectingProvince, setSelectingProvince] = useState<string>("");
  // #region mapState
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const mapHeightRem = useMemo(() => {
    if (isMapExpanded) return 48;
    return 18;
  }, [isMapExpanded]);
  const { setContent, setIsLoading } = useDashboardContent();

  const mapSourceId = "dashboard-map-source";
  const mapLayerId = "dashboard-map-layer";

  const [markerTitle, setMarkerTitle] = useState<React.ReactNode | undefined>(
    undefined,
  );
  const [markerLat, setMarkerLat] = useState<number | undefined>(undefined);
  const [markerLong, setMarkerLong] = useState<number | undefined>(undefined);

  const [polygon, setPolygon] = useState<GeoJSON.Polygon | null>(null);

  // #region map func
  const handleProvinceClick = useCallback(async (event: MapLayerMouseEvent) => {
    const { features, target: map } = event;
    if (!features || features.length === 0) return;
    const feature = features[0];
    if (!feature) return;
    if (feature) {
      const provinceName = feature.properties?.pro_th || "Unknown";
      const centerPoint = center(feature);
      const [long, lat] = centerPoint.geometry.coordinates;
      setMarkerLat(lat);
      setMarkerLong(long);
      setMarkerTitle(provinceName);
      setSelectingProvince(provinceName);
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 300, essential: true },
      );
      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        setPolygon(geometry);
      }
    }
  }, []);

  // #region effect
  useEffect(() => {
    try {
      setIsLoading(true);
      setContent(dashboardMapModuleContents);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [setContent, setIsLoading]);

  useEffect(() => {
    if (selectingProvince) {
      setTitle("จังหวัด" + selectingProvince);
    }
  }, [selectingProvince, setTitle]);

  // #region marker
  const marker = useMemo(() => {
    if (!markerTitle || !markerLat || !markerLong) return null;
    return (
      <Box
        sx={{
          position: "relative",
          backgroundColor: "white",
          color: "black",
          padding: "4px 12px",
          borderRadius: "0.25rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid white",
          },
          translate: "0 -2rem",
        }}
      >
        <Typography variant="subtitle1">{markerTitle}</Typography>
      </Box>
    );
  }, [markerLat, markerLong, markerTitle]);

  // #region debug
  useEffect(() => {
    console.log(JSON.stringify(polygon));
  }, [polygon]);

  // #region component
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      bgcolor={"white"}
      alignItems={"start"}
      flexWrap={"nowrap"}
      minHeight={0}
      sx={{
        overflowX: "auto",
        overflowY: "auto",
        scrollbarWidth: "thin",
      }}
      id={"dashboard-map-container"}
    >
      <Box
        width={"100%"}
        height={`${mapHeightRem}rem`}
        maxHeight={"80%"}
        flexShrink={0}
        sx={{
          padding: "0.5px",
          outline: "1px solid #808080",
          transition: "250ms ease height",
        }}
      >
        <UtilityMap
          disabledSelectMapStyle
          geoJsonPath={"/maps/provinces.geojson"}
          sourceId={mapSourceId}
          layerId={mapLayerId}
          onFeatureClick={handleProvinceClick}
          marker={marker}
          markerLat={markerLat}
          markerLong={markerLong}
          utilButton={
            isMapExpanded ? <ZoomInMapRounded /> : <ZoomOutMapRounded />
          }
          utilButtonFunction={() => {
            setIsMapExpanded((isExpanded) => !isExpanded);
          }}
        />
      </Box>
      <Stack width={"100%"} spacing={3} divider={<Divider flexItem />}>
        <DashboardMapHarvestSubmodule polygon={polygon} />
        <DashboardMapUserSubmodule />
      </Stack>
    </Stack>
  );
}

export default DashboardMapModule;
