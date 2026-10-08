const publicPaths: {
  path: string;
  type: "PREFIX" | "EXACT";
}[] = [
  {
    path: "/_next",
    type: "PREFIX",
  },
  {
    path: "/.well-known/appspecific/com.chrome.devtools.json",
    type: "EXACT",
  },
  {
    path: "/map/",
    type: "PREFIX",
  },
  {
    path: "/images/",
    type: "PREFIX",
  },
  {
    path: "/logos/",
    type: "PREFIX",
  },
  {
    path: "/",
    type: "EXACT",
  },
  {
    path: "/auth",
    type: "EXACT",
  },
  {
    path: "/sso",
    type: "EXACT",
  },
  {
    // F2 (#125): the /sso page (client) POSTs the fragment token here to
    // exchange it for the session cookie, before the user is authenticated.
    path: "/sso/exchange",
    type: "EXACT",
  },
  {
    path: "/api",
    type: "PREFIX",
  },
] as const;

export { publicPaths };
