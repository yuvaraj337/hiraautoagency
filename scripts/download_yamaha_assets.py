import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

test_urls = [
    # Aerox 155 Version S
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155vs/aerox155_vers-sp.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155vs/aerox-color-silver.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155vs/aerox-color-blue.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155vs/aerox-pc.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155/color/silver.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155/color/racing-blue.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/aerox_all/aerox155/color/grey_vermillion.webp',
    # Ray ZR
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/ray_zr/ray-zr-pc.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/ray_zr/color/matte_red.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/ray_zr/color/metallic_black.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/ray_zr_street_rally/color/matte_copper.webp',
    # Fascino
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/fascino/fascino-pc.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/fascino/color/vivid_red.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/fascino/color/cool_blue.webp',
    'https://www.yamaha-motor-india.com/theme/v4/images/webp_images/scooter_all/fascino/color/metallic_black.webp',
]

os.makedirs('public/assets/bikes/official', exist_ok=True)
for u in test_urls:
    fname = u.split('/')[-1]
    folder = u.split('/')[-2]
    out_name = f"{folder}_{fname}"
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            with open(f"public/assets/bikes/official/{out_name}", 'wb') as f:
                f.write(data)
            print(f"SUCCESS: {out_name} ({len(data)} bytes)")
    except Exception as e:
        print(f"FAILED {u}: {e}")
