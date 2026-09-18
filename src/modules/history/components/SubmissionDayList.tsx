import { ListItemButton, ListItemText, Stack } from "@mui/material";

// US2-6/US5-1 (docs-and-plan#134): newest-first list of days the farmer has
// at least one submission on -- the entry point into a single day's diary
// (or raw fallback). Horizontal scrolling row on mobile (a vertical list
// eats too much width next to the diary panel on a narrow screen,
// confirmed live 2026-09-18); a normal vertical list from sm up.
function SubmissionDayList({
  days,
  selectedDate,
  onSelect,
}: {
  days: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  return (
    <Stack
      direction={{ xs: "row", sm: "column" }}
      spacing={0.5}
      sx={{
        minWidth: { sm: "10rem" },
        overflowX: { xs: "auto", sm: "visible" },
        flexShrink: 0,
      }}
    >
      {days.map((date) => (
        <ListItemButton
          key={date}
          selected={date === selectedDate}
          onClick={() => onSelect(date)}
          sx={{
            borderRadius: "0.5rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <ListItemText primary={date} />
        </ListItemButton>
      ))}
    </Stack>
  );
}

export default SubmissionDayList;
