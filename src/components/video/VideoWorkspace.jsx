"use client";
import { useEffect, useRef, useState } from "react";
import {
  Film,
  Play,
  Pause,
  VolumeX,
  Volume2,
  Expand,
  Download,
  ImagePlus,
  Sparkles,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import { Button, IconButton, Select, EmptyState } from "../ui";
import { readStorage, writeStorage } from "../../lib/storage";

export default function VideoWorkspace({ prompt, setPrompt, notify }) {
  const [duration, setDuration] = useState("5"),
    [ratio, setRatio] = useState("16:9"),
    [reference, setReference] = useState(null);
  const [busy, setBusy] = useState(false),
    [sample, setSample] = useState(false),
    [video, setVideo] = useState(null);
  const [playing, setPlaying] = useState(false),
    [muted, setMuted] = useState(true),
    [history, setHistory] = useState([]);
  const player = useRef(),
    urls = useRef([]),
    request = useRef();
  useEffect(() => {
    setHistory(readStorage("fomi-video-history", []));
    return () => {
      urls.current.forEach(URL.revokeObjectURL);
      request.current?.abort();
    };
  }, []);
  function upload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith(type + "/"))
      return notify("Unsupported file type");
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    if (type === "video") {
      setVideo(url);
      setSample(false);
      setPlaying(false);
    } else setReference(url);
  }
  async function generate() {
    if (!prompt.trim()) return notify("Enter a video prompt");
    setBusy(true);
    request.current = new AbortController();
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.current.signal,
        body: JSON.stringify({
          prompt,
          duration: Number(duration),
          ratio,
          hasReference: Boolean(reference),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "Unable to prepare the sample");
      const entry = {
        id: data.id,
        prompt: data.settings.prompt,
        duration,
        ratio,
        createdAt: data.createdAt,
        video: data.video,
        simulated: true,
      };
      setHistory((previous) => {
        const next = [entry, ...previous].slice(0, 20);
        if (!writeStorage("fomi-video-history", next))
          notify("Video history could not be saved on this device");
        return next;
      });
      setVideo(data.video.src);
      setSample(true);
      setPlaying(false);
      notify("Local motion sample loaded. No AI video was generated.");
    } catch (error) {
      if (error.name !== "AbortError")
        notify(error.message || "Unable to prepare the video sample");
    } finally {
      setBusy(false);
    }
  }
  function openHistory(entry) {
    setPrompt(entry.prompt);
    setDuration(String(entry.duration));
    setRatio(entry.ratio);
    if (entry.video) {
      setVideo(entry.video.src);
      setSample(true);
      setPlaying(false);
    } else
      notify(
        "This older entry is a concept only. Prepare a sample to preview motion.",
      );
  }
  return (
    <section>
      <div className="content-heading">
        <div>
          <span className="eyebrow">GIVE YOUR IDEAS A LITTLE MOTION</span>
          <h1>
            Imagine the next frame<span>.</span>
          </h1>
          <p>Explore a local motion sample, or preview your own video.</p>
        </div>
        <span className="sample-tag">DEMO WORKSPACE</span>
      </div>
      <div className="video-layout">
        <div>
          <div className="video-stage" aria-busy={busy}>
            {busy ? (
              <EmptyState icon={Film} title="Preparing your sample…">
                Loading a prebuilt local animation. No AI inference.
              </EmptyState>
            ) : video ? (
              <>
                <video
                  loop
                  ref={player}
                  src={video}
                  muted={muted}
                  onError={() =>
                    notify("This video could not be played. Try another file.")
                  }
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  controls
                />
                <div className="video-actions">
                  <IconButton
                    label={playing ? "Pause video" : "Play video"}
                    onClick={() =>
                      playing
                        ? player.current.pause()
                        : player.current
                            .play()
                            .catch(() => notify("Unable to play this file"))
                    }
                  >
                    {playing ? <Pause /> : <Play />}
                  </IconButton>
                  <IconButton
                    label={muted ? "Unmute" : "Mute"}
                    onClick={() => setMuted((value) => !value)}
                  >
                    {muted ? <VolumeX /> : <Volume2 />}
                  </IconButton>
                  <IconButton
                    label="Fullscreen video"
                    onClick={() =>
                      player.current
                        .requestFullscreen()
                        .catch(() => notify("Fullscreen unavailable"))
                    }
                  >
                    <Expand />
                  </IconButton>
                  <IconButton
                    label={
                      sample ? "Download demo video" : "Download uploaded video"
                    }
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = video;
                      a.download = sample
                        ? "fomi-motion-sample.webm"
                        : "fomi-local-video";
                      a.click();
                    }}
                  >
                    <Download />
                  </IconButton>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Film}
                title="A little motion. Endless possibility."
              >
                No video model is connected. Prepare a labeled motion sample or
                upload a local video.
              </EmptyState>
            )}
          </div>
          {sample && (
            <p className="video-sample-notice" role="note">
              <strong>Local motion sample - not AI-generated.</strong> This
              prebuilt animation is 3 seconds at 16:9. Requested duration and
              ratio are demo settings. Reference images stay in this browser.
            </p>
          )}
        </div>
        <div className="video-settings">
          <label className="field">
            Video prompt
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={4000}
            />
          </label>
          <Select
            label="Duration (simulated)"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
          </Select>
          <Select
            label="Aspect ratio (simulated)"
            value={ratio}
            onChange={(event) => setRatio(event.target.value)}
          >
            {["16:9", "9:16", "1:1"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
          <label className="upload-button">
            <ImagePlus size={16} />
            Reference image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => upload(event, "image")}
            />
          </label>
          {reference && (
            <img
              className="reference-preview"
              src={reference}
              alt="Uploaded reference"
            />
          )}
          <Button disabled={busy} onClick={generate}>
            <Sparkles size={16} />
            {busy ? "Preparing…" : "Prepare video demo"}
          </Button>
          <label className="upload-button">
            <Upload size={16} />
            Open local video
            <input
              type="file"
              accept="video/*"
              onChange={(event) => upload(event, "video")}
            />
          </label>
        </div>
      </div>
      <h2 className="section-title">
        Video history <span className="muted">{history.length}</span>
      </h2>
      <div className="video-history">
        {history.map((entry) => (
          <button key={entry.id} onClick={() => openHistory(entry)}>
            <Film size={22} />
            <span>
              {entry.prompt}
              <small>
                {entry.duration}s requested · {entry.ratio} ·{" "}
                {entry.video ? "Local sample" : "Concept only"}
              </small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}
