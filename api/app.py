import os
import base64
import httpx
import asyncio
import io
import json
import shutil
import glob
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

import tempfile
import mimetypes


# NEW: Google GenAI Imports for Nano Banana
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG ---
API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

VISION_DEPLOYMENT_NAME = os.getenv("VISION_DEPLOYMENT_NAME")
VISION_API_VERSION = os.getenv("VISION_API_VERSION")

# 1. Add this near your other CONFIG variables
REACT_PUBLIC_DIR = os.getenv("REACT_PUBLIC_DIR", r"C:\Users\milad.moradi\Desktop\Demo Portal\ReactVideo")

# NEW: Google Config from .env
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")
GOOGLE_IMAGE_MODEL = os.getenv("GOOGLE_IMAGE_MODEL", "gemini-3-pro-image-preview")

SAVE_BASE_DIR = r"C:\Users\milad.moradi\Desktop\Demo Portal\Jsons"
# Unified Campaign directory inside the React Public folder for persistence
CAMPAIGN_SAVE_DIR = r"C:\Users\milad.moradi\Desktop\Demo Portal\ReactVideo\public\Campaigns"

if not API_KEY:
    raise ValueError("Azure API Key not found!")

def require_azure_openai():
    if not API_KEY or not ENDPOINT or not DEPLOYMENT_NAME:
        raise HTTPException(
            status_code=500,
            detail="Azure OpenAI is not configured (AZURE_OPENAI_API_KEY/ENDPOINT/DEPLOYMENT_NAME)."
        )

# 2. Update the ProductRequest Model to make fields optional
class ProductRequest(BaseModel):
    image_path: str
    product_name: str
    description: Optional[str] = ""  # Changed to Optional
    price: Optional[str] = ""        # Changed to Optional
    sku: Optional[str] = ""          # Changed to Optional
    unit: Optional[str] = ""
    model: Optional[str] = "metro"
    n: Optional[int] = 1
    server_version: Optional[str] = "v2"
    custom_prompt: Optional[str] = None
    mask_path: Optional[str] = None
    use_background_compositing: Optional[bool] = False

    width: Optional[int] = 1024
    height: Optional[int] = 1024

    # --- UI controls from ImageModification.jsx ---
    resolution: Optional[str] = "1K"          # '1K' | '2K' | '4K'
    safety_level: Optional[str] = "allow_all" # 'allow_all' | 'allow_adults' | 'block_all'
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 0.95

# --- NEW: Video Schema ---
class VideoRequest(BaseModel):
    image_path: str
    prompt: str
    aspect_ratio: Optional[str] = "16:9"
    resolution: Optional[str] = "1080p"
    duration: Optional[int] = 8
    generate_audio: Optional[bool] = False
    model: Optional[str] = "veo-3.1-generate-001"

# 3. Update the generate_card endpoint with smart path resolving
@app.post("/generate-card")
async def generate_card(product: ProductRequest):
    raw_path = product.image_path.strip().replace('"', "")

    # Support data URLs (Live mode "previous" results are often data:image/... base64)
    if raw_path.startswith("data:image"):
        try:
            header, encoded = raw_path.split(",", 1)
            mime = header.split(";")[0].split(":")[1] if ":" in header else "image/png"
            ext = (mime.split("/")[-1] or "png").lower()

            tmp_dir = os.path.join(tempfile.gettempdir(), "sjc_image_mod")
            os.makedirs(tmp_dir, exist_ok=True)

            tmp_name = f"ref_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.{ext}"
            clean_path = os.path.join(tmp_dir, tmp_name)

            with open(clean_path, "wb") as f:
                f.write(base64.b64decode(encoded))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid data URL image_path: {str(e)}")
    else:
        # Normalize leading slashes so os.path.join doesn't drop REACT_PUBLIC_DIR on Windows
        raw_rel = raw_path.lstrip("/\\") if raw_path else raw_path

        # Path Resolver Logic:
        # 1. Try path as-is
        clean_path = raw_path

        # 2. Try relative to React Project Root (e.g., public/Image/1.jpg)
        if not os.path.exists(clean_path):
            clean_path = os.path.join(REACT_PUBLIC_DIR, raw_rel)

        # 3. Try relative to public folder specifically
        if not os.path.exists(clean_path):
            raw_rel_no_public = raw_rel.replace("public/", "").replace("public\\", "")
            clean_path = os.path.join(REACT_PUBLIC_DIR, "public", raw_rel_no_public)

        # 4. Try just the filename inside public/Image
        if not os.path.exists(clean_path):
            clean_path = os.path.join(REACT_PUBLIC_DIR, "public", "Image", os.path.basename(raw_rel))

    if not os.path.exists(clean_path):
        raise HTTPException(
            status_code=404,
            detail=f"Image file not found at: {clean_path}. Check REACT_PUBLIC_DIR in .env"
        )

    # Proceed with original logic
    mask_path = None
    if getattr(product, "mask_path", None):
        mask_candidate = product.mask_path.strip().replace('"', "")
        if os.path.exists(mask_candidate):
            mask_path = mask_candidate

    if product.server_version == "v2":
        # Pass the newly resolved clean_path to your handlers if necessary
        # or ensure product.image_path is updated
        product.image_path = clean_path
        return await handle_nano_banana(product)
    else:
        return await handle_gpt_image1_request(product, clean_path, mask_path)

# --- NEW: IMAGE TO VIDEO ENDPOINT ---
@app.post("/generate-video")
async def generate_video(req: VideoRequest):
    """Handles Image-to-Video generation using Google Veo 3.1"""
    if not GOOGLE_CLOUD_API_KEY:
        raise HTTPException(status_code=500, detail="Google Cloud API Key not configured.")

    # 1. Resolve Image to Base64
    clean_path = req.image_path.strip().replace('"', "")
    if clean_path.startswith("data:image"):
        _, encoded = clean_path.split(",", 1)
        b64_image = encoded
        mime_type = "image/png"
    else:
        raw_rel = clean_path.lstrip("/\\")
        clean_path = os.path.join(REACT_PUBLIC_DIR, "public", "Video", os.path.basename(raw_rel))
        if not os.path.exists(clean_path):
             raise HTTPException(status_code=404, detail="Source image for video not found.")
        with open(clean_path, "rb") as f:
            b64_image = base64.b64encode(f.read()).decode('utf-8')
            mime_type = mimetypes.guess_type(clean_path)[0] or "image/jpeg"

    # 2. Call Veo API (REST PredictLongRunning) using API Key in query param
    # Using the verified Project ID 'content-factori' directly to ensure reliability
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "content-factori")
    url = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-central1/publishers/google/models/{req.model}:predictLongRunning?key={GOOGLE_CLOUD_API_KEY}"
    
    headers = {
        "Content-Type": "application/json; charset=utf-8"
    }

    payload = {
        "instances": [{
            "prompt": req.prompt,
            "image": { "bytesBase64Encoded": b64_image, "mimeType": mime_type }
        }],
        "parameters": {
            "aspectRatio": req.aspect_ratio,
            "durationSeconds": req.duration,
            "resolution": req.resolution,
            "generateAudio": req.generate_audio,
            "sampleCount": 1
        }
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Veo Launch Error: {resp.text}")
            
            op_data = resp.json()
            op_name = op_data.get("name")
            
            if not op_name:
                raise HTTPException(status_code=500, detail=f"Operation name missing: {op_data}")

            # Operation polling requires the API Key appended as a query parameter
            poll_url = f"https://us-central1-aiplatform.googleapis.com/v1/{op_name}?key={GOOGLE_CLOUD_API_KEY}"
            
            # Polling for Operation completion
            for _ in range(60): 
                await asyncio.sleep(5)
                poll_resp = await client.get(poll_url, headers=headers)
                status = poll_resp.json()
                if status.get("done"):
                    video_info = status.get("response", {}).get("videos", [{}])[0]
                    b64_video = video_info.get("bytesBase64Encoded")
                    if b64_video:
                        return {"video": f"data:video/mp4;base64,{b64_video}"}
                    break
            
            raise HTTPException(status_code=408, detail="Video generation timed out.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Veo Engine Error: {str(e)}")

### --- NEW: Aspect Ratio Helper ---
def get_closest_aspect_ratio(width: int, height: int) -> str:
    """Maps pixel dimensions to the closest supported Google GenAI aspect ratio."""
    supported = {
        "1:1": 1.0,
        "3:2": 1.5,
        "2:3": 0.66,
        "3:4": 0.75,
        "4:3": 1.33,
        "4:5": 0.8,
        "5:4": 1.25,
        "9:16": 0.56,
        "16:9": 1.77,
        "21:9": 2.33
    }
    target_ratio = width / height
    # Find the key with the minimum absolute difference to the target ratio
    closest_match = min(supported.items(), key=lambda x: abs(x[1] - target_ratio))
    return closest_match[0]

class StyleAnalysisRequest(BaseModel):
    images: List[str]
    model_name: str

class EblastRequest(BaseModel):
    images: List[str]
    prompt: Optional[str] = ""
    settings: Optional[Dict[str, Any]] = {}
    is_live: Optional[bool] = False

@app.post("/generate-eblast")
async def generate_eblast(request: EblastRequest):
    """Handles multi-image eblast creation using Gemini (Nano Banana)"""
    if not request.is_live:
        return {"image": "/Eblast/Result Images/1.png"}

    if not GOOGLE_CLOUD_API_KEY:
        raise HTTPException(status_code=500, detail="Google Cloud API Key not configured.")

    try:
        client = genai.Client(vertexai=True, api_key=GOOGLE_CLOUD_API_KEY)
        
        # CORRECT SEQUENCE: Multiple Images FIRST, then Text Prompt
        content_parts = []
        
        for img_data in request.images:
            if img_data.startswith("data:image"):
                try:
                    header, encoded = img_data.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                    content_parts.append(types.Part.from_bytes(data=base64.b64decode(encoded), mime_type=mime_type))
                except Exception as e:
                    print(f"Skipping malformed image: {e}")

        # Append Text Instruction LAST (as per Nano Banana architectural patterns)
        prompt_text = request.prompt or "Generate a professional retail eblast layout featuring these products. Use a clean, modern design."
        content_parts.append(types.Part.from_text(text=prompt_text))

        # Extract settings with defaults
        s = request.settings
        chosen_aspect = s.get("aspectRatio", "9:16")
        res = s.get("resolution", "1K").upper()
        temp = float(s.get("temperature", 1.0))
        top_p = float(s.get("top_p", 0.95))
        
        safety = (s.get("safety_level") or "allow_all").lower()
        threshold = "OFF" if safety == "allow_all" else "BLOCK_MEDIUM_AND_ABOVE" if safety == "allow_adults" else "BLOCK_LOW_AND_ABOVE"

        generate_content_config = types.GenerateContentConfig(
            temperature=temp,
            top_p=top_p,
            # Updated to include TEXT as the model requires it for multi-modal "reasoning"
            response_modalities=["TEXT", "IMAGE"],
            safety_settings=[types.SafetySetting(category=cat, threshold=threshold) 
                             for cat in ["HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_DANGEROUS_CONTENT", 
                                        "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_HARASSMENT"]],
            image_config=types.ImageConfig(aspect_ratio=chosen_aspect, image_size=res, output_mime_type="image/png"),
        )

        response = client.models.generate_content(
            model=GOOGLE_IMAGE_MODEL,
            contents=[types.Content(role="user", parts=content_parts)],
            config=generate_content_config,
        )

        # Return the first generated layout
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                b64_img = base64.b64encode(part.inline_data.data).decode('utf-8')
                return {"image": f"data:image/png;base64,{b64_img}"}
        
        raise HTTPException(status_code=500, detail="No image data returned from Gemini.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Eblast Error: {str(e)}")

class ProjectSaveRequest(BaseModel):
    config: Dict[str, Any]
    rows: List[Any]
    merges: Dict[str, Any]
    hiddenCells: List[str]
    cellData: Dict[str, Any]
    designModel: str
    serverVersion: str
    customModels: List[Any]

# -------------------------------
# CAMPAIGN SCHEMA
# -------------------------------
StrategicYear = Literal["2026", "2027", "2028"]

class CampaignRequest(BaseModel):
    name: str
    docketNumber: int = Field(..., ge=0)
    strategicYear: StrategicYear
    retailWeek: int = Field(..., ge=1, le=52)
    banner: Optional[str] = "Metro"
    pm: Optional[str] = "Milad Moradi"
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    channels: List[str] = []
    status: str = "Planning"
    productCount: Optional[int] = 0
    assets: Optional[List[Any]] = []
    offerDataUrl: Optional[str] = ""
    layoutUrl: Optional[str] = ""
    previewUrl: Optional[str] = ""
    year: Optional[str] = None

# --- CAMPAIGN ENDPOINTS ---

@app.post("/save-campaign")
async def save_campaign(campaign: CampaignRequest):
    try:
        os.makedirs(CAMPAIGN_SAVE_DIR, exist_ok=True)
        safe_name = "".join(x for x in campaign.name if x.isalnum() or x in " -_")
        file_path = os.path.join(CAMPAIGN_SAVE_DIR, f"{safe_name}.json")
        data = campaign.model_dump()
        if not data.get("strategicYear") and data.get("year") in ["2026", "2027", "2028"]:
            data["strategicYear"] = data["year"]
        data["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
                data["created_at"] = existing.get("created_at", data["updated_at"])
        else:
            data["created_at"] = data["updated_at"]
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return {"message": "Campaign saved", "path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list-campaigns")
async def list_campaigns():
    try:
        os.makedirs(CAMPAIGN_SAVE_DIR, exist_ok=True)
        files = glob.glob(os.path.join(CAMPAIGN_SAVE_DIR, "*.json"))
        campaigns = []
        for fpath in files:
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    campaigns.append(json.load(f))
            except Exception:
                continue
        return JSONResponse({"campaigns": campaigns}, headers={"Cache-Control": "no-store"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/delete-campaign")
async def delete_campaign(payload: dict):
    try:
        name = payload.get("name")
        safe_name = "".join(x for x in name if x.isalnum() or x in " -_")
        file_path = os.path.join(CAMPAIGN_SAVE_DIR, f"{safe_name}.json")
        if os.path.exists(file_path):
            os.remove(file_path)
            return {"message": "Campaign deleted"}
        raise HTTPException(status_code=404, detail="Campaign not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- FILE SYSTEM ENDPOINTS ---

@app.post("/open-file")
async def open_file(payload: dict):
    path = payload.get("path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File path not found.")
    try:
        os.startfile(path) 
        return {"message": "Opening file..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/open-folder")
async def open_folder(payload: dict):
    path = payload.get("path")
    if not path or not os.path.isdir(path):
        raise HTTPException(status_code=404, detail="Folder not found.")
    try:
        os.startfile(path)
        return {"message": "Opening folder..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- IMAGE & PROJECT ENDPOINTS ---

@app.get("/get-local-image")
async def get_local_image(path: str = Query(..., description="Absolute path to the image file")):
    clean_path = path.strip().replace('"', '')
    if not os.path.exists(clean_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    return FileResponse(clean_path)

@app.post("/save-project")
async def save_project(project: ProjectSaveRequest):
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        folder_name = f"{project.designModel}_{project.serverVersion}_{timestamp}"
        full_folder_path = os.path.join(SAVE_BASE_DIR, folder_name)
        os.makedirs(full_folder_path, exist_ok=True)

        image_counter = 1
        processed_cell_data = project.cellData.copy()

        for cell_id, cell_content in processed_cell_data.items():
            if "image" in cell_content and cell_content["image"]:
                img_str = cell_content["image"]
                if img_str.startswith("data:image"):
                    try:
                        header, encoded = img_str.split(",", 1)
                        data = base64.b64decode(encoded)
                        file_name = f"{image_counter}.png"
                        file_path = os.path.join(full_folder_path, file_name)
                        with open(file_path, "wb") as f:
                            f.write(data)
                        cell_content["image"] = file_path
                        image_counter += 1
                    except Exception:
                        pass

            if "variations" in cell_content and isinstance(cell_content["variations"], list):
                new_vars = []
                for var_img in cell_content["variations"]:
                    if var_img.startswith("data:image"):
                        try:
                            header, encoded = var_img.split(",", 1)
                            data = base64.b64decode(encoded)
                            file_name = f"{image_counter}.png"
                            file_path = os.path.join(full_folder_path, file_name)
                            with open(file_path, "wb") as f:
                                f.write(data)
                            new_vars.append(file_path)
                            image_counter += 1
                        except Exception:
                            new_vars.append(var_img)
                    else:
                        new_vars.append(var_img)
                cell_content["variations"] = new_vars
            processed_cell_data[cell_id] = cell_content

        final_json = {
            "version": 2,
            "timestamp": timestamp,
            "config": project.config,
            "designModel": project.designModel,
            "serverVersion": project.serverVersion,
            "rows": project.rows,
            "merges": project.merges,
            "hiddenCells": project.hiddenCells,
            "cellData": processed_cell_data,
            "customModels": project.customModels
        }

        json_path = os.path.join(full_folder_path, f"{folder_name}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(final_json, f, indent=2)

        return {"message": "Project saved successfully", "path": json_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-style")
async def analyze_style(request: StyleAnalysisRequest):
    if not request.images:
        raise HTTPException(status_code=400, detail="No images provided")

    content_blocks = [{
        "type": "text",
        "text": (
            f"You are an expert Graphic Design Analyst. I am providing samples of a retail design system named '{request.model_name}'.\n"
            "Reverse-engineer a highly detailed image generation prompt that would recreate this exact style for a NEW product.\n"
            "Focus strictly on:\n"
            "1. Background color (Hex codes), texture, and lighting.\n"
            "2. Typography hierarchy (Boldness, colors, placement of Price vs Name).\n"
            "3. specific Badge styles (shapes, colors, location).\n"
            "4. Composition and Product placement.\n\n"
            "Output ONLY the raw prompt text suitable for DALL-E 3. "
            "Do not include conversational filler. "
            "Start with '**Role:** Retail Graphic Design Engine...'"
        )
    }]

    for b64_img in request.images:
        content_blocks.append({"type": "image_url", "image_url": {"url": b64_img}})

    payload = {
        "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": content_blocks}],
        "max_tokens": 1000,
        "temperature": 0.7
    }

    url = f"{ENDPOINT}/openai/deployments/{VISION_DEPLOYMENT_NAME}/chat/completions?api-version={VISION_API_VERSION}"
    headers = {"Content-Type": "application/json", "api-key": API_KEY}

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                return {"prompt": result["choices"][0]["message"]["content"]}
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Vision API Error: {response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

### --- MODIFIED handle_nano_banana ---
async def handle_nano_banana(product: ProductRequest):
    """V2 > Nano Banana Architecture using Google Gemini 3 Pro Image with Dynamic Aspect Ratio"""
    if not GOOGLE_CLOUD_API_KEY:
        raise HTTPException(status_code=500, detail="Google Cloud API Key not configured.")
    
    clean_path = product.image_path.strip().replace('"', "")
    if not os.path.exists(clean_path):
        raise HTTPException(status_code=404, detail=f"Source image not found: {clean_path}")

    # Determine dynamic aspect ratio
    chosen_aspect = get_closest_aspect_ratio(product.width or 1024, product.height or 1024)

    try:
        client = genai.Client(vertexai=True, api_key=GOOGLE_CLOUD_API_KEY)
        
        with open(clean_path, "rb") as img_file:
            img_data = img_file.read()
            mime_type = mimetypes.guess_type(clean_path)[0] or "image/jpeg"
            image_part = types.Part.from_bytes(data=img_data, mime_type=mime_type)


        text_part = types.Part.from_text(text=product.custom_prompt)

        # --- Normalize UI inputs (defensive) ---
        try:
            temperature = float(product.temperature if product.temperature is not None else 1.0)
        except Exception:
            temperature = 1.0
        temperature = max(0.0, min(2.0, temperature))

        try:
            top_p = float(product.top_p if product.top_p is not None else 0.95)
        except Exception:
            top_p = 0.95
        top_p = max(0.0, min(1.0, top_p))

        resolution = (product.resolution or "1K").upper()
        if resolution not in {"1K", "2K", "4K"}:
            resolution = "1K"

        safety_level = (product.safety_level or "allow_all").lower()
        if safety_level == "block_all":
            threshold = "BLOCK_LOW_AND_ABOVE"
        elif safety_level == "allow_adults":
            threshold = "BLOCK_MEDIUM_AND_ABOVE"
        else:
            threshold = "OFF"

        generate_content_config = types.GenerateContentConfig(
            temperature=temperature,
            top_p=top_p,
            response_modalities=["IMAGE"],
            safety_settings=[
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold=threshold),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold=threshold),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold=threshold),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold=threshold)
            ],
            image_config=types.ImageConfig(
                aspect_ratio=chosen_aspect,
                image_size=resolution,
                output_mime_type="image/png"
            ),
        )


        generated_images = []
        for _ in range(product.n or 1):
            response = client.models.generate_content(
                model=GOOGLE_IMAGE_MODEL,
                contents=[types.Content(role="user", parts=[image_part, text_part])],
                config=generate_content_config,
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    b64_img = base64.b64encode(part.inline_data.data).decode('utf-8')
                    generated_images.append(f"data:image/png;base64,{b64_img}")

        return {"images": generated_images}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Engine Error: {str(e)}")


async def handle_gpt_image1_request(product: ProductRequest, clean_path: str, mask_path: Optional[str] = None):
    if not product.custom_prompt:
        raise HTTPException(status_code=400, detail="Prompt missing.")

    edit_url = f"{ENDPOINT}/openai/deployments/{DEPLOYMENT_NAME}/images/edits?api-version={API_VERSION}"
    headers = {"api-key": API_KEY}

    # Map UI resolution -> quality (best-effort for v1)
    resolution = (product.resolution or "1K").upper()
    quality = "medium" if resolution == "1K" else "high"

    # Choose closest supported size based on requested width/height
    w = product.width or 1024
    h = product.height or 1024
    if w > h:
        size = "1536x1024"
    elif h > w:
        size = "1024x1536"
    else:
        size = "1024x1024"

    prompt = product.custom_prompt
    if (product.safety_level or "").lower() == "block_all":
        prompt = f"{prompt}\n\nDo not generate any people or faces."

    data = {
        "model": DEPLOYMENT_NAME,
        "prompt": prompt,
        "n": str(product.n),
        "size": size,
        "quality": quality,
        "input_fidelity": "high"
    }


    async with httpx.AsyncClient(timeout=120.0) as client:
        with open(clean_path, "rb") as img_file:
            files = {"image[]": (os.path.basename(clean_path), img_file, "image/jpeg")}
            if mask_path:
                with open(mask_path, "rb") as m_file:
                    files["mask"] = (os.path.basename(mask_path), m_file, "image/png")
                    resp = await client.post(edit_url, headers=headers, data=data, files=files)
            else:
                resp = await client.post(edit_url, headers=headers, data=data, files=files)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    result = resp.json()
    images = [f"data:image/png;base64,{item['b64_json']}" for item in result.get("data", [])]
    return {"images": images}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)