"use client";
import { useEffect, useRef, useState } from "react";
import {
  Download,
  Upload,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button, IconButton, Select, Slider } from "../ui";
import assets from "../../data/assets.json";
import { download } from "../../lib/downloads";
const portraits = assets.filter((a) => a.portrait);
export default function ImageEditor({ notify }) {
  const [src, setSrc] = useState(portraits[0].src),
    [rotation, setRotation] = useState(0),
    [flip, setFlip] = useState(false),
    [zoom, setZoom] = useState(1),
    [brightness, setBrightness] = useState(100),
    [contrast, setContrast] = useState(100),
    [saturation, setSaturation] = useState(100),
    [crop, setCrop] = useState("Original");
  const canvas = useRef(),
    image = useRef(),
    url = useRef();
  useEffect(() => {
    return () => {
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    const im = new window.Image();
    im.onload = () => {
      if (!alive) return;
      image.current = im;
      draw(im);
    };
    im.onerror = () => notify("This image could not be opened");
    im.src = src;
    function draw(im) {
      const c = canvas.current;
      if (!c) return;
      const rotated = rotation % 180 !== 0;
      let w = rotated ? im.height : im.width,
        h = rotated ? im.width : im.height;
      if (crop !== "Original") {
        const r = crop === "Square" ? 1 : 3 / 4;
        if (w / h > r) w = h * r;
        else h = w / r;
      }
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip ? -zoom : zoom, zoom);
      ctx.drawImage(im, -im.width / 2, -im.height / 2);
    }
    return () => {
      alive = false;
    };
  }, [src, rotation, flip, zoom, brightness, contrast, saturation, crop]);
  function reset() {
    setRotation(0);
    setFlip(false);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setCrop("Original");
  }
  return (
    <section>
      <div className="content-heading">
        <div>
          <span className="eyebrow">MAKE IT YOUR OWN</span>
          <h1>
            A few finishing touches<span>.</span>
          </h1>
          <p>A real canvas editor, right in your browser.</p>
        </div>
        <Button
          onClick={() =>
            canvas.current.toBlob((blob) => {
              if (!blob) return;
              const u = URL.createObjectURL(blob);
              download({ src: u, title: "fomi-edited" }, notify);
              setTimeout(() => URL.revokeObjectURL(u), 1000);
            }, "image/png")
          }
        >
          <Download size={16} />
          Export PNG
        </Button>
      </div>
      <div className="editor-layout">
        <div className="canvas-stage">
          <canvas ref={canvas} aria-label="Edited image preview" />
        </div>
        <div className="editor-tools">
          <label className="upload-button">
            <Upload size={17} />
            Upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  if (!f.type.startsWith("image/"))
                    return notify("Choose an image file");
                  if (url.current) URL.revokeObjectURL(url.current);
                  url.current = URL.createObjectURL(f);
                  setSrc(url.current);
                  reset();
                }
              }}
            />
          </label>
          <div className="editor-buttons">
            <IconButton
              label="Rotate 90 degrees"
              onClick={() => setRotation((v) => (v + 90) % 360)}
            >
              <RotateCw size={19} />
            </IconButton>
            <IconButton
              label="Flip horizontally"
              onClick={() => setFlip((v) => !v)}
            >
              <FlipHorizontal size={19} />
            </IconButton>
            <IconButton
              label="Zoom in"
              onClick={() => setZoom((v) => Math.min(3, v + 0.1))}
            >
              <ZoomIn size={19} />
            </IconButton>
            <IconButton
              label="Zoom out"
              onClick={() => setZoom((v) => Math.max(1, v - 0.1))}
            >
              <ZoomOut size={19} />
            </IconButton>
          </div>
          <Select
            label="Center crop"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            {["Original", "Square", "Portrait"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          {[
            ["Zoom", zoom, setZoom, 1, 3, 0.01],
            ["Brightness", brightness, setBrightness, 0, 200, 1],
            ["Contrast", contrast, setContrast, 0, 200, 1],
            ["Saturation", saturation, setSaturation, 0, 200, 1],
          ].map(([label, value, set, min, max, step]) => (
            <Slider
              key={label}
              label={`${label} · ${Number(value).toFixed(label === "Zoom" ? 1 : 0)}`}
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => set(+e.target.value)}
            />
          ))}
          <Button secondary onClick={reset}>
            Reset adjustments
          </Button>
          <p className="muted">
            Crop trims the center of the image. Zoom controls the crop scale.
            Adjustments are baked into your export.
          </p>
        </div>
      </div>
    </section>
  );
}
