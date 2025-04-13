import requests
import base64
import io

from PIL import Image
from transformers import AutoProcessor, AutoModelForVision2Seq


def imageToText(image_data, prompt):
    model = AutoModelForVision2Seq.from_pretrained("microsoft/kosmos-2-patch14-224")
    processor = AutoProcessor.from_pretrained("microsoft/kosmos-2-patch14-224")

    # prompt = "<grounding>What's the sound like in a scene like this?"
    default_prompt = "<grounding>"
    final_prompt = default_prompt + " " + prompt

    # Handle base64 image data
    if image_data.startswith('data:image'):
        # Remove the data URL prefix (e.g., 'data:image/png;base64,')
        base64_data = image_data.split(',')[1]
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        # Create image from bytes
        image = Image.open(io.BytesIO(image_bytes))
    else:
        # Handle regular URLs as before
        image = Image.open(requests.get(image_data, stream=True).raw)

    # The original Kosmos-2 demo saves the image first then reload it. For some images, this will give slightly different image input and change the generation outputs.
    image.save("new_image.jpg")
    image = Image.open("new_image.jpg")

    inputs = processor(text=final_prompt, images=image, return_tensors="pt")

    generated_ids = model.generate(
        pixel_values=inputs["pixel_values"],
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        image_embeds=None,
        image_embeds_position_mask=inputs["image_embeds_position_mask"],
        use_cache=True,
        max_new_tokens=128,
    )
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    # By default, the generated  text is cleanup and the entities are extracted.
    processed_text, entities = processor.post_process_generation(generated_text)

    # Remove the prompt from the processed text
    response = processed_text.replace(prompt, "").strip()
    print(response)
    return response
