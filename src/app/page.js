"use client";
import { useEffect, useRef, useState } from "react";
import Picture from "../components/gallery/Picture";
import ImageEditor from "../components/editor/ImageEditor";
import VideoWorkspace from "../components/video/VideoWorkspace";
import { download } from "../lib/downloads";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import {
  Home,
  Images,
  Video,
  WandSparkles,
  FolderOpen,
  Headphones,
  Sun,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Plus,
  Heart,
  Download,
  Maximize2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  Trash2,
  Check,
  Upload,
  RotateCw,
  FlipHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  ImagePlus,
  Layers,
  Settings2,
  Share2,
  Expand,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from "lucide-react";
import FomiLogo from "../components/branding/FomiLogo";
import NavigationIcon from "../components/icons/NavigationIcon";
import {
  Button,
  IconButton,
  Select,
  Accordion,
  Modal,
  EmptyState,
  Slider,
  Skeleton,
} from "../components/ui";
import assets from "../data/assets.json";
import { readStorage, writeStorage } from "../lib/storage";
const originals = assets.filter((a) => a.portrait);
const portraits = [
  originals[2],
  originals[5],
  originals[4],
  originals[6],
  originals[0],
  originals[1],
  originals[3],
  {
    ...originals[6],
    id: "sample-reused-portrait",
    title: originals[6].title + " (reused demo)",
  },
];
const historyAssets = [3, 0, 7, 4, 2, 5, 12, 6, 16, 11, 15, 20, 14, 10].map(
  (i) => assets[i],
);
const models = [
  "Default",
  "Realistic",
  "Cinematic",
  "Anime",
  "Illustration",
  "HD",
];
const styles = [
  "Photorealistic",
  "Cinematic",
  "Editorial",
  "Anime",
  "Illustration",
  "Product",
  "Fantasy",
  "Minimal",
];
const styleIds = [1, 15, 6, 5, 2, 12, 8, 11];
const starterPrompt =
  "A professional portrait photograph of a smiling 31-year-old redheaded woman with warm brown eyes and softly tousled auburn hair framing her face. She is turned slightly towards the viewer, offering a genuine and approachable expression. She is wearing a cream-colored cashmere sweater and delicate gold earrings. The background is a softly blurred expanse of muted gray and beige tones, suggesting a modern art gallery. There is subtle directional lighting.";
export default function Workspace() {
  const [view, setView] = useState("Home"),
    [prompt, setPrompt] = useState(""),
    [count, setCount] = useState(4),
    [ratio, setRatio] = useState("1:1"),
    [model, setModel] = useState("Default"),
    [style, setStyle] = useState("Photorealistic"),
    [advanced, setAdvanced] = useState({
      negative: "",
      seed: "",
      guidance: 7,
      quality: "Standard",
      format: "PNG",
      creativity: 50,
    }),
    [gallery, setGallery] = useState(portraits),
    [history, setHistory] = useState([]),
    [favorites, setFavorites] = useState([]),
    [projects, setProjects] = useState([]),
    [project, setProject] = useState(null),
    [preview, setPreview] = useState(null),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [dark, setDark] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All images"),
    [side, setSide] = useState(true),
    [ready, setReady] = useState(false),
    [activeHistory, setActiveHistory] = useState(null),
    [projectName, setProjectName] = useState(""),
    [editingProject, setEditingProject] = useState(null);
  const historyRef = useRef();
  useEffect(() => {
    setFavorites(readStorage("fomi-favorites", []));
    const saved = readStorage("fomi-history", []);
    setHistory(saved);
    if (saved[0]) {
      setGallery(saved[0].images);
      setActiveHistory(saved[0].id);
    }
    setProjects(readStorage("fomi-projects", []));
    setDark(readStorage("fomi-dark", false));
    const config = readStorage("fomi-settings", {});
    if (config.prompt !== undefined) setPrompt(config.prompt);
    if (config.count) setCount(config.count);
    if (config.ratio) setRatio(config.ratio);
    if (config.model) setModel(config.model);
    if (config.style) setStyle(config.style);
    if (config.advanced) setAdvanced(config.advanced);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      const ok = [
        writeStorage("fomi-favorites", favorites),
        writeStorage("fomi-history", history),
        writeStorage("fomi-projects", projects),
        writeStorage("fomi-dark", dark),
      ].every(Boolean);
      if (!ok)
        setToast(
          "Browser storage is full or unavailable. Changes remain in this session.",
        );
    }
  }, [favorites, history, projects, dark, ready]);
  useEffect(() => {
    if (ready)
      writeStorage("fomi-settings", {
        prompt,
        count,
        ratio,
        model,
        style,
        advanced,
      });
  }, [ready, prompt, count, ratio, model, style, advanced]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function favorite(a) {
    setFavorites((v) =>
      v.includes(a.id) ? v.filter((id) => id !== a.id) : [...v, a.id],
    );
  }
  async function generate() {
    if (!prompt.trim()) {
      setToast("Write a prompt to get started");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, count, ratio, model, style, advanced }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setGallery(data.images);
      setHistory((v) => [data, ...v].slice(0, 40));
      setActiveHistory(data.id);
      setToast("Demo ready — curated local images, no AI inference");
      if (project)
        setProjects((v) =>
          v.map((p) =>
            p.id === project
              ? { ...p, images: [...data.images, ...p.images] }
              : p,
          ),
        );
    } catch (e) {
      setToast(e.message || "Generation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function openHistory(h) {
    setGallery(h.images);
    setPrompt(h.settings.prompt);
    setCount(h.settings.count);
    setRatio(h.settings.ratio);
    setModel(h.settings.model);
    setStyle(h.settings.style);
    setAdvanced(h.settings.advanced);
    setActiveHistory(h.id);
    setView("Home");
  }
  const allImages = [
    ...gallery,
    ...history.flatMap((h) => h.images),
    ...assets,
  ].filter((a, i, list) => list.findIndex((b) => b.id === a.id) === i);
  let shown = (
    view === "Gallery"
      ? allImages
      : project
        ? projects.find((p) => p.id === project)?.images || []
        : gallery
  ).filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "Favorites" || favorites.includes(a.id)),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`app-shell ${view === "Home" && !project ? "reference-home" : ""}`}
        data-ready={ready}
      >
        <header className="topbar">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("Home");
              setProject(null);
            }}
          >
            <FomiLogo />
          </a>
          <div
            className="navigation-progress"
            role="progressbar"
            aria-label="Demo credits remaining"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={15}
          >
            <span />
          </div>
          <nav aria-label="Main navigation">
            {[
              ["Home", Home],
              ["Gallery", Images],
              ["Video", Video],
              ["Edit", WandSparkles],
              ["Projects", FolderOpen],
            ].map(([name, Icon]) => (
              <button
                key={name}
                aria-label={name}
                title={name}
                className={view === name ? "nav-item active" : "nav-item"}
                onClick={() => {
                  setView(name);
                  setProject(null);
                }}
              >
                <NavigationIcon name={name} size={19} />
                <span>{name}</span>
              </button>
            ))}
          </nav>
          <div className="utilities">
            <IconButton label="Open gallery" onClick={() => setView("Gallery")}>
              <Images size={19} />
              <span>Gallery</span>
            </IconButton>
            <IconButton
              label="Help and support"
              onClick={() => setModal("help")}
            >
              <Headphones size={19} />
              <span>Support</span>
            </IconButton>
            <div className="theme-toggle">
              <button
                aria-label={dark ? "Light theme" : "Dark theme"}
                onClick={() => setDark((v) => !v)}
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
            <button
              className="profile"
              onClick={() => setModal("profile")}
              aria-label="Open profile"
            >
              <span className="avatar-image">
                <Picture asset={portraits[0]} />
              </span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <section className="history-section" aria-label="Generation history">
          <div className="history-label">
            <strong>History</strong>
            <button
              onClick={() => {
                setView("Gallery");
                setFilter("All images");
              }}
            >
              View all
            </button>
          </div>
          <div className="history-track" ref={historyRef}>
            {(history.length
              ? history
              : historyAssets.map((a, i) => ({
                  id: "demo-" + i,
                  images: [a],
                  demo: true,
                }))
            ).map((h, i) => (
              <button
                key={h.id}
                className={`history-thumb ${activeHistory === h.id ? "selected" : ""}`}
                title={
                  h.demo
                    ? "Sample asset — " + h.images[0].title
                    : h.settings.prompt
                }
                onClick={() =>
                  h.demo ? setPreview(h.images[0]) : openHistory(h)
                }
              >
                <Picture asset={h.images[0]} />
                <span>{h.demo ? "SAMPLE" : `${h.images.length} images`}</span>
              </button>
            ))}
          </div>
          <div className="history-arrows">
            <IconButton
              label="Previous history"
              onClick={() =>
                historyRef.current.scrollBy({ left: -400, behavior: "smooth" })
              }
            >
              <ChevronLeft size={17} />
            </IconButton>
            <IconButton
              label="Next history"
              onClick={() =>
                historyRef.current.scrollBy({ left: 400, behavior: "smooth" })
              }
            >
              <ChevronRight size={17} />
            </IconButton>
          </div>
        </section>
        <div className={`workspace ${side ? "" : "sidebar-hidden"}`}>
          <aside className="sidebar">
            <div className="compact-sidebar-heading">
              <span className="sr-only">Creation controls</span>
            </div>
            <div className="side-heading">
              <span>Creation studio</span>
              <IconButton
                label="Collapse sidebar"
                onClick={() => setSide(false)}
              >
                <PanelLeftClose size={16} />
              </IconButton>
            </div>
            <div className="segmented">
              <button
                className={view !== "Video" ? "selected" : ""}
                onClick={() => setView("Home")}
              >
                <Images size={16} />
                Image
              </button>
              <button
                className={view === "Video" ? "selected" : ""}
                onClick={() => setView("Video")}
              >
                <Video size={16} />
                Video
              </button>
            </div>
            <label className="prompt-label" htmlFor="prompt">
              Your imagination starts here <Sparkles size={14} />
            </label>
            <div className="prompt-box">
              <textarea
                id="prompt"
                maxLength={4000}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your imaginations to be converted to piece of art …"
              />
              <div>
                <span>{prompt.length} / 4000</span>
                <IconButton
                  label="Use sample prompt"
                  onClick={() => setPrompt(starterPrompt)}
                >
                  <WandSparkles size={15} />
                </IconButton>
              </div>
            </div>
            <Button
              className="generate"
              disabled={busy}
              onClick={
                view === "Video"
                  ? () =>
                      setToast("Use the video workspace to prepare your demo")
                  : generate
              }
            >
              <Sparkles size={17} />
              {busy ? "Preparing your images…" : "Generate"}
              <span>
                {count * 2}
                <Sparkles size={11} />
              </span>
            </Button>
            <p className="demo-note">Demo mode · uses curated local images</p>
            <div className="compact-controls">
              <Select
                label="Number of images"
                value={count}
                onChange={(e) => setCount(+e.target.value)}
              >
                {[1, 2, 4, 8].map((n) => (
                  <option value={n} key={n}>
                    {n} image{n > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
              <Select
                label="Aspect ratio"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              >
                {["1:1", "3:4", "4:3", "9:16", "16:9"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
              <button
                className="compact-model"
                onClick={() => setModal("models")}
              >
                Model: {model === "Default" ? "Name" : model}
                <ChevronDown size={11} />
              </button>
            </div>
            <div className="control-section">
              <label className="control-label">
                Number of images <Layers size={15} />
              </label>
              <div className="count-options">
                {[1, 2, 4, 8].map((n) => (
                  <button
                    key={n}
                    className={count === n ? "selected" : ""}
                    onClick={() => setCount(n)}
                    aria-pressed={count === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <label className="control-label">
                Aspect ratio <span>{ratio}</span>
              </label>
              <div className="ratio-options">
                {["1:1", "3:4", "4:3", "9:16", "16:9"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={ratio === r ? "selected" : ""}
                    aria-pressed={ratio === r}
                  >
                    <span
                      style={{
                        aspectRatio: r.replace(":", "/"),
                        width: r === "9:16" ? 11 : 18,
                      }}
                    />
                    {r}
                  </button>
                ))}
              </div>
              <button
                className="model-button"
                onClick={() => setModal("models")}
              >
                <span className="model-thumb">
                  <Picture asset={assets[5]} />
                </span>
                <span>
                  <small>Model</small>
                  <strong>{model}</strong>
                </span>
                <ChevronDown size={16} />
              </button>
            </div>
            <Accordion
              title={
                <>
                  <Settings2 size={16} />
                  <span className="advance-label">
                    <span className="desktop-advance">Advance</span>
                    <span className="mobile-advance">Advanced settings</span>
                  </span>
                </>
              }
            >
              <p className="muted">
                Simulated settings, included in the API request.
              </p>
              <label className="field">
                Negative prompt
                <input
                  value={advanced.negative}
                  onChange={(e) =>
                    setAdvanced({ ...advanced, negative: e.target.value })
                  }
                  placeholder="What to leave out"
                />
              </label>
              <label className="field">
                Seed
                <input
                  type="number"
                  value={advanced.seed}
                  onChange={(e) =>
                    setAdvanced({ ...advanced, seed: e.target.value })
                  }
                  placeholder="Random"
                />
              </label>
              <Slider
                label={`Guidance · ${advanced.guidance}`}
                min="1"
                max="20"
                value={advanced.guidance}
                onChange={(e) =>
                  setAdvanced({ ...advanced, guidance: +e.target.value })
                }
              />
              <Slider
                label={`Creativity · ${advanced.creativity}%`}
                value={advanced.creativity}
                onChange={(e) =>
                  setAdvanced({ ...advanced, creativity: +e.target.value })
                }
              />
              <Select
                label="Quality"
                value={advanced.quality}
                onChange={(e) =>
                  setAdvanced({ ...advanced, quality: e.target.value })
                }
              >
                {["Standard", "High"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
              <Select
                label="Requested format (demo files are PNG)"
                value={advanced.format}
                onChange={(e) =>
                  setAdvanced({ ...advanced, format: e.target.value })
                }
              >
                {["PNG", "JPEG", "WebP"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Accordion>
            <Accordion
              title={
                <>
                  <WandSparkles size={16} />
                  Styles <span className="tiny-badge">8</span>
                </>
              }
            >
              <div className="style-grid">
                {styles.map((s, i) => (
                  <button
                    key={s}
                    className={
                      style === s ? "style-card selected" : "style-card"
                    }
                    onClick={() => setStyle(s)}
                    aria-pressed={style === s}
                  >
                    <span>
                      <Picture asset={assets[styleIds[i]]} />
                      {style === s && (
                        <i>
                          <Check size={11} />
                        </i>
                      )}
                    </span>
                    <small>{s}</small>
                  </button>
                ))}
              </div>
              <p className="demo-note">
                Style previews use supplied sample images.
              </p>
            </Accordion>
            <div className="side-footer">
              <span className="status-dot" />
              All systems ready <span>Local workspace</span>
            </div>
          </aside>
          <main>
            {!side && (
              <IconButton
                label="Open creation controls"
                onClick={() => setSide(true)}
              >
                <PanelLeftOpen size={19} />
              </IconButton>
            )}
            {view === "Edit" ? (
              <ImageEditor notify={setToast} />
            ) : view === "Video" ? (
              <VideoWorkspace
                prompt={prompt}
                setPrompt={setPrompt}
                notify={setToast}
              />
            ) : view === "Projects" && !project ? (
              <section className="projects">
                <div className="content-heading">
                  <div>
                    <span className="eyebrow">MAKE ROOM FOR YOUR IDEAS</span>
                    <h1>
                      Your projects<span>.</span>
                    </h1>
                    <p>A little organization. A lot of possibility.</p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingProject(null);
                      setProjectName("");
                      setModal("project");
                    }}
                  >
                    <Plus size={16} />
                    New project
                  </Button>
                </div>
                {!projects.length ? (
                  <EmptyState
                    icon={FolderOpen}
                    title="A fresh canvas for your next idea"
                  >
                    Create a project to collect your demo generations.
                  </EmptyState>
                ) : (
                  <div className="project-grid">
                    {projects.map((p) => (
                      <article key={p.id}>
                        <button
                          className="project-cover"
                          onClick={() => {
                            setProject(p.id);
                            setView("Home");
                          }}
                        >
                          {p.images.length ? (
                            <Picture asset={p.images[0]} />
                          ) : (
                            <FolderOpen size={42} strokeWidth={1} />
                          )}
                        </button>
                        <h3>{p.name}</h3>
                        <p>{p.images.length} images · saved on this device</p>
                        <div>
                          <Button
                            secondary
                            onClick={() => {
                              setProject(p.id);
                              setView("Home");
                            }}
                          >
                            Open
                          </Button>
                          <IconButton
                            label={"Rename " + p.name}
                            onClick={() => {
                              setEditingProject(p.id);
                              setProjectName(p.name);
                              setModal("project");
                            }}
                          >
                            <WandSparkles size={16} />
                          </IconButton>
                          <IconButton
                            label={"Delete " + p.name}
                            onClick={() => {
                              setEditingProject(p.id);
                              setModal("delete-project");
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                <div className="content-heading">
                  <div>
                    <span className="eyebrow">
                      A SPACE FOR YOUR IMAGINATION
                    </span>
                    <h1>
                      {project
                        ? projects.find((p) => p.id === project)?.name
                        : view === "Gallery"
                          ? "Your creative collection"
                          : "Let’s create something"}
                      <span>
                        {project || view === "Gallery"
                          ? "."
                          : " extraordinary."}
                      </span>
                    </h1>
                    <p>
                      {view === "Gallery"
                        ? "Every idea, every experiment. All in one place."
                        : "Turn a little spark into your next big idea."}
                    </p>
                  </div>
                  <div className="workspace-badge">
                    <span className="status-dot" />
                    Personal workspace
                    <ChevronDown size={13} />
                  </div>
                </div>
                <div className="gallery-toolbar">
                  <div className="gallery-tabs">
                    {["All images", "Favorites"].map((f) => (
                      <button
                        className={filter === f ? "active" : ""}
                        onClick={() => setFilter(f)}
                        key={f}
                      >
                        {f === "Favorites" && <Heart size={14} />}
                        {f}
                        <span>
                          {f === "Favorites" ? favorites.length : shown.length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="toolbar-right">
                    <label className="search">
                      <Search size={15} />
                      <input
                        aria-label="Search images"
                        placeholder="Search creations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <IconButton
                      label="Gallery display options"
                      onClick={() => setModal("display")}
                    >
                      <SlidersHorizontal size={17} />
                    </IconButton>
                  </div>
                </div>
                <div className="generation-meta">
                  <span>
                    <span className="status-dot" />
                    {activeHistory
                      ? "Your latest demo"
                      : "A study in warm light"}
                  </span>
                  <span>
                    {model}
                    <i /> {style}
                    <i />
                    {ratio}
                    <span className="sample-tag">SAMPLE COLLECTION</span>
                  </span>
                </div>
                <div className="gallery-grid">
                  {busy
                    ? Array.from({ length: count }, (_, i) => (
                        <Skeleton key={i} />
                      ))
                    : shown.map((a, i) => (
                        <motion.article
                          layout
                          initial={false}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: Math.min(i * 0.025, 0.15),
                          }}
                          key={a.id}
                          className="image-card"
                          style={{
                            "--image-column": (i % 4) + 2,
                            "--image-row": Math.floor(i / 4) + 1,
                            aspectRatio: activeHistory
                              ? ratio.replace(":", "/")
                              : "3 / 4",
                          }}
                        >
                          <button
                            className="image-open"
                            aria-label={"Preview " + a.title}
                            onClick={() => setPreview(a)}
                          >
                            <Picture asset={a} priority={i < 4} />
                          </button>
                          <div className="card-top">
                            <span>{a.style || "Realistic"}</span>
                            <IconButton
                              label={
                                favorites.includes(a.id)
                                  ? "Remove favorite"
                                  : "Add favorite"
                              }
                              onClick={() => favorite(a)}
                            >
                              <Heart
                                size={16}
                                fill={
                                  favorites.includes(a.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </IconButton>
                          </div>
                          <div className="card-bottom">
                            <span>{a.title}</span>
                            <div>
                              <IconButton
                                label="Expand image"
                                onClick={() => setPreview(a)}
                              >
                                <Maximize2 size={16} />
                              </IconButton>
                              <IconButton
                                label="Download image"
                                onClick={() => download(a, setToast)}
                              >
                                <Download size={16} />
                              </IconButton>
                              <IconButton
                                label="More image actions"
                                onClick={() => {
                                  setPreview(a);
                                  setModal("actions");
                                }}
                              >
                                <MoreHorizontal size={18} />
                              </IconButton>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                  {!busy && filter === "All images" && !search && (
                    <article className="prompt-info">
                      <span className="eyebrow">
                        <Sparkles size={14} /> THE IDEA BEHIND THE IMAGE
                      </span>
                      <h2>
                        It all starts with
                        <br />a little imagination.
                      </h2>
                      <p>{prompt || starterPrompt}</p>
                      <div className="prompt-tags">
                        <span>{model}</span>
                        <span>{style}</span>
                        <span>{ratio}</span>
                      </div>
                      <button
                        title="Use this prompt"
                        onClick={() => {
                          setPrompt(starterPrompt);
                          setToast("Prompt loaded in creation controls");
                          setSide(true);
                        }}
                      >
                        <span className="expanded-prompt-label">
                          Use this prompt
                        </span>
                        <span className="compact-prompt-label">Model</span>
                        <ArrowUpRight size={16} />
                      </button>
                      <small>Curated sample images · local demo</small>
                    </article>
                  )}
                </div>
                {!shown.length && !busy && (
                  <EmptyState icon={Images} title="Room for something new">
                    Try another search, add a favorite, or create your first
                    demo.
                  </EmptyState>
                )}
                <footer className="gallery-footer">
                  <span>Made for the things you haven’t imagined yet.</span>
                  <FomiLogo />
                  <span>Frontend demo · stored on your device</span>
                </footer>
              </>
            )}
          </main>
        </div>
        {preview && (
          <Modal
            title={preview.title}
            wide
            onClose={() => {
              setPreview(null);
              setModal(null);
            }}
          >
            <div className="preview-image">
              <Picture asset={preview} style={{ objectFit: "contain" }} />
            </div>
            <div className="preview-footer">
              <span>Supplied sample asset · {preview.model || model}</span>
              <IconButton
                label="Previous image"
                onClick={() =>
                  setPreview(
                    allImages[
                      (allImages.findIndex((a) => a.id === preview.id) -
                        1 +
                        allImages.length) %
                        allImages.length
                    ],
                  )
                }
              >
                <ChevronLeft size={18} />
              </IconButton>
              <IconButton
                label="Next image"
                onClick={() =>
                  setPreview(
                    allImages[
                      (allImages.findIndex((a) => a.id === preview.id) + 1) %
                        allImages.length
                    ],
                  )
                }
              >
                <ChevronRight size={18} />
              </IconButton>
              <IconButton
                label="Favorite preview"
                onClick={() => favorite(preview)}
              >
                <Heart
                  size={18}
                  fill={
                    favorites.includes(preview.id) ? "currentColor" : "none"
                  }
                />
              </IconButton>
              <Button onClick={() => download(preview, setToast)}>
                <Download size={16} />
                Download
              </Button>
            </div>
            <div className="preview-actions">
              <Button
                secondary
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      preview.prompt || prompt,
                    );
                    setToast("Prompt copied");
                  } catch {
                    setToast("Clipboard unavailable");
                  }
                }}
              >
                <Copy size={15} />
                Copy prompt
              </Button>
              <Button
                secondary
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      location.origin + preview.src,
                    );
                    setToast("Local asset link copied");
                  } catch {
                    setToast("Clipboard unavailable");
                  }
                }}
              >
                <Share2 size={15} />
                Copy local link
              </Button>
              <Button
                secondary
                onClick={() => {
                  setGallery((v) => v.filter((a) => a.id !== preview.id));
                  setHistory((v) =>
                    v
                      .map((h) => ({
                        ...h,
                        images: h.images.filter((a) => a.id !== preview.id),
                      }))
                      .filter((h) => h.images.length),
                  );
                  setProjects((v) =>
                    v.map((p) => ({
                      ...p,
                      images: p.images.filter((a) => a.id !== preview.id),
                    })),
                  );
                  setPreview(null);
                  setToast(
                    "Removed from your current collections; original asset retained",
                  );
                }}
              >
                <Trash2 size={15} />
                Remove from collection
              </Button>
            </div>
          </Modal>
        )}
        {modal && !preview && (
          <Modal
            title={
              {
                models: "Choose your model",
                help: "A little help for your creative flow",
                profile: "Your personal workspace",
                project: editingProject ? "Rename project" : "New project",
                "delete-project": "Delete project?",
                display: "Gallery display",
              }[modal] || "Workspace"
            }
            onClose={() => setModal(null)}
          >
            {modal === "models" ? (
              <>
                <p className="muted">
                  Model choices are simulated. Thumbnail previews use supplied
                  imagery.
                </p>
                <div className="model-grid">
                  {models.map((m, i) => (
                    <button
                      aria-label={m}
                      className={model === m ? "selected" : ""}
                      key={m}
                      onClick={() => {
                        setModel(m);
                        setModal(null);
                      }}
                    >
                      <span>
                        <Picture asset={assets[[1, 9, 15, 5, 2, 6][i]]} />
                      </span>
                      <strong>{m}</strong>
                      {model === m && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </>
            ) : modal === "project" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!projectName.trim()) return;
                  setProjects((v) =>
                    editingProject
                      ? v.map((p) =>
                          p.id === editingProject
                            ? { ...p, name: projectName.trim() }
                            : p,
                        )
                      : [
                          ...v,
                          {
                            id: crypto.randomUUID(),
                            name: projectName.trim(),
                            images: [],
                          },
                        ],
                  );
                  setModal(null);
                  setToast("Project saved");
                }}
              >
                <label className="field">
                  Project name
                  <input
                    autoFocus
                    required
                    maxLength={80}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </label>
                <Button type="submit">Save project</Button>
              </form>
            ) : modal === "delete-project" ? (
              <>
                <p>
                  This removes the project and its collection from this device.
                </p>
                <Button
                  onClick={() => {
                    setProjects((v) =>
                      v.filter((p) => p.id !== editingProject),
                    );
                    setModal(null);
                    setToast("Project deleted");
                  }}
                >
                  Delete project
                </Button>
              </>
            ) : modal === "display" ? (
              <>
                <p>
                  Images use a four-column desktop grid and adapt automatically
                  to smaller screens.
                </p>
                <Select
                  label="Show"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All images</option>
                  <option>Favorites</option>
                </Select>
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("All images");
                    setModal(null);
                  }}
                >
                  Reset filters
                </Button>
              </>
            ) : modal === "profile" ? (
              <>
                <div className="profile-large">JD</div>
                <Button secondary onClick={() => setDark((v) => !v)}>
                  {dark ? <Sun size={16} /> : <Moon size={16} />}Switch to{" "}
                  {dark ? "light" : "dark"} theme
                </Button>
                <h3>Jamie, your ideas live here.</h3>
                <p>
                  This demo uses local browser storage. No account, cloud sync,
                  or real credits are connected.
                </p>
                <Button
                  secondary
                  onClick={() => {
                    setModal(null);
                    setView("Projects");
                  }}
                >
                  View your projects <ArrowUpRight size={16} />
                </Button>
              </>
            ) : (
              <>
                <p>
                  Write a prompt, choose your settings, and select Generate to
                  explore supplied sample images. Generation and model settings
                  are simulated.
                </p>
                <p>
                  Use Gallery to search and favorite, Projects to organize, and
                  Edit to transform and export an image. Everything stays on
                  this device.
                </p>
                <Button onClick={() => setModal(null)}>
                  Got it <Check size={16} />
                </Button>
              </>
            )}
          </Modal>
        )}
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              className="toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Check size={17} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
