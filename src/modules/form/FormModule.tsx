"use client";

import {
  EditNoteRounded,
  FactCheckRounded,
  PostAddRounded,
} from "@mui/icons-material";
import { alpha, Card, CardActionArea, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const forms = [
  {
    label: "Form Create",
    description: "Build a new form from scratch",
    link: "/form/form-create",
    icon: PostAddRounded,
  },
  {
    label: "Form Edit",
    description: "View the active form fields and edit them as needed",
    link: "/form/form-edit",
    icon: EditNoteRounded,
  },
  {
    label: "Form Viewer",
    description: "View form responses from users by place",
    link: "/form/form-viewer",
    icon: FactCheckRounded,
  },
] as const;

function FormModule() {
  const router = useRouter();

  return (
    <Stack spacing={3} padding={{ xs: "1rem", sm: "1rem 2rem" }}>
      <Stack spacing={1}>
        <Typography variant={"h2"}>{"Form"}</Typography>
        <Typography color={"text.secondary"}>
          {
            "Currently, there are three activities that can be done regarding form; creating a new form, viewing form responses, and editing form fields. For more information, please contact the development team (within working hours.)"
          }
        </Typography>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap={"wrap"}>
        {forms.map(({ label, description, link, icon: Icon }) => (
          <Card
            key={label}
            variant={"outlined"}
            sx={{
              width: { xs: "100%", sm: "15rem" },
              borderRadius: 3,
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              "&:hover": {
                borderColor: "primary.light",
                boxShadow: (theme) =>
                  `0 8px 20px -8px ${alpha(theme.palette.primary.main, 0.35)}`,
              },
            }}
          >
            <CardActionArea
              onClick={() => router.push(link)}
              sx={{ height: "100%", padding: "1.5rem" }}
            >
              <Stack spacing={1.5} alignItems={"flex-start"}>
                <Stack
                  width={"2.75rem"}
                  height={"2.75rem"}
                  borderRadius={2}
                  alignItems={"center"}
                  justifyContent={"center"}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: "primary.dark",
                  }}
                >
                  <Icon />
                </Stack>
                <Typography variant={"h6"} fontWeight={600}>
                  {label}
                </Typography>
                <Typography variant={"body2"} color={"text.secondary"}>
                  {description}
                </Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default FormModule;
