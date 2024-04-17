"use server";
import Groq from "groq-sdk";

const groq_key = process.env["GROQ"];
const fal_key = process.env["FAL"];

const groq = new Groq({
  apiKey: groq_key,
});

//These functions are running on our nextJS server. We can make requests to resources
//And securely store our API keys and secrets. 

//We can call the Groq API and pass our user prompt, max tokens and system prompt.
export async function getGroqCompletion(
  userPrompt: string,
  max_tokens: number,
  systemPrompt: string = "",
) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "mixtral-8x7b-32768",
    max_tokens: max_tokens,
  });
  return (
    completion.choices[0]?.message?.content || "Oops, something went wrong."
  );
}

//This function makes a request to the FAL api and gets an image.
export async function generateImageFal(prompt: string, image_size:string) {
  const response = await fetch(`https://fal.run/fal-ai/fast-turbo-diffusion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Key ${fal_key}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: image_size
    }),
  });

  const responseJSON = await response.json();

  //here we would normally save the image to a database and return the url
  return responseJSON?.images[0].url;
}
