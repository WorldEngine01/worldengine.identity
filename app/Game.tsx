"use client";

import { useState, useEffect } from "react";
import { getGroqCompletion, generateImageFal } from "./ai";
import { mainGamePrompt, describeImagePrompt } from "./prompts";

export default function Game() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>(
    "Your game instructions go here...",
  );
  const [img, setImg] = useState<string>("");
  const [score, setScore] = useState<string>("0");

  async function handleClick() {
    setResponse("Generating...");
    const response = await getGroqCompletion(prompt, 128, mainGamePrompt);
    setResponse(response);
    generateImage();

    //Prompt Groq again to decide what the new game state should be
    const newScore = await getGroqCompletion(
      `The following text describes the latest events in a game: ${response}. The players current score is: ${score}.`,
      4,
      "Update the player score based on the game events. If the player has successfully completed an action, award some points. If they failed, deduct some points. Only output the new score value with no explanation or other characters.",
    );

    //update your game state however you want
    setScore(newScore);
  }

  async function generateImage() {
    //Prompt Groq again to get an image description
    const imageDescription = await getGroqCompletion(
      `Describe a scene using vivid imagery and descriptive language of the following text: ${response}`,
      64,
      describeImagePrompt,
    );
    console.log("generating image");
    //Generate the image with Fal
    const url = await generateImageFal(imageDescription, "landscape_16_9");
    setImg(url);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      generateImage();
    }, 5000);
    return () => clearInterval(timer);
  }, [response]);

  return (
    <div>
      <p> Score: {score}</p>
      <input
        className="p-2 mr-2"
        type="text"
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to do?"
      />
      <button className="p-2 bg-white rounded-lg" onClick={handleClick}>
        Send
      </button>
      <p className="py-2">{response}</p>
      <img src={img} />
    </div>
  );
}
