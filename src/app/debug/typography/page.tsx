import { Divider, Stack, Typography, TypographyVariant } from "@mui/material";

function DebugTypography() {
  const paragraphText =
    "In hac habitasse platea dictumst. Quisque quis dolor sed nisi finibus rhoncus. Sed et velit laoreet, dictum tortor eu, congue risus. Vivamus elementum sagittis sollicitudin. Aliquam at erat congue, maximus turpis id, mattis diam. Aliquam laoreet sapien nec ex pretium convallis. Nulla nec aliquet quam, quis pharetra odio. Aliquam gravida vulputate lectus, in tincidunt tellus malesuada a. Nunc dignissim sem sed mauris rhoncus, id luctus risus accumsan. Nam eget nunc at dui dapibus tempus. Phasellus rutrum mattis malesuada.";

  const thaiText =
    "คอนแทครวมมิตรไตรมาสเอ๊าะโฟล์ค เจ๊าะแจ๊ะสตรอว์เบอร์รีผู้นำฟอร์ม ดิกชันนารีเบลอ เด้อโลโก้สต๊อกมาร์ก สหัชญาณฮีโร่ ติ่มซำอพาร์ทเมนต์แมชชีน อิเหนาโอเพ่นซัพพลายคาร์โก้ ซูฮกไฮเทคสเตเดียมพันธกิจมาร์ก อพาร์ทเมนต์ สแตนเลสทีวี โฟมเมเปิล รองรับบรรพชนเซอร์วิสคอร์รัปชัน แซลมอนมินต์บูมออร์แกนิก คอนเทนเนอร์ น็อครีสอร์ทมินท์คอนโดมิเนียม ล็อบบี้แมนชั่น";

  const typoTypes: TypographyVariant[] = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "body1",
    "body2",
    "button",
    "caption",
    "subtitle1",
    "subtitle2",
    "overline",
  ];
  return (
    <Stack padding={"3rem"} divider={<Divider flexItem />}>
      {typoTypes.map((type, idx) => (
        <Stack key={idx}>
          <Typography variant={type}>
            {type + " " + type.toUpperCase()}
          </Typography>
          <Typography variant={type}>{paragraphText}</Typography>
          <Typography variant={type}>{thaiText}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default DebugTypography;
