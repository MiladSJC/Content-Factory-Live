// Function to safely get data or default
const v = (val, def = "") => val || def;

// --- V1 PROMPTS (Compositing / Legacy) ---
const V1_PROMPTS = {
  walmart: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Blue Flyer" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Composition:**
    - Create a rectangular card.
    - **Background Color:** Uniform Light Sky Blue (approx. Hex #BDE4FA).
    - **CRITICAL:** The background must be a solid, seamless color with no gradients or textures behind the text. All text must sit directly on the blue background.
    - **Product Placement:** Center the provided Product Image. You must use the uploaded product image as-is (do not redraw the packaging). Place it so it appears floating above the blue background with a soft, natural drop shadow beneath it.

2.  **Visual Hierarchy:**
    - **Top Right (Badge):**
        - A Dark Navy Blue rounded square box.
        - Inside this box, display the Pack/Unit Size (e.g., "12 Pack", "500 g", "2L") in white, centered, sans-serif bold text.
    - **Bottom Right (Price - Grocery Style):**
        - Color: Dark Navy Blue.
        - Font: Heavy/Black weight sans-serif.
        - **Layout Rules:**
            1. The **Dollar Amount** must be massive and visually dominant.
            2. The **Dollar Sign ($)** and **Cents** must be significantly smaller and aligned to the TOP of the dollar amount (Superscript).
            3. **NO DECIMAL POINT:** You must visually remove the decimal point in the main display (e.g., render "$5" over a big "5" and a small "47" next to it. Do not render "5.47").

3.  **Product Details (Bottom Left):**
    - Align text to the bottom-left corner.
    - Color: Dark Navy Blue.
    - Font: Clean sans-serif.
    - Background: Text must sit directly on the blue background. No white box behind it.
    - Line 1: ${v(p['Product Name'])} (Medium size).
    - Line 2: ${v(p['Description'])} (Smaller size).

4.  **Prohibited Elements:**
    - Do NOT add extra logos, brand marks, or design elements that conflict with the Blue Flyer system.
    - Do NOT add any new product images, icons, or illustrations. Use the provided product image only.

5.  **Output Requirements:**
    - Aspect Ratio: Standard rectangular product card (portrait or landscape acceptable, but content must follow the above hierarchy).
    - Resolution: High resolution suitable for print and digital.
`,

  metro: (p) => `

**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Metro Discount Flyer" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Canvas & Background:**
    - **Canvas:** Rectangular card with a **solid white background**.
    - **NO BORDER:** Do not render any borders, frames, or lines around the edge of the image. The background must be pure white to the very edge.
    - **Composition:** High-contrast, clean layout. No gradients or textures.

2.  **Product Placement:**
    - Center the product image in the upper two-thirds of the card.
    - Products must be high-resolution, cut out (no background), and appear naturally placed with minimal, soft shadowing.

3.  **Price Architecture (Consistency Control):**
    - **Color:** Solid Black (#000000).
    - **Font:** Extra Bold / Heavy Sans-Serif (e.g., Impact).
    - **Dollar Amount:** Massive and dominant, anchored to the **bottom-right corner** of the frame.
    - **Cents & Units:**
        - The **Cents** must be exactly **30% of the size** of the dollar amount.
        - **Alignment:** Top-aligned (superscript) to the dollar digits.
        - **NO DECIMAL POINT:** Do not render a period between dollars and cents.
        - **Unit Label:** Directly beneath the cents, place "ea." or "${v(p['Unit'])}" in a smaller, bold, lowercase font.

4.  **Product Details (Bottom Left):**
    - **Alignment:** Flush-left, bottom-aligned, opposite the price.
    - **Typography:** - **Line 1 (Name):** ${v(p['Product Name'])} in All-Caps, Bold Sans-Serif.
        - **Line 2 (Description):** ${v(p['Description'])} in a smaller, regular weight All-Caps font.

**Output:** A high-resolution, sharp digital asset with a borderless white background and a standardized, large-scale black price block.
`,

  staples: (p) => `
**Role:** Staples Retail Graphic Design Engine  
**Task:** Generate a promotional product card consistent with the Staples "Red Card" design system.  

**Input Data:** - Product Name: ${v(p['Product Name'])}  
- Description: ${v(p['Description'])}  
- Price: ${v(p['Price'])}  
- SKU: ${v(p['SKU'])}  
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}  

---

## 1. Overall Concept

Create a Staples-style promo card that feels bold, clean, and professional. The design must feature a **strong red brand presence**, with structured layout and clear emphasis on price and product name.

---

## 2. Layout & Background

1. **Canvas & Background**
   - Orientation: Rectangular card (portrait or landscape acceptable).
   - Background:
     - Primary area should be **clean white** to keep content readable.
     - Use **Staples Red (#CC0000 or similar)** for:
       - Top or side header band, **or**
       - A bold accent block behind the price or product name.

2. **Grid & Structure**
   - Use a simple, modular layout:
     - One area dedicated to product image.
     - One area for price & promo.
     - One area for product name & details.

---

## 3. Product Image Treatment

- Use the provided product image **exactly as given** (no cartoonization, no redrawing).
- Place it on either:
  - The **left side** with text and price on the right, **or**
  - The **top half** with price and copy below.
- Add a **subtle, realistic shadow** under the product to ground it, but no heavy glow effects.

---

## 4. Price & Offer

1. **Price Emphasis**
   - Price must be one of the most prominent elements.
   - Use a **large, bold, sans-serif font**.
   - Price color:
     - Either **black** or **dark gray** on white background, **or**
     - **White price text** on a solid **Staples Red** block.

2. **Secondary Price/Unit Info**
   - If needed, display **per unit** info (e.g., per pack or per item) in a smaller font near the main price.
   - Keep secondary information subtle but still readable.

---

## 5. Typography & Brand Voice

1. **Fonts & Style**
   - Use **clean, modern sans-serif** fonts similar to Helvetica/Arial.
   - Hierarchy:
     - Product Name: Medium–large, bold or semibold.
     - Price: Largest and boldest.
     - Description & SKU: Smaller, regular weight.

2. **Text Content**
   - **Product Name:** “${v(p['Product Name'])}” should be close to the price or image.
   - **Description:** “${v(p['Description'])}” in smaller type below or beside the name.
   - **SKU:** Display “SKU: ${v(p['SKU'])}” in discreet small text.
   - **Pack/Unit Size:** Show “${v(p['Unit'], "1 Unit")}” near the product description or under the name.

---

## 6. Color Palette & Elements

1. **Primary Colors**
   - Staples Red (#CC0000)
   - White
   - Black / Dark Gray

2. **Accent Treatment**
   - You may use simple thin lines or subtle gray dividers.
   - Avoid gradients, glows, or multi-color backgrounds.

3. **Prohibited**
   - No playful cartoon icons or non-Staples brand elements.
   - No overly busy backgrounds.
   - No extra logos other than a **single, clean Staples logo** if you choose to include one.

---

## 7. Output Requirements

- Aspect Ratio: Rectangular card, suitable for digital flyer or print layout.
- Resolution: High resolution (sharp enough for print).
- The final design must balance:
  - Strong Staples red branding,
  - Clear price emphasis,
  - Clean product presentation,
  - Readable typography.
`,

  sobeys: (p) => `
**Role:** Sobeys Retail Flyer Designer
**Task:** Generate a Sobeys-style grocery flyer card using the provided product image and information.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Sobeys Brand Design Guidelines:**

1.  **Color & Background:**
    - Primary Brand Color: Sobeys Green (#006633 or very similar).
    - Use green as a strong accent (banners, price badges, or background bands).
    - Background can be white or a very light neutral that complements green.

2.  **Product Image:**
    - Display the product image prominently in the composition.
    - Keep the product photo realistic and undistorted.

3.  **Price Treatment:**
    - Price can be large and bold, but slightly softer than a Walmart Blue Flyer style.
    - Leverage green and white for price blocks.
    - Keep pricing clear and legible.

4.  **Typography & Details:**
    - Use a friendly, approachable sans-serif.
    - Product Name: ${v(p['Product Name'])} appears near or just above the price.
    - Description: ${v(p['Description'])} in smaller text nearby.
    - Pack/Unit: ${v(p['Unit'], "1 Unit")} is visible and understandable to shoppers.

5.  **Layout:**
    - Clean, grocery-style card.
    - Product on one side, price and text on the other, or product top with price/text below.

6.  **Prohibited Elements:**
    - No harsh, overly industrial red/black only palettes.
    - No unrelated icons or graphics that do not fit a fresh grocery aesthetic.

7.  **Output:**
    - Rectangular flyer panel with clear Sobeys-inspired style.
`,

  foodbasics: (p) => `
**Role:** Food Basics Retail Flyer Designer
**Task:** Generate a Food Basics–style grocery flyer banner using the given product image and information.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Food Basics Brand Design Guidelines:**

1.  **Color & Background:**
    - Brand Colors: Green and Yellow.
    - Background: Can be solid yellow, solid green, or a combination that clearly echoes Food Basics style.
    - Ensure high contrast between text and background.

2.  **Product Image:**
    - Show the product clearly and prominently.
    - Don’t distort or stylize.

3.  **Price Layout:**
    - Price is large, bold, and attention-grabbing.
    - Can use yellow price tags on green or green tags on yellow.
    - Consider classic grocery sale aesthetic—strong, simple blocks.

4.  **Typography:**
    - Use bold, simple sans-serif fonts.
    - Product name and description should be easy to scan quickly.
    - Include Pack/Unit size ${v(p['Unit'], "1 Unit")} near the product name.

5.  **Flyer Orientation:**
    - Typically rectangular; could be more horizontal to mimic a banner.
    - The design must be visually balanced with image and price.

6.  **Prohibited:**
    - No non-grocery brand vibes (no tech or office-store look).
    - Avoid minimalistic “premium cosmetic” layouts; this should feel like a value-focused grocery flyer.

7.  **Output:**
    - High-resolution panel usable in a Food Basics-style flyer.
`
};

// --- V2 PROMPTS (Direct Edit) ---
const V2_PROMPTS = {
  walmart: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Blue Flyer" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Composition:**
    - Create a horizontal rectangular card with soft rounded corners.
    - **Background Color:** Uniform Light Sky Blue (approx. Hex #BDE4FA).
    - **CRITICAL:** The background must be a solid, seamless color. **Do NOT place white boxes, bounding boxes, or opacity layers behind the text.** All text must sit directly on the blue background.
    - **Product Placement:** Center the provided Product Image. It must appear to be floating on the background (remove original background if needed) with a soft, natural drop shadow beneath it.

2.  **Visual Hierarchy:**
    - **Top Right (Badge):** A Dark Navy Blue rounded square box. Inside, display the Pack/Unit Size in white, centered, sans-serif bold text.
    - **Bottom Right (Price - Grocery Style):** - Color: Dark Navy Blue.
        - Font: Heavy/Black weight sans-serif.
        - **Layout Rules:** 1. The **Dollar Amount** must be massive/dominant.
            2. The **Dollar Sign ($)** and **Cents** must be significantly smaller and aligned to the TOP of the dollar amount (Superscript).
            3. **NO DECIMAL POINT:** You must visually remove the period between the dollars and cents. (e.g., if input is "5.47", render a big "5" and a small "47" next to it. Do not render "5.47").

3.  **Product Details (Bottom Left):**
    - Align text to the bottom-left corner.
    - Color: Dark Navy Blue.
    - Font: Clean sans-serif.
    - **Background:** Text must sit directly on the blue background. No white backing.
    - **Line 1:** ${v(p['Product Name'])} (Medium size).
    - **Line 2:** ${v(p['Description'])} (Small size).
    - **Line 3:** ${v(p['SKU'])} (Smallest size, clearly legible).

**Output:** A high-resolution, photorealistic composite image matching this template perfectly.
`,

  metro: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Metro Discount Flyer" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Canvas:**
    - **Canvas:** Rectangular card with a solid white background.
    - **NO BORDER:** Do not render any borders, frames, or lines around the edge of the image. The background must be pure white to the very edge.
    - **Composition:** High-contrast, clean layout. No gradients, shadows, or textures on the background.

2.  **Product Placement:**
    - Center the product image in the upper two-thirds of the card.
    - If multiple products are provided (e.g., Juice and Yogurt), place them side-by-side.
    - Products must be high-resolution, cut out (no background), and appear naturally placed without heavy artificial shadows.

3.  **Visual Hierarchy (Price - Bottom Right):**
    - **Color:** Solid Black (#000000).
    - **Font:** Extra Bold / Heavy Sans-Serif (e.g., Impact or similar).
    - **Layout Rules:**
        1. The **Dollar Amount** must be massive and dominant on the right side.
        2. The **Cents** must be significantly smaller and aligned to the TOP-RIGHT of the dollar amount (Superscript).
        3. **NO DECIMAL POINT:** Do not render a period between dollars and cents.
        4. **Unit Label:** Directly beneath the cents, place the text "ea." or "${v(p['Unit'])}" in a smaller, bold, lowercase font.

4.  **Product Details (Bottom Left):**
    - **Alignment:** Flush-left, bottom-aligned, opposite the price.
    - **Color:** Solid Black (#000000).
    - **Typography:** - **Line 1 (Name):** ${v(p['Product Name'])} in All-Caps, Bold Sans-Serif.
        - **Line 2 (Description/Size):** ${v(p['Description'])} or ${v(p['Unit'])} in a smaller, regular weight All-Caps font.

**Output:** A high-resolution, sharp digital asset that perfectly replicates the "Discount Flyer" aesthetic with a white background, red border, and massive black pricing.
`,

  staples: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Staples/Office" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Composition:**
    - Create a rectangular card with a clean, professional look.
    - **Background Color:** Clean White (Hex #FFFFFF) with a thin Red border at the bottom.
    - **Product Placement:** Center the product image, large and clear.

2.  **Visual Hierarchy:**
    - **Price (Bottom Right):** Large, bold red typography (Helvetica or Arial Bold). The price should be the most dominant red element.
    - **Badge (Top Left):** A small rectangular "Staples Red" tag that says "Low Price" in white text.

3.  **Product Details (Top/Center):**
    - Text color: Dark Grey / Black.
    - Font: Clean, modern sans-serif.
    - **Line 1:** ${v(p['Product Name'])} (Bold, larger).
    - **Line 2:** ${v(p['Description'])} (Regular weight, smaller).
    - **Line 3:** ${v(p['SKU'])} (Small, light grey, bottom left).

**Output:** A high-resolution, photorealistic composite image, professional and clean.
`,

  sobeys: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Sobeys/Fresh" design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Composition:**
    - Create a rectangular card.
    - **Background Color:** Soft, Fresh Green (approx. Hex #E6F4EA).
    - **Product Placement:** Product on the right, slightly overlapping a graphic leaf element if possible.

2.  **Visual Hierarchy:**
    - **Price (Left):** Large, serif font (like Rockwell or similar). Dark Green color.
    - **Unit Badge:** A yellow circle stroke with the unit size inside (e.g., "lb" or "pkg").

3.  **Product Details (Bottom):**
    - Text color: Dark Green (almost black).
    - Font: Friendly rounded sans-serif.
    - **Line 1:** ${v(p['Product Name'])} (Prominent).
    - **Line 2:** ${v(p['Description'])} (Italicized).

**Output:** A high-resolution, photorealistic composite image, feeling fresh and organic.
`,

  foodbasics: (p) => `
**Role:** Retail Graphic Design Engine
**Task:** Generate a promotional product card consistent with the "Food Basics" discount design system.

**Input Data:**
- Product Name: ${v(p['Product Name'])}
- Description: ${v(p['Description'])}
- Price: ${v(p['Price'])}
- SKU: ${v(p['SKU'])}
- Pack/Unit Size: ${v(p['Unit'], "1 Unit")}

**Design Specifications (Strict Adherence Required):**

1.  **Background & Composition:**
    - **Background Color:** Solid, deep grocery Green (Hex #008542).
    - **Product Placement:** Product image is clear and centered or slightly to the left, floating on the green background.

2.  **Visual Hierarchy (Price is King):**
    - **Price Box (Bottom Right):** A solid, bright Yellow square/rectangle (Hex #FFEB3B) anchored to the bottom right corner.
    - **Price Text:** Inside the yellow box, display the price in massive, bold BLACK font.
    - **Header:** Inside the yellow box, above the price, include small red text saying "THIS WEEK ONLY" or "GREAT PRICE".

3.  **Product Details:**
    - Text Color: White (must contrast against the green background).
    - Font: Condensed, bold sans-serif.
    - **Position:** Place the Product Name and Description in the open space (top right or center left), avoiding the yellow price box.
    - **Origin:** If applicable, add "PRODUCT OF [Country]" in small white text.

**Output:** A high-resolution image with the distinct Green background and Yellow price block layout.
`
};

export const getPrompt = (serverVersion, modelName, productData, customModels = []) => {
  // 1. Check Custom Models (from Fine-Tune)
  const customModel = customModels.find(m => m.name === modelName);
  if (customModel) {
      let prompt = customModel.prompt;
      // Append data context
      prompt += `\n\n**MANDATORY INPUT DATA:**\n- Product: ${v(productData['Product Name'])}\n- Price: ${v(productData['Price'])}\n- Unit: ${v(productData['Unit'])}\n- SKU: ${v(productData['SKU'])}\n- Desc: ${v(productData['Description'])}`;
      return prompt;
  }

  // 2. Select Version Collection
  const collection = serverVersion === 'v2' ? V2_PROMPTS : V1_PROMPTS;
  
  // 3. Select Prompt Function
  const generator = collection[modelName] || collection['walmart'];
  
  // 4. Generate
  return generator(productData);
};