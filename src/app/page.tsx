import HomeModule from "@/modules/home/HomeModule";
import OptionalAuthWrapper from "@/providers/wrapper/OptionalAuthWrapper";

export default function Home() {
  return (
    <OptionalAuthWrapper>
      <HomeModule />
    </OptionalAuthWrapper>
  );
}
