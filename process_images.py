from PIL import Image
import os

src = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/image_ai"
dst = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/assets/images"
gal = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/assets/images/gallery"

os.makedirs(gal, exist_ok=True)

files = {
    "Gemini_Generated_Image_h99aeeh99aeeh99a.png": ["hero.jpg", "gallery/01.jpg"],  # 전신
    "Gemini_Generated_Image_6lh4zx6lh4zx6lh4.png": ["gallery/02.jpg"],              # 깍지
    "Gemini_Generated_Image_ewg1ckewg1ckewg1.png":  ["gallery/03.jpg"],             # 분위기
}

for filename, targets in files.items():
    img = Image.open(f"{src}/{filename}").convert("RGB")
    for target in targets:
        out = f"{dst}/{target}"
        os.makedirs(os.path.dirname(out), exist_ok=True)
        img.save(out, "JPEG", quality=95, optimize=True)
        print(f"done: {target}")

print("all done")
