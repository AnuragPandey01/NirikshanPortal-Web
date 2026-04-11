import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pb";
import { PB_COLLECTIONS } from "@/lib/pbCollections";

const MATCH_TIME_WINDOW_SEC = 0.35;

function parseFaceBbox(b) {
  if (b == null) return null;
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch {
      return null;
    }
  }
  if (!b || typeof b !== "object") return null;
  const x = Number(b.x);
  const y = Number(b.y);
  const w = Number(b.w);
  const h = Number(b.h);
  if ([x, y, w, h].some((n) => Number.isNaN(n))) return null;
  return { x, y, w, h };
}

function computeVideoContainLayout(videoEl, containerW, containerH) {
  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;
  if (!vw || !vh || !containerW || !containerH) return null;
  const scale = Math.min(containerW / vw, containerH / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const ox = (containerW - dw) / 2;
  const oy = (containerH - dh) / 2;
  return { ox, oy, dw, dh, cw: containerW, ch: containerH };
}

function bboxToOverlayPercents(bbox, layout) {
  const b = parseFaceBbox(bbox);
  if (!b || !layout) return null;
  const { ox, oy, dw, dh, cw, ch } = layout;
  return {
    left: ((ox + b.x * dw) / cw) * 100,
    top: ((oy + b.y * dh) / ch) * 100,
    width: ((b.w * dw) / cw) * 100,
    height: ((b.h * dh) / ch) * 100,
  };
}

function pickActiveMatch(matches, currentTime) {
  if (!matches?.length) return null;
  const close = matches.filter(
    (m) =>
      Math.abs((Number(m.timestamp_sec) || 0) - currentTime) <
      MATCH_TIME_WINDOW_SEC
  );
  if (!close.length) return null;
  const sorted = [...close].sort((a, b) => {
    const da = Math.abs((Number(a.timestamp_sec) || 0) - currentTime);
    const db = Math.abs((Number(b.timestamp_sec) || 0) - currentTime);
    if (da !== db) return da - db;
    return (Number(b.similarity_score) || 0) - (Number(a.similarity_score) || 0);
  });
  return sorted[0];
}

function maxMatchTimestamp(matches) {
  if (!matches?.length) return 0;
  return Math.max(...matches.map((m) => Number(m.timestamp_sec) || 0));
}

/**
 * Full-page case analysis results (video, timeline, matches). Used from
 * /member/cases/:caseId/results and /admin/cases/:caseId/results.
 */
export default function CaseResultsView({ dashboardPath = "/member" }) {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseRecord, setCaseRecord] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsVideoDuration, setResultsVideoDuration] = useState(0);
  const [resultsVideoLayout, setResultsVideoLayout] = useState(null);
  const [resultsVideoTime, setResultsVideoTime] = useState(0);
  const [showAllMatchThumbnails, setShowAllMatchThumbnails] = useState(false);

  const videoPlayerRef = useRef(null);
  const resultsVideoWrapRef = useRef(null);

  const syncResultsVideoLayout = useCallback(() => {
    const v = videoPlayerRef.current;
    const wrap = resultsVideoWrapRef.current;
    if (!v || !wrap) return;
    const layout = computeVideoContainLayout(
      v,
      wrap.clientWidth,
      wrap.clientHeight
    );
    setResultsVideoLayout(layout);
  }, []);

  const sortedResultsMatches = useMemo(
    () =>
      [...matches].sort(
        (a, b) =>
          (Number(a.timestamp_sec) || 0) - (Number(b.timestamp_sec) || 0)
      ),
    [matches]
  );

  const timelineDuration = useMemo(() => {
    if (resultsVideoDuration > 0 && Number.isFinite(resultsVideoDuration)) {
      return resultsVideoDuration;
    }
    const m = maxMatchTimestamp(matches);
    return Math.max(m * 1.05, 1);
  }, [resultsVideoDuration, matches]);

  const activeResultsMatch = useMemo(
    () => pickActiveMatch(matches, resultsVideoTime),
    [matches, resultsVideoTime]
  );

  const videoBboxOverlay = useMemo(() => {
    if (!activeResultsMatch?.face_bbox || !resultsVideoLayout) return null;
    return bboxToOverlayPercents(
      activeResultsMatch.face_bbox,
      resultsVideoLayout
    );
  }, [activeResultsMatch, resultsVideoLayout]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!caseId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setCaseRecord(null);
      setMatches([]);
      setResultsVideoDuration(0);
      setResultsVideoLayout(null);
      setResultsVideoTime(0);
      setShowAllMatchThumbnails(false);
      try {
        const cr = await pb.collection(PB_COLLECTIONS.CASES).getOne(caseId, {
          expand: "video,photo",
        });
        if (cancelled) return;
        setCaseRecord(cr);
        try {
          const rows = await pb
            .collection(PB_COLLECTIONS.CASE_MATCH)
            .getFullList({
              filter: `case="${caseId}"`,
              sort: "frame_number",
            });
          if (!cancelled) setMatches(rows);
        } catch (e2) {
          console.error(e2);
          if (!cancelled) {
            toast.error("Could not load saved matches");
            setMatches([]);
          }
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error("Could not load case");
          navigate(dashboardPath, { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [caseId, dashboardPath, navigate]);

  useEffect(() => {
    const wrap = resultsVideoWrapRef.current;
    if (!caseRecord?.id || !wrap || typeof ResizeObserver === "undefined")
      return;
    const ro = new ResizeObserver(() => syncResultsVideoLayout());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [caseRecord?.id, syncResultsVideoLayout]);

  useEffect(() => {
    return () => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
    };
  }, []);

  const seekToPrevMatch = useCallback(() => {
    const v = videoPlayerRef.current;
    if (!v || !sortedResultsMatches.length) return;
    const t = v.currentTime;
    const before = sortedResultsMatches.filter(
      (m) => (Number(m.timestamp_sec) || 0) < t - 0.05
    );
    const prev = before[before.length - 1];
    if (prev) v.currentTime = Number(prev.timestamp_sec) || 0;
  }, [sortedResultsMatches]);

  const seekToNextMatch = useCallback(() => {
    const v = videoPlayerRef.current;
    if (!v || !sortedResultsMatches.length) return;
    const t = v.currentTime;
    const next = sortedResultsMatches.find(
      (m) => (Number(m.timestamp_sec) || 0) > t + 0.05
    );
    if (next) v.currentTime = Number(next.timestamp_sec) || 0;
  }, [sortedResultsMatches]);

  const handleMatchTimelineClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width)
    );
    const v = videoPlayerRef.current;
    if (v && timelineDuration > 0) {
      v.currentTime = pct * timelineDuration;
    }
  };

  if (!caseId) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(dashboardPath)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to cases
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {caseRecord?.name?.trim()
                ? caseRecord.name
                : loading
                  ? "Loading…"
                  : "Analysis results"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Source video, reference photo, and saved frame matches
            </p>
          </div>
        </div>
      </div>

      {loading && !caseRecord ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-3" />
          <p className="text-sm">Loading case…</p>
        </div>
      ) : caseRecord ? (
        <div className="space-y-6">
          <Card className="overflow-hidden p-4 sm:p-6">
            <div
              ref={resultsVideoWrapRef}
              className="relative aspect-video max-h-[min(70vh,720px)] w-full bg-black rounded-md overflow-hidden mx-auto"
            >
              <video
                ref={videoPlayerRef}
                className="absolute inset-0 h-full w-full object-contain"
                controls
                playsInline
                onLoadedMetadata={(e) => {
                  const el = e.target;
                  if (Number.isFinite(el.duration)) {
                    setResultsVideoDuration(el.duration);
                  }
                  requestAnimationFrame(() => syncResultsVideoLayout());
                }}
                onTimeUpdate={(e) => {
                  setResultsVideoTime(e.target.currentTime);
                }}
                onSeeked={(e) => {
                  setResultsVideoTime(e.target.currentTime);
                  syncResultsVideoLayout();
                }}
                onPlay={() =>
                  requestAnimationFrame(() => syncResultsVideoLayout())
                }
              >
                {caseRecord.expand?.video?.video ? (
                  <source
                    src={pb.getFileUrl(
                      caseRecord.expand.video,
                      caseRecord.expand.video.video
                    )}
                    type="video/mp4"
                  />
                ) : null}
                Your browser does not support the video tag.
              </video>
              {videoBboxOverlay ? (
                <div
                  className="pointer-events-none absolute z-10 rounded-sm border-[3px] border-red-500 shadow-md shadow-red-500/40"
                  style={{
                    left: `${videoBboxOverlay.left}%`,
                    top: `${videoBboxOverlay.top}%`,
                    width: `${videoBboxOverlay.width}%`,
                    height: `${videoBboxOverlay.height}%`,
                  }}
                  aria-hidden
                />
              ) : null}
            </div>

            {!loading && matches.length > 0 ? (
              <div className="mt-4 space-y-2">
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Match timeline"
                  className="relative h-8 cursor-pointer rounded-md bg-muted/80"
                  onClick={handleMatchTimelineClick}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight")
                      return;
                    e.preventDefault();
                    const v = videoPlayerRef.current;
                    if (!v || !timelineDuration) return;
                    const delta =
                      (e.key === "ArrowLeft" ? -1 : 1) *
                      Math.max(1, timelineDuration * 0.02);
                    v.currentTime = Math.min(
                      Math.max(0, v.currentTime + delta),
                      timelineDuration
                    );
                  }}
                >
                  <div className="absolute inset-y-2 left-2 right-2 rounded bg-background/60" />
                  {sortedResultsMatches.map((row) => {
                    const ts = Number(row.timestamp_sec) || 0;
                    const leftPct =
                      timelineDuration > 0
                        ? (ts / timelineDuration) * 100
                        : 0;
                    const isActive = activeResultsMatch?.id === row.id;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        title={`${ts}s — frame ${row.frame_number}`}
                        className={`absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-sm transition-colors ${
                          isActive
                            ? "bg-primary w-1.5 z-20"
                            : "bg-chart-2 hover:bg-chart-2/80"
                        }`}
                        style={{
                          left: `${Math.min(100, Math.max(0, leftPct))}%`,
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          const v = videoPlayerRef.current;
                          if (v) v.currentTime = ts;
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seekToPrevMatch}
                    disabled={!sortedResultsMatches.length}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev match
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={seekToNextMatch}
                    disabled={!sortedResultsMatches.length}
                  >
                    Next match
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const v = videoPlayerRef.current;
                      const first = sortedResultsMatches[0];
                      if (v && first) {
                        v.currentTime = Number(first.timestamp_sec) || 0;
                      }
                    }}
                    disabled={!sortedResultsMatches.length}
                  >
                    First match
                  </Button>
                  {activeResultsMatch ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {Number(activeResultsMatch.timestamp_sec).toFixed(2)}s ·
                      frame {activeResultsMatch.frame_number}
                      {typeof activeResultsMatch.similarity_score === "number"
                        ? ` · ${(activeResultsMatch.similarity_score * 100).toFixed(1)}%`
                        : ""}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Scrub or play to highlight a match
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Match filmstrip (click to seek)
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sortedResultsMatches.map((row) => {
                      const ts = Number(row.timestamp_sec) || 0;
                      const isActive = activeResultsMatch?.id === row.id;
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => {
                            const v = videoPlayerRef.current;
                            if (v) v.currentTime = ts;
                          }}
                          className={`shrink-0 w-[4.5rem] rounded-md border bg-card p-1 text-left transition-colors ${
                            isActive
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {row.thumbnail ? (
                            <img
                              src={pb.getFileUrl(row, row.thumbnail)}
                              alt=""
                              className="mb-1 h-11 w-full rounded object-cover"
                            />
                          ) : (
                            <div className="mb-1 flex h-11 w-full items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                              —
                            </div>
                          )}
                          <div className="truncate text-[10px] tabular-nums text-muted-foreground">
                            {ts.toFixed(1)}s
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <h4 className="font-semibold mb-2">Analysis Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Matches:</span>
                  <span className="font-medium">
                    {caseRecord.matches_count ?? matches.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processed Frames:</span>
                  <span className="font-medium">
                    {caseRecord.processed_frames ?? "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <h4 className="font-semibold mb-2">Reference Photo</h4>
              <div className="aspect-square max-h-64 overflow-hidden rounded-lg bg-muted mx-auto sm:mx-0">
                {caseRecord.expand?.photo?.photo ? (
                  <img
                    src={pb.getFileUrl(
                      caseRecord.expand.photo,
                      caseRecord.expand.photo.photo
                    )}
                    alt="Reference"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No reference image
                  </div>
                )}
              </div>
            </div>
          </div>

          {matches.length > 0 ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold">All match thumbnails</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowAllMatchThumbnails(!showAllMatchThumbnails)
                  }
                >
                  {showAllMatchThumbnails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide grid
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show all {matches.length} thumbnails
                    </>
                  )}
                </Button>
              </div>
              {showAllMatchThumbnails ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {matches.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        const v = videoPlayerRef.current;
                        if (v) {
                          v.currentTime = Number(row.timestamp_sec) || 0;
                        }
                      }}
                      className={`rounded-lg border bg-card p-2 text-left transition-colors hover:border-primary/50 ${
                        activeResultsMatch?.id === row.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      {row.thumbnail ? (
                        <img
                          src={pb.getFileUrl(row, row.thumbnail)}
                          alt={`Frame ${row.frame_number}`}
                          className="mb-2 h-24 w-full rounded object-cover"
                        />
                      ) : (
                        <div className="mb-2 flex h-24 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          No thumbnail
                        </div>
                      )}
                      <div className="text-xs">
                        <div className="font-medium">
                          Frame {row.frame_number}
                        </div>
                        <div className="text-muted-foreground">
                          {row.timestamp_sec}s
                        </div>
                        <div className="font-semibold text-primary">
                          {typeof row.similarity_score === "number"
                            ? `${(row.similarity_score * 100).toFixed(1)}% similarity`
                            : "—"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use the timeline and filmstrip above; expand this section if
                  you need the full thumbnail grid.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No saved frame matches for this case yet.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
