import { FormEditRow } from "@/modules/form/route-form-edit/formEditTypes";

const formEditRowsStub: FormEditRow[] = [
  {
    Form: "ผลผลิตรายเดือน",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "ตัวอักษร",
    Status: true,
    Required: true,
    Choices: null,
  },
  {
    Form: "ผลผลิตรายเดือน",
    Description: "รายละเอียดและจำนวนของผลผลิตรายเดือน นับทั้งหมดในศูนย์",
    Field: "ตัวอักษร",
    Status: false,
    Required: false,
    Choices: null,
  },
  {
    Form: "ผลผลิตรายเดือน",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "ตัวเลขจำนวนเต็ม",
    Status: true,
    Required: false,
    Choices: null,
  },
  {
    Form: "ผลผลิตรายเดือน",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "วันที่และเวลา",
    Status: true,
    Required: false,
    Choices: null,
  },
  {
    Form: "ค่าอาหารพนักงานในฟาร์ม",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "ตัวอักษร",
    Status: true,
    Required: false,
    Choices: null,
  },
  {
    Form: "ผลผลิตรายเดือน",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "ตัวอักษร",
    Status: true,
    Required: false,
    Choices: null,
  },
  {
    Form: "ผลผลิตรายเดือน",
    Description:
      "รายละเอียดและจำนวนของผลผลิตรายเดือน นับเฉพาะจำนวนที่เห็นในกระสอบ",
    Field: "ตัวอักษร",
    Status: true,
    Required: false,
    Choices: null,
  },
] as const;

export { formEditRowsStub };
