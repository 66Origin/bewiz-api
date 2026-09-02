export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.BEWIZ_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({
      error: "Missing server configuration",
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
      const error = await response.text();

      console.error("Google Places error:", error);

      return res.status(response.status).json({
        error: "Unable to fetch opening hours",
      });
    }

    const data = await response.json();

    return res.status(200).json({
      currentOpeningHours: data.currentOpeningHours ?? null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
