import { GoogleGenerativeAI } from '@google/generative-ai';
import { storageService } from './storage';

const getApiKey = () => {
    const data = storageService.load();
    return data?.settings?.apiKey;
};

export const geminiService = {
    async generateSchedule(userProfile, history = []) {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('API Key not found');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Act as an elite fitness and climbing coach. Create a personalized 1-week workout schedule.
      
      User Profile:
      - Name: ${userProfile.name}
      - Climbing Grade: ${userProfile.climbingGrade}
      - Goals: ${userProfile.goals?.join(', ') || 'Improve overall fitness and climbing technique'}
      - Equipment: ${userProfile.equipment?.join(', ') || 'Bodyweight only'}
      
      Requirements:
      - Balance climbing sessions with antagonistic training and cardio.
      - Include specific exercises, sets, and reps.
      - Ensure rest days are strategically placed.
      - Tone: Professional, encouraging, and precise.
      
      Output Format:
      Return ONLY a raw JSON object (no markdown formatting) with this exact structure:
      {
        "weekFocus": "Brief summary of the week's goal (e.g., 'Power Endurance & Core')",
        "days": [
          {
            "day": "Monday",
            "type": "Climbing" | "Strength" | "Cardio" | "Rest" | "Flexibility",
            "title": "Short workout title",
            "duration": "Estimated time (e.g., '1h 30m')",
            "exercises": [
              { "name": "Exercise Name", "sets": "number or range", "reps": "number or duration", "notes": "Brief form cue or intensity guide" }
            ]
          }
        ]
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Gemini generation failed:', error);
            throw error;
        }
    },

    async analyzeImage(imageFile, type) {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('API Key not found');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(imageFile);
        });

        let prompt = '';
        if (type === 'food') {
            prompt = `
                Analyze this food image. Estimate the nutritional content for the entire visible portion.
                Return ONLY a raw JSON object:
                { 
                    "name": "Short descriptive name of the meal", 
                    "calories": number (integer estimate), 
                    "protein": number (grams), 
                    "carbs": number (grams), 
                    "fat": number (grams) 
                }
            `;
        } else if (type === 'equipment') {
            prompt = `
                Identify all fitness and climbing equipment visible in this image.
                Return ONLY a raw JSON object:
                { 
                    "equipment": ["item1", "item2", ...] 
                }
                Use standard names like 'Dumbbells', 'Pull-up Bar', 'Hangboard', 'Kettlebell', etc.
            `;
        }

        try {
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: imageFile.type } }
            ]);
            const response = result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Image analysis failed:', error);
            throw error;
        }
    },

    async generateHints(logs) {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('API Key not found');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const recentWorkouts = logs.workouts?.slice(-5) || [];
        const recentNutrition = logs.nutrition?.slice(-5) || [];

        const prompt = `
      Analyze these recent logs for a climber/athlete.
      Workouts: ${JSON.stringify(recentWorkouts)}
      Nutrition: ${JSON.stringify(recentNutrition)}
      
      Provide 3 short, punchy, and actionable coaching insights (max 15 words each).
      Focus on consistency, intensity, or recovery based on the data.
      
      Return ONLY a raw JSON object:
      { "hints": ["Hint 1", "Hint 2", "Hint 3"] }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr).hints;
        } catch (error) {
            console.error('Hint generation failed:', error);
            return ["Stay consistent with your training!", "Don't forget to hydrate.", "Rest is key to growth."];
        }
    },
    async recommendProject(projects, logs) {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('API Key not found');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            Analyze these climbing projects and recent logs.
            Projects: ${JSON.stringify(projects)}
            Recent Logs: ${JSON.stringify(logs.workouts?.slice(-10) || [])}

            Identify the ONE project that the user has the highest probability of sending (completing) next.
            Consider the grade, recent progress, and consistency.

            Return ONLY a raw JSON object:
            { "recommendedProjectId": "id_of_the_project" }
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr).recommendedProjectId;
        } catch (error) {
            console.error('Project recommendation failed:', error);
            return projects[0]?.id;
        }
    }
};
