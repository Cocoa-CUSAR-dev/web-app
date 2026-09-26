import { Box, Stack, Typography } from "@mui/material";

// US2-6 (docs-and-plan#134): renders the stored diary text -- plain prose,
// already generated and persisted by web-backend (see DiaryService), no
// LLM call happens on this path.
function DiaryCard({ diaryText }: { diaryText: string }) {
  return (
    <Stack spacing={1}>
      <Typography variant={"h4"}>{"Diary"}</Typography>
      <Box
        padding={"1rem"}
        sx={{
          borderRadius: "0.5rem",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#606060",
        }}
      >
        <Typography whiteSpace={"pre-line"}>{diaryText}</Typography>
      </Box>
    </Stack>
  );
}

export default DiaryCard;
