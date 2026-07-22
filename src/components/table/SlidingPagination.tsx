import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Stack, styled, Typography } from "@mui/material";

interface PaginationProps {
  minPage: number;
  maxPage: number;
  currentPage: number;
  onChange: (page: number) => void;
}

const PageCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.action.hover,
  color: active
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.action.selected,
  },
}));

export const SlidingPagination = ({
  minPage,
  maxPage,
  currentPage,
  onChange,
}: PaginationProps) => {
  const getPageRange = () => {
    const rangeSize = 5;
    const totalAvailable = maxPage - minPage + 1;

    const actualSize = Math.min(rangeSize, totalAvailable);

    let start = currentPage - 2;

    if (start < minPage) {
      start = minPage;
    }

    if (start + actualSize - 1 > maxPage) {
      start = maxPage - actualSize + 1;
    }

    return Array.from({ length: actualSize }, (_, i) => start + i);
  };

  const pages = getPageRange();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        disabled={currentPage === minPage}
        onClick={() => onChange(currentPage - 1)}
      >
        <ChevronLeft />
      </IconButton>

      {pages.map((page) => (
        <PageCircle
          key={page}
          active={page === currentPage}
          onClick={() => onChange(page)}
        >
          <Typography
            variant="body2"
            fontWeight={page === currentPage ? 700 : 400}
          >
            {page}
          </Typography>
        </PageCircle>
      ))}

      <IconButton
        disabled={currentPage === maxPage}
        onClick={() => onChange(currentPage + 1)}
      >
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};
