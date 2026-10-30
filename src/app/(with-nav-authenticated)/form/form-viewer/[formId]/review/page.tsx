import ResponseReviewModule from "@/modules/form/route-form-viewer/route-review/ResponseReviewModule";

async function ResponseReview({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <ResponseReviewModule formId={formId} />;
}

export default ResponseReview;
