import HomeModule from "@/modules/home/HomeModule";
import ClientAuthInfoProvider from "@/providers/wrapper/ClientAuthInfoProvider";

// Static on purpose: prerendered at build and served from the CDN. Login
// state is filled in from the browser after the page shows -- see
// ClientAuthInfoProvider for why it is not fetched on the server any more.
export default function Home() {
  return (
    <ClientAuthInfoProvider>
      <HomeModule />
    </ClientAuthInfoProvider>
  );
}
