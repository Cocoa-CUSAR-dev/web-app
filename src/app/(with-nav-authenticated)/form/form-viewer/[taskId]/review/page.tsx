import ResponseReviewModule from "@/modules/form/route-form-viewer/route-review/ResponseReviewModule";

async function ResponseReview({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <ResponseReviewModule taskId={taskId} />;
}

export default ResponseReview;
