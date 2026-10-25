// In-memory fixture data + mutation helpers for the E2E mock backend.
// Shapes mirror the merged backend's `/api/v1/**` contract (the After sheet of
// api-migration-map.xlsx) as consumed by the Next.js BFF routes under
// `src/app/api/v1/**`.

export const TOKEN_NAME = process.env.TOKEN_NAME || "token";
// The access token the mock hands out and accepts as `Authorization: Bearer`.
export const TOKEN_VALUE = "e2e-mock-session-token";
export const REFRESH_TOKEN_VALUE = "e2e-mock-refresh-token";
// A second session, for specs that need a farmer rather than a researcher
// (the history page is farmer-only). Handed out by the SSO exchange for any
// token starting with "farmer-".
export const FARMER_TOKEN_VALUE = "e2e-mock-farmer-session-token";

// What every login-like endpoint answers with: tokens in the body, no cookie.
export function tokenPairFor(user, accessToken) {
  return {
    access_token: accessToken,
    refresh_token: REFRESH_TOKEN_VALUE,
    token_type: "bearer",
    expires_in: 3600,
    user: {
      user_id: user.userId,
      username: user.email,
      roles: user.roles,
      must_reset_password: false,
    },
  };
}

// What GET /api/v1/me answers: the account, its roles, one profile per role.
export function meFor(user) {
  const profile = {
    first_name: user.firstName,
    last_name: user.lastName,
    organization: user.organization,
  };
  return {
    user_id: user.userId,
    username: user.email,
    roles: user.roles,
    must_reset_password: false,
    profiles: {
      researcher: user.roles.includes("researcher") ? profile : null,
      farmer: user.roles.includes("farmer") ? profile : null,
      hub_collector: null,
      processor: null,
    },
  };
}

export const authUser = {
  userId: "u-1",
  email: "admin",
  firstName: "Admin",
  lastName: "Researcher",
  organization: "CUSAR",
  isPasswordReset: true,
  isRequiresPasswordReset: false,
  roles: ["admin", "researcher"],
};

const harvestTitles = {
  delta: "Harvest Weight per Month",
  sum: "Running Total Harvest Weight per Month",
  average: "Average Harvest Weight per Month",
  frequency: "Number of Harvests per Month",
};

const userTitles = {
  delta: "New User per Month",
  sum: "Running Total User per Month",
};

function monthsBetween(from, to) {
  const parse = (s) => {
    if (!s) return null;
    const [y, m] = s.split("-").map(Number);
    if (!y || !m) return null;
    return y * 12 + (m - 1);
  };
  const f = parse(from);
  const t = parse(to);
  if (f == null || t == null) return 12;
  return Math.max(1, t - f + 1);
}

export function buildTimeSeries(kind, mode, from, to) {
  const titleMap = kind === "harvest" ? harvestTitles : userTitles;
  const title = titleMap[mode] || `${kind} ${mode}`;
  const length = monthsBetween(from, to);
  const values = Array.from({ length }, (_, i) => (i + 1) * 10);
  // The data itself, like the merged backend (the hub) sends it. The web app's
  // own API routes wrap it in { value, error } for the pages.
  return {
    from: from || null,
    to: to || null,
    title,
    metadata: {
      provinceId: null,
      districtId: null,
      subdistrictId: null,
      farmId: null,
    },
    series: [
      {
        label: kind === "harvest" ? "Weight (kg)" : "Users",
        values,
        unit: kind === "harvest" ? "kg" : null,
      },
    ],
  };
}

export function buildSummary(kind, mode, from, to) {
  return {
    from: from || null,
    to: to || null,
    title: `${kind} ${mode} summary`,
    metadata: {
      provinceId: null,
      districtId: null,
      subdistrictId: null,
      farmId: null,
    },
    data: {
      label: kind,
      value: 0,
      unit: kind === "harvest" ? "kg" : "count",
    },
  };
}

// ---- Forms & tasks fixture (mutable so PUT edits persist across reload) ----

let formsState = null;

function initialForms() {
  return [
    {
      formId: "form-1",
      taskId: "task-1",
      title: "จดกิจกรรมในสวน",
      description: "บันทึกกิจกรรมประจำวันในสวนโกโก้",
      content: "จดกิจกรรมในสวน",
      handler: "garden-activity",
      isMultipleSubmit: true,
      createdAt: new Date("2026-01-01").toISOString(),
      sections: [
        {
          sectionId: "section-1",
          title: "processing_record",
          description: "บันทึกการแปรรูป",
          sortOrder: 0,
          isActive: true,
          questions: [
            {
              questionId: "q-1",
              sectionId: "section-1",
              label: "น้ำหนักผลผลิต",
              fieldName: "harvest_weight",
              description: "น้ำหนักผลผลิตที่เก็บเกี่ยวได้ (กก.)",
              inputType: "FLOAT",
              isMandatory: true,
              isDefault: false,
              isActive: true,
              sortOrder: 0,
              choices: null,
            },
            {
              questionId: "q-2",
              sectionId: "section-1",
              label: "วันที่เก็บเกี่ยว",
              fieldName: "harvest_date",
              description: "วันที่ทำการเก็บเกี่ยวผลผลิต",
              inputType: "VARCHAR",
              isMandatory: true,
              isDefault: false,
              isActive: true,
              sortOrder: 1,
              choices: null,
            },
            {
              questionId: "q-3",
              sectionId: "section-1",
              label: "หมายเหตุ",
              fieldName: "note",
              description: "บันทึกเพิ่มเติมอื่น ๆ",
              inputType: "VARCHAR",
              isMandatory: false,
              isDefault: false,
              isActive: true,
              sortOrder: 2,
              choices: null,
            },
          ],
        },
        {
          sectionId: "section-2",
          title: "variety_record",
          description: "บันทึกสายพันธุ์",
          sortOrder: 1,
          isActive: true,
          questions: [
            {
              questionId: "q-4",
              sectionId: "section-2",
              label: "สายพันธุ์หลัก",
              fieldName: "main_variety",
              description:
                "This field records the main cacao variety planted in the farm.",
              inputType: "OPTION",
              isMandatory: true,
              isDefault: false,
              isActive: true,
              sortOrder: 0,
              choices: [
                { id: "chumphon-1-id", name: "ชุมพร 1" },
                { id: "ivory-coast-id", name: "ไอโวรี่โคสท์" },
                { id: "hybrid-native-id", name: "ลูกผสมพื้นเมือง" },
              ],
            },
            {
              questionId: "q-5",
              sectionId: "section-2",
              label: "พื้นที่ปลูก",
              fieldName: "planting_area",
              description: "พื้นที่ปลูกโกโก้ (ไร่)",
              inputType: "FLOAT",
              isMandatory: false,
              isDefault: false,
              isActive: true,
              sortOrder: 1,
              choices: null,
            },
          ],
        },
      ],
    },
  ];
}

function getForms() {
  if (!formsState) formsState = initialForms();
  return formsState;
}

export function getFormList() {
  return getForms().map(
    ({
      formId,
      title,
      description,
      taskId,
      content,
      handler,
      isMultipleSubmit,
      createdAt,
    }) => ({
      formId,
      title,
      description,
      taskId,
      content,
      handler,
      isMultipleSubmit,
      createdAt,
    }),
  );
}

export function getFormById(formId) {
  const form = getForms().find((f) => f.formId === formId);
  if (!form) return null;
  const { formId: id, title, description, sections } = form;
  return { formId: id, title, description, sections };
}

export function applyFormEdit(formId, sections) {
  const form = getForms().find((f) => f.formId === formId);
  if (!form || !Array.isArray(sections)) return;
  for (const s of sections) {
    const section = form.sections.find((x) => x.sectionId === s.sectionId);
    if (!section) continue;
    if (typeof s.isActive === "boolean") section.isActive = s.isActive;
    for (const q of s.questions || []) {
      const question = section.questions.find(
        (x) => x.questionId === q.questionId,
      );
      if (!question) continue;
      if (typeof q.isActive === "boolean") question.isActive = q.isActive;
      if (typeof q.isMandatory === "boolean")
        question.isMandatory = q.isMandatory;
    }
  }
}

export function getTasks() {
  return getForms().map((f) => ({
    taskId: f.taskId,
    title: f.title,
    description: f.description,
    taskType: "FORM",
    openAt: new Date("2026-01-01").toISOString(),
    closeAt: new Date("2027-01-01").toISOString(),
  }));
}

export function getTaskById(taskId) {
  return getTasks().find((t) => t.taskId === taskId) || null;
}

// ---- Review & correct (US2-8, docs-and-plan#174) ----
// Field-by-field submissions for task-1, mutable so a correction persists
// across reloads the way web-backend's PATCH .../fields/{fieldName} does.
// resetReview() puts it back for the next spec.

let reviewState = null;

function initialReview() {
  return [
    {
      responseId: "resp-1",
      submitter: "สมชาย ใจดี",
      submittedAt: "2026-10-01T03:30:00",
      fields: [
        // Pulled out of the farmer's free-text message by the LLM.
        {
          fieldName: "harvest_weight",
          label: "น้ำหนักผลผลิต",
          inputType: "FLOAT",
          value: "120",
          source: "llm_extracted",
          editable: true,
        },
        {
          fieldName: "tree_count",
          label: "จำนวนต้น",
          inputType: "INT",
          value: "40",
          source: "guided_flow",
          editable: true,
        },
        {
          fieldName: "plot_photo",
          label: "รูปแปลง",
          inputType: "IMAGE",
          value: "photo-1.jpg",
          source: null,
          editable: false,
        },
      ],
    },
    {
      responseId: "resp-2",
      submitter: "สมหญิง รักสวน",
      submittedAt: "2026-10-02T04:00:00",
      fields: [
        {
          fieldName: "harvest_weight",
          label: "น้ำหนักผลผลิต",
          inputType: "FLOAT",
          value: "95.5",
          source: "guided_flow",
          editable: true,
        },
        {
          fieldName: "tree_count",
          label: "จำนวนต้น",
          inputType: "INT",
          value: "32",
          source: "guided_flow",
          editable: true,
        },
      ],
    },
  ];
}

function review() {
  if (!reviewState) reviewState = initialReview();
  return reviewState;
}

export const reviewCorrections = [];

export function resetReview() {
  reviewState = initialReview();
  reviewCorrections.length = 0;
}

// Tasks whose submissions the logged-in researcher may not review.
export const FORBIDDEN_REVIEW_TASK = "task-forbidden";

export function getReview(taskId, { aiOnly, page, size }) {
  if (taskId !== "task-1") return [];
  const submissions = aiOnly
    ? review().filter((s) => s.fields.some((f) => f.source === "llm_extracted"))
    : review();
  return submissions.slice(page * size, page * size + size);
}

// The backend, not the screen, has the last word on a value: its type
// (web-backend's AnswerCoercion) and the question's own rules
// (form.field_validation_rule). harvest_weight has a minimum of 0 -- a rule
// the review screen doesn't know about, so only the backend can refuse it.
const MIN_VALUE = { harvest_weight: 0 };

function valueError(fieldName, inputType, value) {
  const type = inputType.toUpperCase();
  if (type === "INT" && !/^-?\d+$/.test(value))
    return "Value must be a whole number";
  if (type === "FLOAT" && Number.isNaN(Number(value)))
    return "Value must be a number";
  const min = MIN_VALUE[fieldName];
  if (min !== undefined && Number(value) < min)
    return `Value must be at least ${min}`;
  return null;
}

export function applyCorrection(
  taskId,
  responseId,
  fieldName,
  { value, reason },
) {
  const submission = review().find((s) => s.responseId === responseId);
  const field = submission?.fields.find((f) => f.fieldName === fieldName);
  if (taskId !== "task-1" || !field)
    return { status: 404, error: "field not found" };
  if (!field.editable)
    return { status: 400, error: "This field type can't be corrected" };
  const error = valueError(fieldName, field.inputType, value);
  if (error) return { status: 400, error };
  reviewCorrections.push({
    responseId,
    fieldName,
    from: field.value,
    to: value,
    reason: reason ?? null,
  });
  field.value = value;
  return { status: 200, field };
}

// ---- Farmer & submission history (docs-and-plan#231) ----

export const farmerUser = {
  userId: "f-1",
  email: "farmer@example.com",
  firstName: "สมชาย",
  lastName: "ใจดี",
  organization: null,
  isPasswordReset: true,
  isRequiresPasswordReset: false,
  roles: ["farmer"],
};

// 55 days with submissions, newest first, ending 2026-10-20 -- more than one
// page of 50, so "load more" has something to load. Every third day has a
// generated diary; the others fall back to the raw answers.
export const HISTORY_DAYS = Array.from({ length: 55 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 20 - i));
  return d.toISOString().slice(0, 10);
});

export function getHistoryDays(page, size) {
  return HISTORY_DAYS.slice(page * size, page * size + size);
}

export function getDiary(date) {
  const i = HISTORY_DAYS.indexOf(date);
  if (i < 0 || i % 3 !== 0) return null;
  return {
    userId: farmerUser.userId,
    entryDate: date,
    diaryText: `วันที่ ${date} ใส่ปุ๋ยคอก 12.5 กิโลกรัม`,
    updatedAt: `${date}T10:00:00`,
  };
}

export function getHistoryAnswers(date) {
  const i = HISTORY_DAYS.indexOf(date);
  if (i < 0) return [];
  // Enough rows on the first raw day to page the answers table (10 a page).
  const count = i === 1 ? 12 : 2;
  return Array.from({ length: count }, (_, n) => ({
    fieldName: `field_${n + 1}`,
    label: `คำถามที่ ${n + 1}`,
    inputType: "VARCHAR",
    rawValue: `คำตอบ ${n + 1} ของ ${date}`,
  }));
}