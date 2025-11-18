import { GoogleGenAI, Modality } from "@google/genai";

// Converts a File object to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

// Converts a data URL string to a GoogleGenerativeAI.Part object.
function dataUrlToGenerativePart(dataUrl: string) {
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const base64EncodedData = parts[1];
  return {
    inlineData: { data: base64EncodedData, mimeType },
  };
}

/**
 * A utility to retry an async function with exponential backoff.
 * @param fn The async function to retry.
 * @param retries The maximum number of retries.
 * @param delay The initial delay in milliseconds.
 * @param backoffFactor The factor by which to multiply the delay for each subsequent retry.
 * @returns The result of the async function if it succeeds.
 * @throws The error of the last attempt if all retries fail.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.warn(`API call failed. Retrying in ${delay / 1000}s...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= backoffFactor;
      }
    }
  }

  throw lastError;
}


export const stylizeImages = async (imageFile: File): Promise<string[] | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const imagePart = await fileToGenerativePart(imageFile);

    const basePrompt = `Your primary task is to create an **identity-preserving birthday portrait**. Facial accuracy is the most critical requirement.

**ABSOLUTE CRITICAL RULE: YOU MUST NOT CHANGE THE PERSON'S FACE IN ANY WAY.**
- The face from the provided photo must be used in the final output with **100% PERFECT ACCURACY**.
- Preserve every facial feature: the expression, skin tone, head shape, and hairstyle.
- The person in the final image must be **instantly and perfectly recognizable**.
- **ANY ALTERATION TO THE FACE IS A COMPLETE FAILURE OF THIS TASK.**

**Scene details:**
- **Composition:** A full-length shot, framing the person from head to toe, standing.
- **Outfit:** Dress them in an elegant, peach-colored party dress. **The dress must be identical in all generated images.**
- **Background:** A festive, decorated party scene with vibrant balloons and a 'Happy Birthday' banner.
- **Lighting:** Warm, golden, magical lighting.
- **Overall Style:** A joyful, photorealistic celebration scene.`;
    
    const prompts = [
        `${basePrompt}\n\n**Pose Variation 1:** A classic, elegant portrait pose, looking directly at the camera with the same serene expression from the original photo.`, // Pose 1: Classic
        `${basePrompt}\n\n**Pose Variation 2:** A three-quarter view. Her body is slightly turned to the side, but her head is turned back towards the camera, maintaining the exact same serene facial expression.`, // Pose 2: Slight Turn
        `${basePrompt}\n\n**Pose Variation 3:** A full-length portrait where she is gently holding the string of a single golden balloon, still looking at the camera with the same original expression.` // Pose 3: Hands Variation with Balloon
    ];

    const validResults: string[] = [];

    for (const prompt of prompts) {
      const apiCall = async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              imagePart,
              { text: prompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        throw new Error("No image data found in API response for stylizeImage variation.");
      };
      
      try {
        const result = await retryWithBackoff(apiCall);
        if (result) {
            validResults.push(result);
        }
      } catch (e) {
        console.error("Failed to generate one of the stylized images:", e);
        // Continue to the next image even if one fails
      }
    }

    return validResults.length > 0 ? validResults : null;
  } catch (error) {
    console.error("Error stylizing image variations:", error);
    return null;
  }
};

export const createGroupCelebrationImages = async (
  girishImage: File,
  vaishnaviImage: File,
  pratikshaImageUrl: string
): Promise<string[] | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const girishImagePart = await fileToGenerativePart(girishImage);
    const vaishnaviImagePart = await fileToGenerativePart(vaishnaviImage);
    const pratikshaImagePart = dataUrlToGenerativePart(pratikshaImageUrl);

    const poses = [
      "Pose 1: All three smiling warmly at the camera, with Pratiksha in the middle, ready to make a wish on the cupcake.",
      "Pose 2: A candid moment of laughter. Girish and Vaishnavi are looking at Pratiksha with joy as she looks at the camera.",
      "Pose 3: All three looking at the cupcake together, with Girish and Vaishnavi encouraging Pratiksha as she prepares to blow out the candle.",
      "Pose 4: A classic group photo pose. Girish and Vaishnavi are standing closely on either side of Pratiksha, all smiling happily."
    ];
    
    const validResults: string[] = [];
    
    for (const posePrompt of poses) {
       const apiCall = async () => {
        const fullPrompt = `Your task is to create a single, realistic, **identity-preserving composite photograph** of a birthday celebration from three separate source images. The absolute top priority is preserving the exact likeness of all three individuals.

**Crucial Instructions (Follow Strictly):**
1.  **Facial Integrity:** It is **ABSOLUTELY CRITICAL** to preserve the **exact facial features, expressions, and likeness** of all three individuals from their source images.
    -   **DO NOT ALTER THEIR FACES, EXPRESSIONS, OR HEAD SHAPE IN ANY WAY.**
    -   The faces in the final output must be a **perfect, 1:1 match** to the source images. They must look exactly like themselves, as if they were actually photographed together.
    -   **ANY DEVIATION IS A COMPLETE FAILURE.**
2.  **Clothing Integrity:** Retain the **exact clothing and outfits** that Girish and Vaishnavi are wearing in their uploaded photos. Do not change their attire.

**Scene Composition:**
Seamlessly integrate these three individuals into a single, cohesive birthday celebration photo. Position Pratiksha in the center, between Girish and Vaishnavi. They should be gathered around a single, elegant peach-and-white cupcake with one glowing candle.

**Pose Guidance:** ${posePrompt}

**Atmosphere:** The overall scene must have a warm, peach-themed aesthetic with soft, realistic lighting, floating confetti, and a blurred background with party decorations to create depth. The final image must look like a **genuine photograph taken at a party**, not an AI-generated image. Render as a single, high-resolution 16:9 photo.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              girishImagePart,
              vaishnaviImagePart,
              pratikshaImagePart,
              { text: fullPrompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        throw new Error(`No image data in response for pose: ${posePrompt}`);
      };

      try {
        const result = await retryWithBackoff(apiCall);
        if (result) {
            validResults.push(result);
        }
      } catch (error) {
        console.error(`Failed to generate group image for pose "${posePrompt}" after all retries.`, error);
        // Continue to the next image
      }
    }
    
    return validResults.length > 0 ? validResults : null;

  } catch (error) {
    console.error("Error creating group images:", error);
    return null;
  }
};


export const dressUpImage = async (personImageUrl: string, dressFile: File): Promise<string | null> => {
  try {
     const apiCall = async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const personImagePart = dataUrlToGenerativePart(personImageUrl);
        const dressImagePart = await fileToGenerativePart(dressFile);
        const prompt = `Your task is an **identity-preserving outfit swap and scene transformation**. This is a high-stakes task where facial accuracy is paramount.

**ABSOLUTE CRITICAL RULE: YOU MUST NOT CHANGE THE PERSON'S FACE IN ANY WAY.**
- The face from the first input image (the person) must be transferred to the final output with **100% PERFECT ACCURACY**.
- This includes: exact facial features, skin tone, expression, and hairstyle.
- The person in the output must be **instantly and perfectly recognizable**.
- **ANY DEVIATION, NO MATTER HOW SMALL, IS A COMPLETE FAILURE.**

**Transformation Steps:**
1.  **Analyze the Person:** Identify the person in the first image.
2.  **Remove Objects:** The scene contains a birthday cupcake on a table. **You must completely remove this cupcake and the table.** The person should be standing.
3.  **Apply New Outfit:** Take the outfit from the second image and dress the person in it.
4.  **Compose Full-Length Portrait:** Generate a new, **full-length, photorealistic portrait**. The final image must show the person from **head to toe**, standing. The composition must be a **vertical portrait with a 9:16 aspect ratio** to fit a phone screen.
5.  **Set New Background:** Place her in a cozy greenery café background, filled with plants, with soft, natural, cinematic lighting.
6.  **Maintain Realism:** The final image must look like a real, high-quality photograph.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              personImagePart,
              dressImagePart,
              { text: prompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
          }
        }
        throw new Error("No image data found in API response for dressUpImage.");
     };
     return await retryWithBackoff(apiCall);
  } catch (error) {
    console.error("Error in dress up after all retries:", error);
    return null;
  }
};

export const generateFoodImage = async (foodName: string): Promise<string | null> => {
    try {
        const apiCall = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a hyper-realistic, professional food photograph of ${foodName}, styled for a high-end culinary magazine. The image must be indistinguishable from a real photograph taken with a DSLR camera.

Key requirements:
1.  **Realism is paramount:** The food must have natural textures, detailed imperfections (like crumbs, slight charring, or drips), and look genuinely edible. Avoid any smooth, plastic, or "airbrushed" AI look.
2.  **Photography Style:** Use a macro or close-up shot with a shallow depth of field (bokeh effect) to make the main subject sharp and the background softly blurred. The lighting should be dramatic and cinematic, creating highlights and shadows that emphasize the food's texture and freshness.
3.  **Composition:** The ${foodName} should be the absolute hero, filling most of the frame. It should look fresh, hot (if applicable, with subtle steam), and incredibly appetizing.
4.  **No digital artifacts:** The final output must be a clean, high-resolution photograph. It must not look like a 3D render, digital painting, or illustration.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
            }
            throw new Error("No image data found in API response for generateFoodImage.");
        };
        return await retryWithBackoff(apiCall);
    } catch (error) {
        console.error("Error generating food image after all retries:", error);
        return null;
    }
};

export const generateDoraemonImage = async (): Promise<string | null> => {
  try {
    const apiCall = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Generate a hyper-realistic, 3D cinematic render of Doraemon in a futuristic, sleek, modern kitchen with cool blue ambient lighting. Doraemon is standing happily, looking at the camera. In front of him is a glowing blue neon grid on the floor, like a futuristic carpet, where delicious food items like sushi, burgers, and tempura are displayed. The style should be high-detail, photorealistic, and visually stunning.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:image/png;base64,${base64ImageBytes}`;
        }
      }
      throw new Error("No image data found in API response for generateDoraemonImage.");
    };
    return await retryWithBackoff(apiCall);
  } catch (error) {
    console.error("Error generating Doraemon image after all retries:", error);
    return null;
  }
};

export const createCouplePhotoshoot = async (
  girishImageFile: File,
  pratikshaImageFile: File
): Promise<string[] | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const girishImagePart = await fileToGenerativePart(girishImageFile);
    const pratikshaImagePart = await fileToGenerativePart(pratikshaImageFile);

    const prompts = [
      {
        background: "a stunning sunset over the water villas in the Maldives, with warm, golden light reflecting on the water.",
        pose: "They are standing on a wooden deck, gently holding hands and smiling warmly at each other.",
      },
      {
        background: "the lush, green Tegallalang Rice Terraces in Bali, with soft, misty morning light filtering through the palm trees.",
        pose: "He is standing just behind her, with his arms wrapped gently around her waist. They are both looking out at the view with serene, happy expressions.",
      },
      {
        background: "a romantic evening scene on a Parisian street, with the Eiffel Tower sparkling majestically in the background. The streetlights cast a warm glow.",
        pose: "They are standing close together in a classic, romantic dance-like pose, looking deeply into each other's eyes.",
      },
      {
        background: "a scenic viewpoint in Oia, Santorini, Greece, overlooking the iconic blue-domed churches and the Aegean Sea.",
        pose: "They are sitting comfortably together on a whitewashed wall, side-by-side, with his arm around her shoulder as they look out at the beautiful vista.",
      },
      {
        background: "a beautiful, sun-drenched meadow filled with wildflowers during golden hour. The sunlight creates a magical, hazy glow.",
        pose: "He is joyfully lifting her up in his arms. She is laughing, with her head tilted back slightly. They are looking at each other with pure, uninhibited happiness.",
      },
      {
        background: "a cozy, candlelit library with tall, dark-wood bookshelves, a warm crackling fireplace, and comfortable leather armchairs.",
        pose: "They are standing very close together, and he is whispering something in her ear, making her smile gently. It's a quiet, intimate, and deeply romantic moment.",
      }
    ];

    const validResults: string[] = [];
    
    for (const [index, p] of prompts.entries()) {
      const apiCall = async () => {
        const fullPrompt = `Your task is to create a single, hyper-realistic, **identity-preserving composite photograph** of a couple from two separate source images (one of a man, one of a woman), placing them together in a new, scenic travel location. The absolute top priority is preserving the exact likeness of both individuals.

**ABSOLUTE CRITICAL RULES (NON-NEGOTIABLE):**
1.  **PERFECT IDENTITY PRESERVATION:** You **MUST** preserve the **exact facial features, expressions, skin tones, and hairstyles** of the man and the woman from their respective source images. They must be **100% perfectly recognizable**. Any modification to their faces is a catastrophic failure.
2.  **OUTFIT INTEGRITY:** The couple **MUST** be wearing the **exact same outfits** as in their source photos. Do not alter their clothing in any way.

**SCENE TRANSFORMATION:**
1.  **Extract Individuals:** Perfectly extract the man from his image and the woman from hers.
2.  **Combine and Pose:** Combine them into a single, cohesive scene, arranging them in the following romantic pose: **${p.pose}**
3.  **Set New Background:** Place them seamlessly into the following new background: **${p.background}**
4.  **Lighting & Realism:** The lighting on the couple must be masterfully blended with the new background to create a cohesive and realistic final image. The result must look like a genuine, high-quality photograph taken on location, not a composite or AI image. The final image must be indistinguishable from reality.
5.  **Output Format:** Render as a single, high-resolution 9:16 vertical portrait.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              girishImagePart,
              pratikshaImagePart,
              { text: fullPrompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        throw new Error(`No image data in response for prompt index: ${index}`);
      };

      try {
        const result = await retryWithBackoff(apiCall);
        if (result) {
            validResults.push(result);
        }
      } catch (error) {
        console.error(`Failed to generate couple photoshoot image for prompt index "${index}" after all retries.`, error);
        // Continue to the next image
      }
    }
    
    return validResults.length > 0 ? validResults : null;

  } catch (error) {
    console.error("Error creating couple photoshoot images:", error);
    return null;
  }
};