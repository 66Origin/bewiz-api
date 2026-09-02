export default async function handler(req, res) {
  const allowedOrigins = [
    "https://www.bewiz.fr",
    "https://bewiz.fr",
    "https://bewiz.webflow.io",
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.BEWIZ_PLACE_ID;

  if (!apiKey || !placeId) {
    console.error("Missing Google Places configuration");

    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "currentOpeningHours",
        },
      },
    );

    if (!response.ok) {
      const googleError = await response.text();

      console.error(
        `Google Places API error (${response.status}):`,
        googleError,
      );

      return res.status(502).json({
        error: "Unable to fetch opening hours",
      });
    }

    const data = await response.json();

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );

    return res.status(200).json({
      currentOpeningHours: data.currentOpeningHours ?? null,
    });
  } catch (error) {
    console.error("Opening hours error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
