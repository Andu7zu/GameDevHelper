from backend.SoundGenerator.fxSoundGenerator import generate_audio


prompt = "In the scene, there is a mountain range with a red moon and a large red sun in the sky. The sound of the mountain range is accompanied by the sound of wind blowing through the trees, creating a serene and peaceful atmosphere. The combination of the red moon and the red sun creates a visually appealing and captivating scene."
output_file = generate_audio(prompt, "DoorBang", num_of_steps=500, duration=5)
print(f"Audio generated at: {output_file}")