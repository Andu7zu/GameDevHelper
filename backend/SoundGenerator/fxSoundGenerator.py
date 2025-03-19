import torch
import soundfile as sf
from diffusers import StableAudioPipeline
import os

def generate_audio(prompt, name, num_of_steps=500, duration=5):
    """
    Generate audio using Stable Audio Pipeline.
    
    Args:
        prompt (str): Text description of the desired audio
        name (str): Name of the output file (without extension)
        num_of_steps (int): Number of inference steps (default: 500)
        duration (int): Duration of audio in seconds (default: 5)
    
    Returns:
        str: Path to the generated audio file
    """
    # Ensure the Sounds directory exists
    os.makedirs("Sounds", exist_ok=True)
    
    pipe = StableAudioPipeline.from_pretrained("stabilityai/stable-audio-open-1.0", torch_dtype=torch.float32)
    pipe = pipe.to("cuda")
    
    negative_prompt = "Low quality."
    generator = torch.Generator("cuda").manual_seed(0)
    
    audio = pipe(
        prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=num_of_steps,
        audio_end_in_s=duration,
        num_waveforms_per_prompt=1,
        generator=generator,
    ).audios

    output = audio[0].T.float().cpu().numpy()
    output_path = os.path.join("Sounds", f"{name}.wav")
    sf.write(output_path, output, pipe.vae.sampling_rate)
    
    return output_path

# Example usage:
if __name__ == "__main__":
    prompt = "The sound of a parrot from multiple locations (Closer and further away)"
    output_file = generate_audio(prompt, name="parrot_sounds", num_of_steps=500, duration=5)
    print(f"Audio generated at: {output_file}")