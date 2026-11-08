"use client";

import {
  SearchRounded,
  ZoomInMapRounded,
  ZoomOutMapRounded,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import bbox from "@turf/bbox";
import center from "@turf/center";
import type { Map as MaplibreMap, MapLayerMouseEvent } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";

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

  // #region province search
  const mapRef = useRef<MapRef>(null);
  const [provinceFeatures, setProvinceFeatures] = useState<GeoJSON.Feature[]>(
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/maps/provinces.geojson");
        const data: GeoJSON.FeatureCollection = await response.json();
        if (!cancelled) setProvinceFeatures(data.features);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // #region map func
  const selectProvinceFeature = useCallback(
    (feature: GeoJSON.Feature, map: MaplibreMap) => {
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
    },
    [],
  );

  const handleProvinceClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const { features, target: map } = event;
      if (!features || features.length === 0) return;
      const feature = features[0];
      if (!feature) return;
      selectProvinceFeature(feature, map);
    },
    [selectProvinceFeature],
  );

  const handleProvinceSearchSelect = useCallback(
    (feature: GeoJSON.Feature | null) => {
      if (!feature) return;
      const map = mapRef.current?.getMap();
      if (!map) return;
      selectProvinceFeature(feature, map);
    },
    [selectProvinceFeature],
  );

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
        position={"relative"}
        sx={{
          padding: "0.5px",
          outline: "1px solid",
          outlineColor: "divider",
          transition: "250ms ease height",
        }}
      >
        <Autocomplete
          options={provinceFeatures}
          getOptionLabel={(feature) =>
            (feature.properties?.pro_th as string | undefined) ?? ""
          }
          onChange={(_event, feature) => handleProvinceSearchSelect(feature)}
          size={"small"}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={"Search province"}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <SearchRounded
                      fontSize={"small"}
                      sx={{ color: "text.secondary", marginRight: "0.25rem" }}
                    />
                  ),
                },
              }}
            />
          )}
          sx={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            width: "14rem",
            maxWidth: "calc(100% - 1rem)",
            zIndex: 1,
            bgcolor: "white",
            borderRadius: "0.25rem",
          }}
        />
        <UtilityMap
          ref={mapRef}
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
