"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { Box, List, ListItemText, Menu, MenuItem } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import Map, { Layer, MapLayerMouseEvent, Source } from "react-map-gl/maplibre";

import { defaultMap, mapStyles } from "@/core/constants/mapConstants";

function ClickableMap({ geoJsonPath }: { geoJsonPath?: string }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
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

  const onMapClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features && event.features[0];
    console.log(typeof feature);

    if (feature) {
      const provinceName = feature.properties?.pro_th || "Unknown";
      console.log("Clicked Province:", provinceName);
      const polygon = feature.geometry;
      console.log(JSON.stringify(polygon));
    }
  }, []);

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const { features, target: map } = event;
      if (features && features.length > 0) {
        const feature = features[0];
        // if feature change (e.g. change province)
        if (feature.id !== hoveredId) {
          setHoveredId(feature.id as number);
          if (hoveredId) {
            // unhover old tile
            map.setFeatureState(
              { source: "clickable-source", id: hoveredId },
              { hover: false },
            );
          }
          map.setFeatureState(
            {
              source: "clickable-source",
              id: feature.id,
            },
            { hover: true },
          );
        }
      }
    },
    [hoveredId],
  );

  const map = useMemo(() => {
    if (geoJsonPath) {
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
            selectedIndex >= mapStyles.length
              ? defaultMap["style"]
              : mapStyles[selectedIndex]["style"]
          }
          onClick={onMapClick}
          onMouseMove={onMouseMove}
          interactiveLayerIds={["clickable-layer"]}
        >
          <Source
            id={"clickable-source"}
            type={"geojson"}
            data={geoJsonPath}
            generateId={true}
          >
            <Layer
              id={"clickable-layer"}
              type={"fill"}
              paint={{
                "fill-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  "#6abb6e",
                  "#cacaca23",
                ],
                "fill-opacity": 0.4,
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
          selectedIndex >= mapStyles.length
            ? defaultMap["style"]
            : mapStyles[selectedIndex]["style"]
        }
      />
    );
  }, [geoJsonPath, onMapClick, onMouseMove, selectedIndex]);

  return (
    <Box width={"100%"} height={"100%"} position={"relative"}>
      {map}
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
          primary={mapStyles[selectedIndex]["name"]}
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
        {mapStyles.map((style, idx) => {
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
    </Box>
  );
}

export default ClickableMap;
