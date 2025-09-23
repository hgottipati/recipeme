const OpenAI = require('openai');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.openai = this.apiKey ? new OpenAI({
      apiKey: this.apiKey
    }) : null;
  }

  async parseRecipeFromText(rawText, userPreferences = {}) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      
      const prompt = this.buildParsingPrompt(rawText, userPreferences);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert recipe parser and standardizer. Parse unstructured recipe text into a clean, structured format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const cleanedContent = this.cleanAIResponse(response.choices[0].message.content);
      const parsedRecipe = JSON.parse(cleanedContent);
      return this.validateAndCleanRecipe(parsedRecipe);
    } catch (error) {
      console.error('AI parsing error:', error);
      throw new Error('Failed to parse recipe with AI');
    }
  }

  async standardizeRecipe(recipe, userPreferences = {}) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      
      const prompt = this.buildStandardizationPrompt(recipe, userPreferences);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a recipe standardization expert. Convert recipes to user's preferred format, units, and equipment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      const cleanedContent = this.cleanAIResponse(response.choices[0].message.content);
      const standardizedRecipe = JSON.parse(cleanedContent);
      return this.validateAndCleanRecipe(standardizedRecipe);
    } catch (error) {
      console.error('AI standardization error:', error);
      throw new Error('Failed to standardize recipe with AI');
    }
  }

  async personalizeInstructions(recipe, userPreferences, equipment) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      
      const prompt = this.buildPersonalizationPrompt(recipe, userPreferences, equipment);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a cooking instructor who adapts recipes to match the user's equipment, skill level, and preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      const cleanedContent = this.cleanAIResponse(response.choices[0].message.content);
      const personalizedRecipe = JSON.parse(cleanedContent);
      return this.validateAndCleanRecipe(personalizedRecipe);
    } catch (error) {
      console.error('AI personalization error:', error);
      throw new Error('Failed to personalize recipe with AI');
    }
  }

  buildParsingPrompt(rawText, userPreferences) {
    return `
Parse the following recipe text into a structured JSON format. Extract all ingredients, instructions, timing, and metadata.

User Preferences:
- Measurement Units: ${userPreferences.measurementUnits || 'imperial'}
- Skill Level: ${userPreferences.skillLevel || 'intermediate'}
- Dietary Restrictions: ${userPreferences.dietaryRestrictions?.join(', ') || 'none'}

Recipe Text:
${rawText}

Return a JSON object with this structure:
{
  "title": "Recipe Title",
  "description": "Brief description",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity",
      "unit": "unit of measurement",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    {
      "stepNumber": 1,
      "instruction": "detailed step",
      "time": "optional time",
      "temperature": "optional temperature",
      "equipment": ["equipment needed"]
    }
  ],
  "metadata": {
    "prepTime": "prep time",
    "cookTime": "cook time",
    "totalTime": "total time",
    "servings": number,
    "difficulty": "easy|medium|hard",
    "cuisine": ["cuisine types"],
    "tags": ["relevant tags"],
    "mealType": ["breakfast|lunch|dinner|snack|dessert|appetizer"]
  }
}`;
  }

  buildStandardizationPrompt(recipe, userPreferences) {
    return `
Standardize this recipe according to the user's preferences. Convert units, normalize equipment names, and adjust terminology.

User Preferences:
- Measurement Units: ${userPreferences.measurementUnits || 'imperial'}
- Preferred Equipment: ${userPreferences.preferredCookingMethods?.join(', ') || 'standard'}
- Common Substitutions: ${JSON.stringify(userPreferences.commonSubstitutions || {})}

Current Recipe:
${JSON.stringify(recipe, null, 2)}

Return the standardized recipe in the same JSON format, with these changes:
1. Convert all measurements to user's preferred units
2. Replace equipment names with user's preferred terms (e.g., "IP" → "Instant Pot")
3. Apply any common ingredient substitutions
4. Normalize cooking terminology
5. Ensure consistent formatting

Return only the JSON object.`;
  }

  buildPersonalizationPrompt(recipe, userPreferences, equipment) {
    return `
Adapt this recipe's instructions to match the user's equipment, skill level, and cooking style.

User Profile:
- Skill Level: ${userPreferences.skillLevel || 'intermediate'}
- Available Equipment: ${equipment?.map(eq => eq.name).join(', ') || 'standard kitchen'}
- Preferred Cooking Methods: ${userPreferences.preferredCookingMethods?.join(', ') || 'standard'}
- Instruction Style Preference: ${userPreferences.aiLearningData?.preferredInstructionsStyle || 'detailed'}

Current Recipe:
${JSON.stringify(recipe, null, 2)}

Adapt the instructions to:
1. Use only equipment the user has available
2. Match the user's skill level (simpler for beginners, more detailed for advanced)
3. Follow their preferred cooking methods
4. Use their preferred instruction style (simple/detailed/professional)
5. Include helpful tips based on their skill level

Return the personalized recipe in the same JSON format.`;
  }

  validateAndCleanRecipe(recipe) {
    // Basic validation and cleaning
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Invalid recipe structure: missing required fields');
    }

    // Ensure ingredients have required fields
    recipe.ingredients = recipe.ingredients.map((ingredient, index) => ({
      name: ingredient.name || `Ingredient ${index + 1}`,
      amount: ingredient.amount || '1',
      unit: ingredient.unit || 'unit',
      notes: ingredient.notes || '',
      originalText: ingredient.originalText || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
    }));

    // Ensure instructions have required fields
    recipe.instructions = recipe.instructions.map((instruction, index) => ({
      stepNumber: instruction.stepNumber || index + 1,
      instruction: instruction.instruction || `Step ${index + 1}`,
      time: instruction.time || '',
      temperature: instruction.temperature || '',
      equipment: instruction.equipment || [],
      tips: instruction.tips || [],
      originalText: instruction.originalText || instruction.instruction
    }));

    // Ensure metadata has defaults and valid enum values
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'];
    
    // Map difficulty to valid enum values
    let difficulty = recipe.metadata?.difficulty || 'medium';
    if (difficulty.toLowerCase().includes('beginner') || difficulty.toLowerCase().includes('easy')) {
      difficulty = 'easy';
    } else if (difficulty.toLowerCase().includes('intermediate') || difficulty.toLowerCase().includes('medium')) {
      difficulty = 'medium';
    } else if (difficulty.toLowerCase().includes('advanced') || difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('expert')) {
      difficulty = 'hard';
    } else {
      difficulty = 'medium'; // default
    }
    
    // Map meal types to valid enum values (lowercase)
    let mealTypes = recipe.metadata?.mealType || [];
    if (Array.isArray(mealTypes)) {
      mealTypes = mealTypes.map(type => {
        const lowerType = type.toLowerCase();
        if (validMealTypes.includes(lowerType)) {
          return lowerType;
        }
        // Map common variations
        if (lowerType.includes('breakfast') || lowerType.includes('morning')) return 'breakfast';
        if (lowerType.includes('lunch') || lowerType.includes('midday')) return 'lunch';
        if (lowerType.includes('dinner') || lowerType.includes('evening')) return 'dinner';
        if (lowerType.includes('snack') || lowerType.includes('appetizer')) return 'snack';
        if (lowerType.includes('dessert') || lowerType.includes('sweet')) return 'dessert';
        return 'dinner'; // default
      }).filter((value, index, self) => self.indexOf(value) === index); // remove duplicates
    }
    
    recipe.metadata = {
      prepTime: recipe.metadata?.prepTime || '',
      cookTime: recipe.metadata?.cookTime || '',
      totalTime: recipe.metadata?.totalTime || '',
      servings: recipe.metadata?.servings || 4,
      difficulty: difficulty,
      cuisine: recipe.metadata?.cuisine || [],
      tags: recipe.metadata?.tags || [],
      mealType: mealTypes
    };

    return recipe;
  }

  async extractTextFromURL(url) {
    try {
      const axios = require('axios');
      const cheerio = require('cheerio');
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Common recipe selectors
      const recipeSelectors = [
        '[itemtype*="Recipe"]',
        '.recipe',
        '.recipe-content',
        '.recipe-ingredients',
        '.recipe-instructions',
        '[data-testid*="recipe"]',
        '.ingredients',
        '.instructions',
        '.directions'
      ];

      let recipeText = '';
      
      for (const selector of recipeSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          recipeText += elements.text() + '\n';
        }
      }

      // Fallback: extract from common text patterns
      if (!recipeText) {
        recipeText = $('body').text();
      }

      return recipeText.substring(0, 10000); // Limit text length
    } catch (error) {
      console.error('URL extraction error:', error);
      throw new Error('Failed to extract content from URL');
    }
  }

  async extractTextFromYouTube(videoId) {
    try {
      const { YoutubeTranscript } = require('youtube-transcript');
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const text = transcript.map(item => item.text).join(' ');
      
      return text.substring(0, 10000); // Limit text length
    } catch (error) {
      console.error('YouTube extraction error:', error);
      throw new Error('Failed to extract transcript from YouTube video');
    }
  }

  // Clean AI response to extract JSON from markdown code blocks
  cleanAIResponse(content) {
    try {
      // Remove markdown code blocks
      let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any leading/trailing whitespace
      cleaned = cleaned.trim();
      
      // If it still doesn't look like JSON, try to extract JSON from the content
      if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }
      }
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning AI response:', error);
      return content; // Return original if cleaning fails
    }
  }
}

module.exports = new AIService();
