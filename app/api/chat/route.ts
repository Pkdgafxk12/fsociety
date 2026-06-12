import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData =
      await req.formData();

    const messages =
      JSON.parse(
        formData.get(
          "messages"
        ) as string
      );

    const file =
      formData.get("file");
    if (file) {
      console.log(
        "FILE:",
        (file as File).name
      );
    }
    if (file) {

      const imageFile =
        file as File;

      const bytes =
        await imageFile.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const base64 =
        buffer.toString("base64");

      const visionResponse =
        await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${process.env.OPENROUTER_API_KEY}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              model:
                "openai/gpt-4o",

              messages: [
                {
                  role: "user",

                  content: [
                    {
                      type: "text",
                      text:
                        "Describe this image in detail.",
                    },

                    {
                      type:
                        "image_url",

                      image_url: {
                        url:
                          `data:${imageFile.type};base64,${base64}`,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

      const visionData =
        await visionResponse.json();
      console.log("VISION RESPONSE:");
      console.log(JSON.stringify(visionData, null, 2));
      return NextResponse.json({
        reply:
          visionData
            .choices?.[0]
            ?.message
            ?.content ||
          "No image response",
      });

    }
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",

          messages: [
            {
              role: "system",
              content:
                "You are FSOCIETY AI. Expert in programming, cybersecurity, Linux, debugging and technology.",
            },

            ...messages,
          ],
        }),
      }
    );

    const data = await response.json();

  console.log("OPENROUTER RESPONSE:");
  console.log(data);
    return NextResponse.json({
      reply:
        data.choices?.[0]?.message?.content ||
        "No response",
    });
  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}