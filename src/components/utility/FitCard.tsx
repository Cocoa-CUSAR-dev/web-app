import { Paper } from "@mui/material";

function FitCard({
  padding = "2rem",
  children,
  flex,
}: {
  padding?: string;
  children: React.ReactNode;
  flex?: number;
}) {
  return (
    <Paper
      elevation={2}
      sx={{
        padding: padding,
        flex: flex ? flex : 0,
      }}
    >
      {children}
    </Paper>
  );
}

export default FitCard;
