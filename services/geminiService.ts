import { GoogleGenAI, Type, Modality } from '@google/genai';
import { MapData, LearningLevel } from '../types';

const API_KEY = process.env.API_KEY;

const createClient = () => {
  if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Set GEMINI_API_KEY in your environment or .env.local file.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const mapSchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      description: "A list of concepts, topics, or skills.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "A unique, URL-friendly identifier for the node (e.g., 'react-basics')."
          },
          label: {
            type: Type.STRING,
            description: "A short, display-friendly name for the concept (e.g., 'React Basics')."
          },
          description: {
            type: Type.STRING,
            description: "A concise, one-sentence explanation of the topic."
          },
          resources: {
            type: Type.ARRAY,
            description: "An array of 1-2 learning resources, each with a title, a full URL, and a type.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the resource (e.g., a video or article title)." },
                    url: { type: Type.STRING, description: "The full URL to the resource." },
                    type: { type: Type.STRING, description: "The type of resource, either 'video' or 'website'." }
                },
                required: ['title', 'url', 'type']
            }
          },
          level: {
            type: Type.STRING,
            description: "The difficulty level: 'Beginner', 'Intermediate', or 'Advanced'."
          },
          isRoot: {
            type: Type.BOOLEAN,
            description: "True if this is a main, top-level concept."
          },
        },
        required: ['id', 'label', 'description', 'resources', 'level', 'isRoot'],
      },
    },
    links: {
      type: Type.ARRAY,
      description: "A list of connections between nodes, representing prerequisites or relationships.",
      items: {
        type: Type.OBJECT,
        properties: {
          source: {
            type: Type.STRING,
            description: "The 'id' of the source node."
          },
          target: {
            type: Type.STRING,
            description: "The 'id' of the target node."
          },
        },
        required: ['source', 'target'],
      },
    },
  },
  required: ['nodes', 'links'],
};

const relatedTopicsSchema = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            description: "A list of 3 related topic strings.",
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ['topics'],
};


export const generateLearningMap = async (topic: string, level: LearningLevel): Promise<MapData> => {
  const prompt = `
    You are an expert curriculum designer who creates visual learning roadmaps.
    Your task is to generate a structured, connected learning map for a given topic and learning level.
    The output must be a valid JSON object that strictly adheres to the provided schema.

    Topic: "${topic}"
    Learning Level: "${level}"

    Generate a learning map with these characteristics:
    1.  Nodes: Identify the main concepts and sub-topics. Break down the topic into logical, learnable chunks.
        - For a 'Beginner' map, focus on foundational concepts.
        - For 'Intermediate', assume basics are known and introduce more complex topics.
        - For 'Advanced', focus on specialization, optimization, and advanced tooling.
    2.  Links: Show the relationships between nodes. A link from A to B means A is a prerequisite or foundational concept for B.
    3.  Connectivity: Ensure the graph is fully connected. Every node should be part of the main graph.
    4.  Resources: For each node, provide 1-2 highly relevant, high-quality learning resources. Each resource must include a title, a full URL (e.g., to a YouTube video or a specific webpage), and a type ('video' or 'website').
    
    The entire response must be only the JSON object.
  `;

  try {
    const client = createClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mapSchema,
      },
    });

    const jsonString = response.text.trim();
    const data: MapData = JSON.parse(jsonString);
    
    // Validate that links correspond to actual nodes
    const nodeIds = new Set(data.nodes.map(n => n.id));
    data.links = data.links.filter(l => nodeIds.has(l.source as string) && nodeIds.has(l.target as string));

    return data;
  } catch (error) {
    console.error("Error generating learning map:", error);
    throw new Error("Failed to generate learning map from AI. Please try a different topic.");
  }
};

export const generateRelatedTopics = async (topic: string): Promise<string[]> => {
    const prompt = `
        Based on the topic "${topic}", suggest exactly 3 related but distinct topics that a learner might want to explore next.
        Focus on topics that represent a logical next step or a related field of study.
        For example, if the topic is "React", you could suggest "Next.js", "State Management Libraries", and "GraphQL".
        The output must be a valid JSON object that strictly adheres to the provided schema, containing only an array of 3 strings.
    `;
    
    try {
        const client = createClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: relatedTopicsSchema,
            },
        });

        const jsonString = response.text.trim();
        const data: { topics: string[] } = JSON.parse(jsonString);
        return data.topics || [];
    } catch (error) {
        console.error("Error generating related topics:", error);
        // Return an empty array on failure so the UI doesn't break
        return [];
    }
};

export const generateTopicImage = async (topic: string): Promise<string> => {
    const prompt = `An abstract, visually appealing conceptual image representing the topic of "${topic}". Minimalist, dark background, with glowing nodes and connections, in a futuristic, digital style. Should be suitable as a background for a mind map.`;
    
    try {
        const client = createClient();
        const response = await client.models.generateContent({
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
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error("Error generating topic image:", error);
        throw new Error("Failed to generate a background image for the topic.");
    }
};
