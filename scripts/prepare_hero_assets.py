import os
import shutil
from PIL import Image, ImageFilter, ImageEnhance

# 1. Copy generated hero images from artifacts
artifact_dir = r"C:\Users\rayal\.gemini\antigravity-ide\brain\341f5a8b-fa08-4ec9-a52a-3295a81a9058"
dest_dir = r"public/assets/bikes"
os.makedirs(dest_dir, exist_ok=True)

shutil.copy2(os.path.join(artifact_dir, "hero_r15_v4_1789677679762.jpg"), os.path.join(dest_dir, "hero_r15_v4.jpg"))
shutil.copy2(os.path.join(artifact_dir, "hero_mt15_v2_1789677698484.jpg"), os.path.join(dest_dir, "hero_mt15_v2.jpg"))
shutil.copy2(os.path.join(artifact_dir, "hero_fzs_v4_1789677731614.jpg"), os.path.join(dest_dir, "hero_fzs_v4.jpg"))

# 2. Composite Aerox S into the matching dark studio background
# Use the background from hero_r15_v4 or hero_mt15_v2
bg_img = Image.open(os.path.join(dest_dir, "hero_r15_v4.jpg")).convert("RGB")
# create a clean dark moody background by blurring and darkening
bg_studio = bg_img.filter(ImageFilter.GaussianBlur(radius=80))
enhancer = ImageEnhance.Brightness(bg_studio)
bg_studio = enhancer.enhance(0.55)

# Load Aerox S transparent/clean image
aerox_src = Image.open("public/assets/bikes/clean/aerox_versions_Racing-Blue.webp").convert("RGBA")

# Resize Aerox to fit nicely in 1920x1080
w, h = bg_studio.size
aerox_w = int(w * 0.58)
aspect = aerox_src.height / aerox_src.width
aerox_h = int(aerox_w * aspect)
aerox_resized = aerox_src.resize((aerox_w, aerox_h), Image.Resampling.LANCZOS)

# Create ground contact shadow
shadow = Image.new("RGBA", (aerox_w, int(aerox_h * 0.25)), (0, 0, 0, 0))
# Add subtle floor reflection
reflection = aerox_resized.transpose(Image.FLIP_TOP_BOTTOM)
r_enhancer = ImageEnhance.Brightness(reflection)
reflection = r_enhancer.enhance(0.3)
reflection = reflection.filter(ImageFilter.GaussianBlur(radius=6))

# Paste reflection onto studio background
aerox_x = int((w - aerox_w) / 2) + 40
aerox_y = int(h * 0.22)
reflection_y = aerox_y + aerox_h - 25

bg_studio.paste(reflection, (aerox_x, reflection_y), reflection.split()[3])
bg_studio.paste(aerox_resized, (aerox_x, aerox_y), aerox_resized.split()[3])

bg_studio.save(os.path.join(dest_dir, "hero_aerox_s.jpg"), "JPEG", quality=95)
print("Saved hero_aerox_s.jpg matching studio aesthetic!")

# 3. Copy other model clean assets to public/assets/bikes/
shutil.copy2("public/assets/bikes/clean/xsr155_blue.webp", os.path.join(dest_dir, "bike_xsr155.webp"))
shutil.copy2("public/assets/bikes/clean/rayzr_rally_matte_black_lcd.webp", os.path.join(dest_dir, "bike_rayzr.webp"))
shutil.copy2("public/assets/bikes/clean/fascino_vived_red_drum.webp", os.path.join(dest_dir, "bike_fascino.webp"))
shutil.copy2("public/assets/bikes/clean/aerox_versions_Racing-Blue.webp", os.path.join(dest_dir, "bike_aerox.webp"))

print("Hero & Catalog bike assets prepared perfectly!")
