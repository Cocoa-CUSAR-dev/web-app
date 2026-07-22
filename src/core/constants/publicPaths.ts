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
    path: "/api",
    type: "PREFIX",
  },
] as const;

export { publicPaths };
