import FormViewerIdModule from "@/modules/form/route-form-viewer/route-id/FormViewerIdModule";

async function FormViewerId({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <FormViewerIdModule formId={formId} />;
}

export default FormViewerId;
