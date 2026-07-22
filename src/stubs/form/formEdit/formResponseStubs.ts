import {
  GetFormIdResponse,
  GetFormsResponse,
} from "@/modules/form/route-form-edit/formEditTypes";

const allFormsStub: GetFormsResponse = {
  value: [
    {
      formId: "55555555-bbbb-bbbb-0001-555555555555",
      taskId: "44444444-aaaa-aaaa-0001-444444444444",
      title: "แบบฟอร์มข้อมูลฟาร์ม",
      content: "กรุณากรอกข้อมูลฟาร์มของท่าน",
      handler: "FARM_SURVEY",
      isMultipleSubmit: false,
      description: "แบบฟอร์มสำหรับเก็บข้อมูลฟาร์ม",
      createdAt: "2026-03-27T03:55:15.462838",
    },
  ],
  error: null,
};

const formIdStub: GetFormIdResponse = {
  value: {
    formId: "55555555-bbbb-bbbb-0001-555555555555",
    title: "แบบฟอร์มข้อมูลฟาร์ม",
    description: "แบบฟอร์มสำหรับเก็บข้อมูลฟาร์ม",
    sections: [
      {
        sectionId: "66666666-cccc-cccc-0001-666666666666",
        title: "ข้อมูลทั่วไป",
        description: "ส่วนข้อมูลทั่วไปของฟาร์ม",
        sortOrder: 1,
        isActive: true,
        questions: [
          {
            questionId: "77777777-dddd-dddd-0001-777777777777",
            sectionId: "66666666-cccc-cccc-0001-666666666666",
            label: "ชื่อฟาร์ม",
            description: "กรุณาระบุชื่อฟาร์ม",
            inputType: "VARCHAR",
            fieldName: "",
            isMandatory: true,
            isDefault: true,
            isActive: true,
            sortOrder: 1,
            choices: null,
          },
          {
            questionId: "77777777-dddd-dddd-0002-777777777777",
            sectionId: "66666666-cccc-cccc-0001-666666666666",
            label: "พื้นที่รวม (ไร่)",
            description: "กรุณาระบุพื้นที่รวมของฟาร์ม",
            inputType: "FLOAT",
            fieldName: "",
            isMandatory: true,
            isDefault: false,
            isActive: true,
            sortOrder: 2,
            choices: null,
          },
        ],
      },
      {
        sectionId: "66666666-cccc-cccc-0002-666666666666",
        title: "ข้อมูลการผลิต",
        description: "ส่วนข้อมูลการผลิตโกโก้",
        sortOrder: 2,
        isActive: true,
        questions: [
          {
            questionId: "77777777-dddd-dddd-0003-777777777777",
            sectionId: "66666666-cccc-cccc-0002-666666666666",
            label: "ผลผลิตต่อปี (กก.)",
            description: null,
            inputType: "FLOAT",
            fieldName: "",
            isMandatory: true,
            isDefault: false,
            isActive: true,
            sortOrder: 1,
            choices: null,
          },
          {
            questionId: "77777777-dddd-dddd-0004-777777777777",
            sectionId: "66666666-cccc-cccc-0002-666666666666",
            label: "สายพันธุ์หลัก",
            description: "กรุณาเลือกสายพันธุ์โกโก้หลัก",
            inputType: "OPTION",
            fieldName: "",
            isMandatory: false,
            isDefault: false,
            isActive: true,
            sortOrder: 2,
            choices: null,
          },
          {
            questionId: "88888888-dddd-dddd-0004-777777777777",
            sectionId: "66666666-cccc-cccc-0002-666666666666",
            label: "สายพันธุ์หลัก",
            description: "กรุณาเลือกสายพันธุ์โกโก้หลัก",
            inputType: "OPTION",
            fieldName: "",
            isMandatory: false,
            isDefault: false,
            isActive: true,
            sortOrder: 2,
            choices: ["Aloha", "Alaho", "ไก่มีสามขา เขาว่าก๊ายไก่"],
          },
        ],
      },
    ],
  },
  error: null,
};

export { allFormsStub, formIdStub };
