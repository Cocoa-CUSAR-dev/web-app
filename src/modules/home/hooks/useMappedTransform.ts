import { type MotionValue, transform, useTransform } from "framer-motion";

// Function-form on purpose: framer-motion otherwise offloads opacity to a
// native ViewTimeline whose range ignores useScroll's `offset`.
function useMappedTransform<T>(
  value: MotionValue<number>,
  input: number[],
  output: T[],
) {
  return useTransform(value, (v) => transform(v, input, output));
}

export { useMappedTransform };
