import requests

from PIL import Image
from transformers import AutoProcessor, AutoModelForVision2Seq


def imageToText(image_url, prompt):
    model = AutoModelForVision2Seq.from_pretrained("microsoft/kosmos-2-patch14-224")
    processor = AutoProcessor.from_pretrained("microsoft/kosmos-2-patch14-224")

    # prompt = "<grounding>What's the sound like in a scene like this?"
    prompt_prefix = "<grounding>"
    final_prompt = prompt_prefix + " " + prompt

    # url = "https://i0.wp.com/picjumbo.com/wp-content/uploads/digital-art-dark-natural-scenery-with-a-large-sun-and-another-planet-free-image.jpeg?w=600&quality=80"
    image = Image.open(requests.get(image_url, stream=True).raw)

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
