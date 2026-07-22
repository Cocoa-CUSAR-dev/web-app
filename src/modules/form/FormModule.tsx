import { NavigateNextRounded } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import AnimatedLink from "@/components/utility/AnimatedLink";

const forms = [
  {
    label: "Form Edit",
    description:
      "for viewing current active form fields and edit the fields as needed",
    link: "/form/form-edit",
  },
  {
    label: "Form Viewer",
    description: "for viewing form responses from users by place",
    link: "/form/form-viewer",
  },
] as const;

function FormModule() {
  return (
    <Stack spacing={2}>
      <Typography variant={"h2"}>{"Form"}</Typography>
      <Typography>
        {
          "Currently, there are two activities that can be done regarding form; viewing form and editing form fields. For more information, please contact the development team (within working hours.)"
        }
      </Typography>
      <Typography variant={"body1"}>
        {"Links for activies that can be done regarding form:"}
      </Typography>
      <Stack
        component={List}
        padding={"0 1rem"}
        alignItems={"start"}
        width={"fit-content"}
      >
        <List>
          {forms.map((form, idx) => {
            const { label, description, link } = form;
            return (
              <ListItem
                sx={{
                  padding: "0",
                }}
                key={label + idx}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "1.75rem",
                  }}
                >
                  <NavigateNextRounded />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack
                      direction={"row"}
                      spacing={2}
                      alignItems={"center"}
                      divider={
                        <Typography variant={"subtitle2"}>{"—"}</Typography>
                      }
                    >
                      <AnimatedLink href={link} underline={"none"}>
                        {label}
                      </AnimatedLink>
                      <Typography>{description}</Typography>
                    </Stack>
                  }
                  sx={{
                    padding: "0.25rem 0 0 0",
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Stack>
    </Stack>
  );
}

export default FormModule;
