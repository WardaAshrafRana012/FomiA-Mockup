export async function POST(request) {
  try {
    const data = await request.json();
    if (
      typeof data.prompt !== "string" ||
      !data.prompt.trim() ||
      data.prompt.length > 4000
    ) {
      return Response.json(
        { error: "Enter a video prompt between 1 and 4,000 characters." },
        { status: 400 },
      );
    }
    if (
      ![5, 10].includes(Number(data.duration)) ||
      !["16:9", "9:16", "1:1"].includes(data.ratio)
    ) {
      return Response.json(
        { error: "Choose a supported duration and aspect ratio." },
        { status: 400 },
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    return Response.json({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      simulated: true,
      settings: {
        prompt: data.prompt.trim(),
        duration: Number(data.duration),
        ratio: data.ratio,
        hasReference: Boolean(data.hasReference),
      },
      video: {
        src: "/assets/video/demo-motion.webm",
        title: "Fomi local motion sample",
        mimeType: "video/webm",
        duration: 3,
        ratio: "16:9",
        source: "procedural-local-sample",
      },
      message:
        "Local motion sample only. No AI model was run. Requested duration and ratio are simulated; the sample is 3 seconds at 16:9.",
    });
  } catch {
    return Response.json(
      { error: "Unable to read the video request." },
      { status: 400 },
    );
  }
}
