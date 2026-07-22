"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  Box,
  IconButton,
  List,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  Marker,
  Source,
} from "react-map-gl/maplibre";

import { defaultMap, mapStyles } from "@/core/constants/mapConstants";
import { Color, MapType } from "@/core/types";

function UtilityMap({
  onFeatureHover,
  onFeatureClick,
  disabledFeatureHoveredColor = false,
  featureHoveredColor = "rgba(60, 200, 40, 0.5)",
  sourceId = "clickable-source",
  layerId = "clickable-layer",
  geoJson,
  geoJsonPath,
  disabledSelectMapStyle = false,
  customMapStyles = mapStyles,
  initialMapStyle = defaultMap,
  utilButton,
  utilButtonFunction,
  marker,
  markerLat,
  markerLong,
}: {
  onFeatureHover?: (event: MapLayerMouseEvent) => void;
  onFeatureClick?: (event: MapLayerMouseEvent) => void;
  disabledFeatureHoveredColor?: boolean;
  featureHoveredColor?: Color;
  sourceId?: string;
  layerId?: string;
  geoJson?: GeoJSON.GeoJSON;
  geoJsonPath?: string;
  disabledSelectMapStyle?: boolean;
  customMapStyles?: MapType[];
  initialMapStyle?: MapType;
  utilButton?: React.ReactNode;
  utilButtonFunction?: () => void;
  marker?: React.ReactNode;
  markerLat?: number;
  markerLong?: number;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const isInMapStyles = customMapStyles.includes(initialMapStyle);
    if (isInMapStyles) {
      return customMapStyles.indexOf(initialMapStyle);
    }
    return 0;
  });
  const open = Boolean(anchorEl);

  // #region functions
  const handleClickListItem = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleMenuItemClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, index: number) => {
      setSelectedIndex(index);
      setAnchorEl(null);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (onFeatureClick) {
        onFeatureClick(event);
      }
    },
    [onFeatureClick],
  );

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!disabledFeatureHoveredColor) {
        const { features, target: map } = event;
        if (features && features.length > 0) {
          const feature = features[0];
          // if feature change (e.g. change province)
          if (feature.id !== hoveredId) {
            setHoveredId(feature.id as number);
            if (hoveredId !== undefined && hoveredId !== null) {
              // unhover old tile
              map.setFeatureState(
                { source: sourceId, id: hoveredId },
                { hover: false },
              );
            }
            map.setFeatureState(
              {
                source: sourceId,
                id: feature.id,
              },
              { hover: true },
            );
          }
        }
      }
      if (onFeatureHover) {
        onFeatureHover(event);
      }
    },
    [disabledFeatureHoveredColor, hoveredId, onFeatureHover, sourceId],
  );

  // #region mapStyleMenu
  const mapStyleMenu = useMemo(() => {
    if (disabledSelectMapStyle) return null;
    return (
      <>
        <List
          sx={{
            position: "absolute",
            top: "0.5rem",
            left: "0.5rem",
            bgcolor: "white",
            padding: "0.5rem",
            width: "8rem",
            maxWidth: "calc(100% - 1rem)",
            borderRadius: "0.25rem",
            transition: "150ms ease background-color",
            "&:hover": {
              cusor: "pointer",
              backgroundColor: "lightgray",
            },
          }}
          id={"map-lock-button"}
          aria-haspopup={"listbox"}
          aria-controls={"lock-menu"}
          onClick={handleClickListItem}
        >
          <ListItemText
            primary={customMapStyles[selectedIndex]["name"]}
            secondary={"Map Style"}
            slotProps={{
              primary: {
                variant: "subtitle1",
                noWrap: true,
              },
              secondary: {
                variant: "subtitle2",
                noWrap: true,
              },
              root: {
                style: {
                  margin: 0,
                },
              },
            }}
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
            }}
          />
        </List>
        <Menu
          id={"lock-menu"}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {customMapStyles.map((style, idx) => {
            const { name } = style;
            return (
              <MenuItem
                key={"style" + idx}
                selected={idx === selectedIndex}
                onClick={(event) => handleMenuItemClick(event, idx)}
              >
                {name}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }, [
    anchorEl,
    customMapStyles,
    disabledSelectMapStyle,
    handleClickListItem,
    handleClose,
    handleMenuItemClick,
    open,
    selectedIndex,
  ]);

  // #region map
  const map = useMemo(() => {
    const geoJsonObj = geoJsonPath ? geoJsonPath : geoJson;
    if (geoJsonObj) {
      return (
        <Map
          initialViewState={{
            longitude: 100.50194,
            latitude: 13.75692,
            zoom: 7,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
          mapStyle={
            selectedIndex >= customMapStyles.length
              ? defaultMap["style"]
              : customMapStyles[selectedIndex]["style"]
          }
          onClick={onMapClick}
          onMouseMove={onMouseMove}
          interactiveLayerIds={[layerId]}
          attributionControl={false}
        >
          {marker && markerLat && markerLong && (
            <Marker latitude={markerLat} longitude={markerLong} anchor={"top"}>
              {marker}
            </Marker>
          )}
          <Source
            id={sourceId}
            type={"geojson"}
            data={geoJsonObj}
            generateId={true}
          >
            <Layer
              id={layerId}
              type={"fill"}
              paint={{
                "fill-color": featureHoveredColor,
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  1,
                  0,
                ],
                "fill-outline-color": "#fff",
              }}
            />
          </Source>
        </Map>
      );
    }
    return (
      <Map
        initialViewState={{
          longitude: 100.50194,
          latitude: 13.75692,
          zoom: 12,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        mapStyle={
          selectedIndex >= customMapStyles.length
            ? defaultMap["style"]
            : customMapStyles[selectedIndex]["style"]
        }
        attributionControl={false}
      />
    );
  }, [
    customMapStyles,
    featureHoveredColor,
    geoJson,
    geoJsonPath,
    layerId,
    marker,
    markerLat,
    markerLong,
    onMapClick,
    onMouseMove,
    selectedIndex,
    sourceId,
  ]);

  // #region utilButtonLocal
  const utilButtonLocal = useMemo(() => {
    if (!utilButton || !utilButtonFunction) return;
    return (
      <IconButton
        onClick={utilButtonFunction}
        sx={{
          position: "absolute",
          bottom: "0.5rem",
          right: "0.5rem",
        }}
      >
        {utilButton}
      </IconButton>
    );
  }, [utilButton, utilButtonFunction]);

  // #region component
  return (
    <Box width={"100%"} height={"100%"} position={"relative"}>
      {map}
      {mapStyleMenu}
      {utilButtonLocal}
    </Box>
  );
}

export default UtilityMap;
