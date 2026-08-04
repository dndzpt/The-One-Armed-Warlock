from pathlib import Path
import sys

from PIL import Image


source_directory = Path(sys.argv[1])
output_directory = Path(sys.argv[2])
output_directory.mkdir(parents=True, exist_ok=True)

for version in range(1, 14):
    source = source_directory / f"The Door That Isn't There v{version}.png"
    destination = output_directory / f"door-{version}.webp"
    with Image.open(source) as image:
        image.convert("RGB").save(destination, "WEBP", quality=84, method=6)
    print(f"{source.name} -> {destination.name}")
