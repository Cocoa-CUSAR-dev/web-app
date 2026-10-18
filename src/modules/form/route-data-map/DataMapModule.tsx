"use client";

import {
  alpha,
  Box,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchResponse } from "@/libs/fetchResponse";

import {
  HandlerCatalog,
  HandlerCatalogResponse,
} from "../formDefinition/handlerCatalogTypes";
import { GetFormsResponse } from "../route-form-edit/formEditTypes";
import HandlerDetailDrawer from "./components/HandlerDetailDrawer";
import {
  buildColumns,
  buildEdges,
  dataMapColumns,
  DataMapNode,
  frequencyLabels,
} from "./dataMapLayout";

// "fk": a foreign key between cards; "parent": a child handler hanging off
// its parent (fertilizer under garden activity), drawn only when focused.
type Line = { from: string; to: string; d: string; kind: "fk" | "parent" };

function DataMapModule() {
  const { roles, isAuthenticated } = useAuthInfo();
  const router = useRouter();
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (isAuthenticated && !roles) {
      router.push("/");
    }
  }, [isAuthenticated, roles, router]);

  const [catalog, setCatalog] = useState<HandlerCatalog | null>(null);
  const [failed, setFailed] = useState<boolean>(false);
  const [forms, setForms] = useState<GetFormsResponse["value"]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchResponse("/api/v1/forms/handlers/catalog", {
          method: "GET",
        });
        const { value }: HandlerCatalogResponse = await response.json();
        setCatalog(value);
      } catch (e) {
        console.error(e);
        setFailed(true);
      }
    })();
    (async () => {
      try {
        const response = await fetchResponse("/api/v1/forms", {
          method: "GET",
        });
        const { value }: GetFormsResponse = await response.json();
        setForms(value);
      } catch (e) {
        // The map still works without the form list; only the drawer's
        // "forms using this handler" stays empty.
        console.error(e);
      }
    })();
  }, []);

  const columns = useMemo(
    () => (catalog ? buildColumns(catalog) : null),
    [catalog],
  );
  const edges = useMemo(() => (catalog ? buildEdges(catalog) : []), [catalog]);

  // #region connector lines
  // Cards are laid out by CSS grid; the SVG lines are measured from where
  // the cards actually landed, and redrawn whenever the grid resizes.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [lines, setLines] = useState<Line[]>([]);

  const setCardRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) cardRefs.current.set(id, element);
      else cardRefs.current.delete(id);
    },
    [],
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !isWide) {
      setLines([]);
      return;
    }
    const origin = container.getBoundingClientRect();
    const next: Line[] = [];
    edges.forEach(({ from, to }) => {
      const a = cardRefs.current.get(from)?.getBoundingClientRect();
      const b = cardRefs.current.get(to)?.getBoundingClientRect();
      // Only left -> right: same-column links are listed in the detail
      // panel instead of drawn over the cards.
      if (!a || !b || a.right > b.left) return;
      const x1 = a.right - origin.left;
      const y1 = a.top + a.height / 2 - origin.top;
      const x2 = b.left - origin.left;
      const y2 = b.top + b.height / 2 - origin.top;
      const bend = (x2 - x1) / 2;
      next.push({
        from,
        to,
        kind: "fk",
        d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
      });
    });
    // Parent -> child: an elbow down the left edge into the indented child.
    catalog?.handlers.forEach(({ handler, parentHandler }) => {
      if (!parentHandler) return;
      const a = cardRefs.current.get(parentHandler)?.getBoundingClientRect();
      const b = cardRefs.current.get(handler)?.getBoundingClientRect();
      if (!a || !b || b.left <= a.left) return;
      const x = a.left + 10 - origin.left;
      const y = b.top + b.height / 2 - origin.top;
      next.push({
        from: parentHandler,
        to: handler,
        kind: "parent",
        d: `M ${x} ${a.bottom - origin.top} V ${y} H ${b.left - origin.left}`,
      });
    });
    setLines(next);
  }, [catalog, edges, isWide]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure, columns]);

  const focus = hovered ?? selected;
  // A child record (fertilizer) belongs to its parent record (a garden
  // activity), so it inherits the parent's farm and plot: focusing a child
  // lights up the whole chain up to the top-level handler.
  const chain = useMemo(() => {
    if (focus === null || !catalog) return null;
    const ids = [focus];
    let current = catalog.handlers.find((h) => h.handler === focus);
    while (current?.parentHandler && !ids.includes(current.parentHandler)) {
      ids.push(current.parentHandler);
      const parent: string = current.parentHandler;
      current = catalog.handlers.find((h) => h.handler === parent);
    }
    return new Set(ids);
  }, [catalog, focus]);
  const isActive = (line: Line) =>
    chain !== null &&
    (line.kind === "fk"
      ? chain.has(line.from) || chain.has(line.to)
      : chain.has(line.to) || line.from === focus);
  // The chain, everything its arrows reach and the focused card's children
  // stay; every other card fades.
  const related = useMemo(() => {
    if (chain === null || !catalog) return null;
    const ids = new Set(chain);
    edges.forEach(({ from, to }) => {
      if (chain.has(from)) ids.add(to);
      if (chain.has(to)) ids.add(from);
    });
    catalog.handlers.forEach((h) => {
      if (h.parentHandler === focus) ids.add(h.handler);
    });
    return ids;
  }, [catalog, chain, edges, focus]);

  // A card in the left half gets the panel on the right, and vice versa.
  const selectedColumn = columns
    ? dataMapColumns.findIndex(({ key }) =>
        columns[key].some((node) => node.id === selected),
      )
    : -1;
  const drawerSide =
    selectedColumn >= Math.ceil(dataMapColumns.length / 2) ? "left" : "right";

  const selectedEntry =
    catalog?.handlers.find((h) => h.handler === selected) ?? null;

  if (failed) {
    return (
      <Typography color={"error"}>
        {"โหลดแผนผังข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}
      </Typography>
    );
  }

  if (!catalog || !columns) {
    return (
      <Stack
        width={"100%"}
        height={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2} padding={{ xs: "1rem 0", sm: "1rem 2rem" }}>
      <Stack spacing={0.5}>
        <Typography variant={"h2"}>{"แผนผังข้อมูล"}</Typography>
        <Typography color={"text.secondary"}>
          {
            "ข้อมูลแต่ละประเภทถูกเก็บลงตารางไหน ใช้ฟอร์มกี่ฟอร์ม และเชื่อมกันอย่างไร กดการ์ดเพื่อดูฟิลด์ทั้งหมด"
          }
        </Typography>
        <Stack
          direction={"row"}
          spacing={2}
          useFlexGap
          flexWrap={"wrap"}
          color={"text.secondary"}
        >
          <Legend color={theme.palette.success.main} text={"มีฟอร์มใช้งาน"} />
          <Legend color={theme.palette.grey[400]} text={"ยังไม่มีฟอร์ม"} />
        </Stack>
      </Stack>

      <Box
        ref={containerRef}
        position={"relative"}
        display={"grid"}
        gridTemplateColumns={{
          xs: "minmax(0, 1fr)",
          md: `repeat(${dataMapColumns.length}, minmax(0, 1fr))`,
        }}
        columnGap={"2.5rem"}
        rowGap={2}
      >
        {/* Every link, faint, behind the cards. */}
        {isWide && (
          <Box
            component={"svg"}
            position={"absolute"}
            zIndex={0}
            sx={{ inset: 0, pointerEvents: "none", overflow: "visible" }}
            width={"100%"}
            height={"100%"}
            aria-hidden
          >
            {lines.map((line) => (
              <path
                key={`${line.from}->${line.to}`}
                d={line.d}
                fill={"none"}
                stroke={theme.palette.divider}
                strokeWidth={1}
                opacity={focus !== null ? 0.3 : 1}
              />
            ))}
          </Box>
        )}
        {/* The focused card's links, drawn over the cards so they're never
            hidden behind one. */}
        {isWide && focus !== null && (
          <Box
            component={"svg"}
            position={"absolute"}
            zIndex={2}
            sx={{ inset: 0, pointerEvents: "none", overflow: "visible" }}
            width={"100%"}
            height={"100%"}
            aria-hidden
          >
            {lines.filter(isActive).map((line) => (
              <path
                key={`${line.from}->${line.to}`}
                d={line.d}
                fill={"none"}
                stroke={theme.palette.primary.main}
                strokeWidth={2.5}
                strokeLinecap={"round"}
              />
            ))}
          </Box>
        )}

        {dataMapColumns.map((column) => (
          <Stack
            key={column.key}
            spacing={1.5}
            position={"relative"}
            zIndex={1}
          >
            <Typography variant={"subtitle2"} color={"text.secondary"}>
              {column.title}
            </Typography>
            {columns[column.key].map((node) => (
              <DataMapCard
                key={node.id}
                node={node}
                cardRef={setCardRef(node.id)}
                isFocused={focus === node.id}
                isDimmed={related !== null && !related.has(node.id)}
                onHover={setHovered}
                onSelect={setSelected}
              />
            ))}
          </Stack>
        ))}
      </Box>

      {catalog.dependencies.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant={"subtitle2"}>
            {"ฟิลด์ที่ขึ้นกับฟิลด์อื่น (ตัวเลือกถูกกรองตามคำตอบก่อนหน้า)"}
          </Typography>
          {catalog.dependencies.map((dependency) => (
            <Typography
              key={`${dependency.childField}-${dependency.parentField}`}
              variant={"body2"}
              color={"text.secondary"}
            >
              {`${catalog.fieldLabels[dependency.childField] ?? dependency.childField} (${dependency.childField}) ← ${catalog.fieldLabels[dependency.parentField] ?? dependency.parentField} (${dependency.parentField}): ${dependency.labelTh}`}
            </Typography>
          ))}
        </Stack>
      )}

      <HandlerDetailDrawer
        catalog={catalog}
        entry={selectedEntry}
        forms={forms.filter((form) => form.handler === selected)}
        side={drawerSide}
        onClose={() => setSelected(null)}
      />
    </Stack>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <Stack direction={"row"} spacing={0.75} alignItems={"center"}>
      <Box width={10} height={10} borderRadius={"50%"} bgcolor={color} />
      <Typography variant={"body2"}>{text}</Typography>
    </Stack>
  );
}

function DataMapCard({
  node,
  cardRef,
  isFocused,
  isDimmed,
  onHover,
  onSelect,
}: {
  node: DataMapNode;
  cardRef: (element: HTMLElement | null) => void;
  isFocused: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  if (node.kind === "registration") {
    return (
      <Card
        ref={cardRef}
        variant={"outlined"}
        sx={{
          padding: "0.75rem",
          bgcolor: "action.hover",
          color: "text.secondary",
          borderColor: isFocused ? "primary.main" : undefined,
          ...fade(isDimmed),
        }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
      >
        <Typography fontWeight={600}>{node.table.labelTh}</Typography>
        <Typography variant={"caption"} display={"block"}>
          {"ลงทะเบียนผ่านแอป"}
        </Typography>
      </Card>
    );
  }

  const { entry } = node;
  const hasForms = entry.forms.count > 0;
  return (
    <Box
      paddingLeft={node.depth === 1 ? "1.5rem" : 0}
      position={"relative"}
      sx={fade(isDimmed)}
    >
      <Card
        ref={cardRef}
        variant={"outlined"}
        sx={{
          borderColor: isFocused ? "primary.main" : undefined,
          boxShadow: (theme) =>
            isFocused
              ? `0 6px 16px -8px ${alpha(theme.palette.primary.main, 0.5)}`
              : "none",
        }}
        onMouseEnter={() => onHover(entry.handler)}
        onMouseLeave={() => onHover(null)}
      >
        <CardActionArea
          onClick={() => onSelect(entry.handler)}
          sx={{ padding: "0.75rem" }}
        >
          <Stack spacing={0.75}>
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Box
                width={10}
                height={10}
                flexShrink={0}
                borderRadius={"50%"}
                bgcolor={hasForms ? "success.main" : "grey.400"}
                aria-label={hasForms ? "มีฟอร์มใช้งาน" : "ยังไม่มีฟอร์ม"}
              />
              <Typography fontWeight={600} lineHeight={1.3}>
                {entry.labelTh}
              </Typography>
            </Stack>
            <Typography
              variant={"caption"}
              color={"text.secondary"}
              sx={{ wordBreak: "break-all" }}
            >
              {entry.handler}
            </Typography>
            <Stack direction={"row"} spacing={0.5} useFlexGap flexWrap={"wrap"}>
              <Chip size={"small"} label={frequencyLabels[entry.frequency]} />
              <Chip
                size={"small"}
                variant={"outlined"}
                label={`${entry.forms.count} ฟอร์ม`}
              />
              <Chip
                size={"small"}
                variant={"outlined"}
                label={`${entry.responseCount} คำตอบ`}
              />
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>
    </Box>
  );
}

// Cards not linked to the hovered/selected one step back.
function fade(isDimmed: boolean) {
  return {
    opacity: isDimmed ? 0.3 : 1,
    transition: "opacity 0.15s ease",
  };
}

export default DataMapModule;
