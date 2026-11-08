import { Button, ListItemButton, ListItemText, Stack } from "@mui/material";

// US2-6/US5-1 (docs-and-plan#134, #230): newest-first list of days the farmer
// has at least one submission on -- the entry point into a single day's diary
// (or raw fallback). Horizontal scrolling row on mobile (a vertical list
// eats too much width next to the diary panel on a narrow screen,
// confirmed live 2026-09-18); a normal vertical list from sm up. Days load a
// page at a time (BE-9); "โหลดเพิ่ม" at the end fetches the next page.
function SubmissionDayList({
  days,
  selectedDate,
  onSelect,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  days: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
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
      {hasMore && (
        <Button
          onClick={onLoadMore}
          disabled={loadingMore}
          sx={{
            flexShrink: 0,
            whiteSpace: "nowrap",
            alignSelf: { sm: "stretch" },
          }}
        >
          {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
        </Button>
      )}
    </Stack>
  );
}

export default SubmissionDayList;
