import { Box, Stack } from "@mui/material";

import ClickableMap from "@/components/map/ClickableMap";
import SimpleMap from "@/components/map/SimpleMap";
import UtilityMap from "@/components/map/UtilityMap";

function DebugMap() {
  return (
    <Stack padding={"3rem"} spacing={2}>
      <Stack spacing={2} direction={"row"}>
        <Box width={"20rem"} height={"28rem"}>
          <SimpleMap />
        </Box>
        <Box width={"20rem"} height={"28rem"}>
          <ClickableMap />
        </Box>
      </Stack>
      <Stack spacing={2} direction={"row"}>
        <Box width={"20rem"} height={"28rem"}>
          <ClickableMap geoJsonPath={"/maps/provinces.geojson"} />
        </Box>
        <Box width={"20rem"} height={"28rem"}>
          <UtilityMap geoJsonPath={"/maps/provinces.geojson"} />
        </Box>
      </Stack>
    </Stack>
  );
}

export default DebugMap;
