import { type MotionValue, transform, useTransform } from "framer-motion";

// Function-form on purpose: framer-motion otherwise offloads opacity to a
// native ViewTimeline whose range ignores useScroll's `offset`.
function useMappedTransform<T>(
  value: MotionValue<number>,
  input: number[],
  output: T[],
  ease?: (t: number) => number,
) {
  return useTransform(value, (v) =>
    transform(v, input, output, ease ? { ease } : undefined),
  );
}

export { useMappedTransform };
