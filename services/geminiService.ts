import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchRestaurants = async (
  address: string, 
  radius: number,
  userLocation?: [number, number] // Optional: [lat, lng]
): Promise<{ restaurants: Restaurant[], center: [number, number] }> => {
  
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and tool support
  
  // Construct a simpler query context if we have precise coordinates
  const locationText = userLocation 
    ? `ma position actuelle (Latitude: ${userLocation[0]}, Longitude: ${userLocation[1]})` 
    : `l'adresse suivante : "${address}"`;

  // Refined prompt to get structured JSON output despite the tool usage
  const prompt = `
    Je cherche des restaurants près de ${locationText}.
    Rayon de recherche : ${radius} km.
    
    Utilise l'outil Google Maps pour trouver les VRAIS restaurants les mieux notés dans cette zone.
    
    IMPORTANT : Ta réponse doit contenir UNIQUEMENT un bloc de code JSON valide.
    N'écris pas de texte avant ou après le bloc JSON.
    
    Le JSON doit être une liste d'objets avec la structure suivante :
    [
      {
        "id": "unique_id",
        "name": "Nom du restaurant",
        "rating": 4.5,
        "reviewCount": 120,
        "cuisine": "Type de cuisine (ex: Italien, Japonais, Burger, Français...)",
        "priceLevel": "€€ ou €€€",
        "address": "Adresse complète",
        "description": "Une courte description attrayante du menu et de l'ambiance (max 20 mots).",
        "lat": 48.8566, (Latitude approximative ou exacte si disponible - format nombre)
        "lng": 2.3522, (Longitude approximative ou exacte si disponible - format nombre)
        "reviews": [
           { "author": "Prénom", "rating": 5, "text": "Le texte de l'avis..." }
        ]
      }
    ]
    
    Inclus jusqu'à 15 avis pertinents et détaillés par restaurant dans le tableau "reviews" pour que l'utilisateur puisse se faire une bonne idée.
    Si tu ne trouves pas de coordonnées exactes, estime-les basées sur l'adresse.
    Trie les résultats par note (rating) décroissante.
  `;

  // Define config, adding toolConfig if userLocation is available
  const config: any = {
    tools: [{ googleMaps: {} }],
    temperature: 0.7,
  };

  if (userLocation) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation[0],
          longitude: userLocation[1]
        }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: config,
    });

    const text = response.text || "";
    
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
    let jsonString = jsonMatch[1] || text;
    
    // Clean up any stray characters
    jsonString = jsonString.trim();

    let restaurants: Restaurant[] = [];
    try {
      restaurants = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", text);
      throw new Error("Erreur lors de l'analyse des résultats.");
    }

    // Attempt to determine the center of the map based on the first result or a default
    let center: [number, number] = userLocation || [48.8566, 2.3522]; // Use user location if available, else Default Paris
    
    // Ensure numbers for lat/lng
    restaurants = restaurants.map(r => ({
      ...r,
      lat: r.lat ? Number(r.lat) : undefined,
      lng: r.lng ? Number(r.lng) : undefined,
    }));

    if (!userLocation && restaurants.length > 0 && restaurants[0].lat && restaurants[0].lng) {
      center = [restaurants[0].lat, restaurants[0].lng];
    }

    // Filter out invalid entries
    const validRestaurants = restaurants.filter(r => r.name && r.lat && !isNaN(r.lat) && r.lng && !isNaN(r.lng));

    console.log(validRestaurants)

    return {
      restaurants: validRestaurants,
      center
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};