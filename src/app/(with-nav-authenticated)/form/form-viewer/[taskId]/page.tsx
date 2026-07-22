import FormViewerIdModule from "@/modules/form/route-form-viewer/route-id/FormViewerIdModule";

async function FormViewerId({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <FormViewerIdModule taskId={taskId} />;
}

export default FormViewerId;
