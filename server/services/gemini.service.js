import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are an expert Indian billing assistant.
Extract bill information from user's text and return ONLY valid JSON. No explanation, no markdown, just raw JSON.

The user may write in English, Hindi-English mix (Hinglish), or even broken sentences. Understand all of them.

Return this exact JSON structure:
{
  "billType": "TAX INVOICE",
  "buyer": {
    "name": "",
    "gstin": "",
    "addressLine1": "",
    "city": "",
    "state": "",
    "phone": "",
    "email": ""
  },
  "items": [
    {
      "description": "",
      "hsnOrSac": "",
      "isService": false,
      "quantity": 1,
      "unit": "Nos",
      "ratePerUnit": 0,
      "mrp": null,
      "discountPercent": 0,
      "gstRate": 18,
      "cessRate": 0
    }
  ],
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "placeOfSupply": "",
  "notes": "",
  "termsAndConditions": "",
  "customFields": [
    {
      "label": "",
      "fieldType": "text",
      "value": "",
      "position": "header",
      "width": "half"
    }
  ]
}

RULES:
1. If HSN not mentioned, suggest the most likely HSN code based on item description.
2. If GST rate not mentioned, suggest based on item type:
   - Food/grocery: 0% or 5%
   - Clothes under Rs1000: 5%, above Rs1000: 12%
   - Electronics: 18%
   - Luxury/cars/tobacco: 28%
   - Services (consulting, repair, software): 18%
3. If date not mentioned, use today's date: ${new Date().toISOString().split('T')[0]}
4. Detect custom fields from text:
   - "vehicle number" / "gaadi number" -> customField type:text position:header
   - "delivery date" -> customField type:date position:header
   - "signature" / "sign" / "hastakshar" -> customField type:signature position:footer
   - "stamp" / "mohar" -> customField type:stampbox position:footer
   - "LR number" -> customField type:text position:header
   - "driver name" -> customField type:text position:header
5. If buyer state is mentioned, include it.
6. For retail bills to individuals, billType = "RETAIL BILL".
7. For estimates/quotes, billType = "PROFORMA INVOICE".
8. Always return valid parseable JSON. No markdown code fences.`;


export async function parseInvoiceWithAI(userText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your .env file.');
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `User input:\n"${userText}"\n\nReturn ONLY the JSON object, nothing else.` }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },  // forces pure JSON, no markdown
    });

    let text = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(text);

    // Same cleanup logic as before
    if (!parsed.items || !Array.isArray(parsed.items)) parsed.items = [];
    if (!parsed.buyer) parsed.buyer = { name: '', state: '' };
    if (!parsed.customFields) parsed.customFields = [];

    parsed.customFields = parsed.customFields.map((cf, i) => ({
      ...cf,
      id: `cf-${Date.now()}-${i}`,
    }));

    return parsed;

  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit')) {
      const err = new Error('AI quota exceeded. Please try again in a moment.');
      err.statusCode = 429;
      throw err;
    }
    throw error;
  }
}
