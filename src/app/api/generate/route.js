import assets from "../../../data/assets.json";
export async function POST(request) {
  try {
    const data = await request.json();
    if (
      typeof data.prompt !== "string" ||
      !data.prompt.trim() ||
      data.prompt.length > 4000
    )
      return Response.json(
        { error: "Enter a prompt between 1 and 4,000 characters." },
        { status: 400 },
      );
    if (
      ![1, 2, 4, 8].includes(Number(data.count)) ||
      !["1:1", "3:4", "4:3", "9:16", "16:9"].includes(data.ratio)
    )
      return Response.json(
        { error: "Invalid image count or aspect ratio." },
        { status: 400 },
      );
    await new Promise((r) => setTimeout(r, 1100));
    const pool = assets.filter((a) =>
      /portrait|auburn|woman|face/i.test(data.prompt) ? a.portrait : true,
    );
    const offset =
      Math.abs(Number(data.advanced?.seed) || Date.now()) % pool.length;
    return Response.json({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      settings: data,
      simulated: true,
      images: Array.from({ length: Number(data.count) }, (_, i) => ({
        ...pool[(offset + i) % pool.length],
        id: crypto.randomUUID(),
        prompt: data.prompt,
        ratio: data.ratio,
        model: data.model,
        style: data.style,
      })),
    });
  } catch {
    return Response.json(
      { error: "Unable to read generation request." },
      { status: 400 },
    );
  }
}
