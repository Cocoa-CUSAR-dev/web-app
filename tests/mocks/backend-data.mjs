// In-memory fixture data + mutation helpers for the E2E mock backend.
// Shapes mirror the real Kotlin backend's `/api/v1/**` contract as consumed
// by the Next.js BFF routes under `src/app/api/v1/**`.

export const TOKEN_NAME = process.env.TOKEN_NAME || "token";
export const TOKEN_VALUE = "e2e-mock-session-token";

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
  return {
    value: {
      from: from || null,
      to: to || null,
      title,
      metadataa: {
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
    },
    error: null,
  };
}

export function buildSummary(kind, mode, from, to) {
  return {
    value: {
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
    },
    error: null,
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
