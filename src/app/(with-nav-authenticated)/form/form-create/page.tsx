import { Stack } from "@mui/material";
import { Suspense } from "react";

import FormCreateModule from "@/modules/form/route-form-create/FormCreateModule";

function FormCreate() {
  return (
    <Suspense fallback={<Stack width={"100%"} height={"100%"} />}>
      <FormCreateModule />
    </Suspense>
  );
}

export default FormCreate;
