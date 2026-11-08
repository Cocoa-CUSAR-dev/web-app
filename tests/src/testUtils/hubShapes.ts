// What the merged backend (the hub) really answers with -- the data itself,
// not wrapped in { value, error } like web-backend did. Taken from the hub's
// own response models (backend-hub: src/analytics/schemas.py, TimeSeriesOut and
// SummaryOut; src/forms: a plain list of forms). Route tests use these so a
// route that forwards the answer untouched is caught: the pages read
// { value, error } and would get an object with no `value`.

const hubTimeSeries = {
  from: "2024-01",
  to: "2024-02",
  title: "Harvest per month",
  metadata: { provinceId: null, districtId: null },
  series: [{ label: "A", values: [10, 20], unit: "kg" }],
};

const hubSummary = {
  from: "2024-01",
  to: "2024-02",
  title: "Harvest total",
  metadata: { provinceId: null, districtId: null },
  data: { label: "Harvest", value: 30, unit: "kg" },
};

// A list is just a list: [] or [{...}], never { value: [...] }.
const hubList = [{ id: "1" }, { id: "2" }];

export { hubList, hubSummary, hubTimeSeries };
