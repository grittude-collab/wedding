from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np
import os

def webtoon_edit(input_path, output_path):
    img = Image.open(input_path).convert('RGB')

    # ── 1. 미디언 블러 (피부·텍스처 부드럽게 — 웹툰 느낌의 기반)
    img_smooth = img.filter(ImageFilter.MedianFilter(size=5))

    # ── 2. 엣지 추출 (윤곽선)
    edges = img_smooth.convert('L').filter(ImageFilter.FIND_EDGES)
    edges_arr = np.array(edges, dtype=np.float32)
    # 엣지 임계값: 선명한 선만 남김
    edges_arr = np.clip(edges_arr * 2.5, 0, 255)
    edges_norm = edges_arr / 255.0  # 0=엣지, 값클수록 비엣지

    # ── 3. 포스터라이즈 (평면화 → 웹툰의 플랫 컬러)
    img_poster = ImageOps.posterize(img_smooth, 4)

    # ── 4. 채도 낮추기 (흑백에 가깝지만 약간 색감 유지)
    img_desat = ImageEnhance.Color(img_poster).enhance(0.15)

    # ── 5. 밝기 대폭 UP (저승청첩장 탈출 ㅋ)
    img_bright = ImageEnhance.Brightness(img_desat).enhance(1.6)

    # ── 6. 엣지 라인 합성 (어두운 윤곽선 + 밝은 면)
    base_arr = np.array(img_bright, dtype=np.float32)
    # 엣지 있는 곳은 어둡게
    line_mask = 1.0 - np.clip(edges_norm * 0.65, 0, 0.65)
    line_mask = line_mask[:, :, np.newaxis]
    result_arr = np.clip(base_arr * line_mask, 0, 255)

    # ── 7. 블랙 리프트 (완전한 검정 제거 → 만화책 느낌)
    result_arr = result_arr / 255.0 * (240 - 35) + 35
    result_arr = np.clip(result_arr, 0, 255)

    # ── 8. 미세 그레인 (사진 느낌 약간 살림)
    grain = np.random.normal(0, 3, result_arr.shape)
    result_arr = np.clip(result_arr + grain, 0, 255)

    result = Image.fromarray(result_arr.astype(np.uint8))

    # ── 9. 살짝 선예도
    result = result.filter(ImageFilter.UnsharpMask(radius=1.0, percent=90, threshold=5))

    # RGB -> L (흑백 저장)
    result = result.convert('L')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result.save(output_path, quality=93, optimize=True)
    print(f"done: {os.path.basename(output_path)}")


src    = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/image"
dst    = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/assets/images"
dst_g  = r"c:/Users/뉴메드/Desktop/에이전트/mobile_Agent/assets/images/gallery"

webtoon_edit(f"{src}/전신.jpg",  f"{dst}/hero.jpg")
webtoon_edit(f"{src}/전신.jpg",  f"{dst_g}/01.jpg")
webtoon_edit(f"{src}/깍지.jpg",  f"{dst_g}/02.jpg")
webtoon_edit(f"{src}/분위기.jpg",f"{dst_g}/03.jpg")

print("all done")
