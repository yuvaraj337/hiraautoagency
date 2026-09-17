import urllib.request
import re
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

pages = {
    'aerox_versions': 'https://www.yamaha-motor-india.com/yamaha-aerox155versions.html',
    'rayzr_rally': 'https://www.yamaha-motor-india.com/yamaha-ray-zrstreetrally125fihybrid.html',
    'rayzr_std': 'https://www.yamaha-motor-india.com/yamaha-ray-zr125fihybrid.html',
    'fascino': 'https://www.yamaha-motor-india.com/yamaha-newfascino125fi.html',
    'xsr155': 'https://www.yamaha-motor-india.com/yamaha-xsr155.html'
}

os.makedirs('public/assets/bikes/clean', exist_ok=True)

for model, url in pages.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for all webp/png/jpg images in img tags or css
            imgs = re.findall(r'["\']([^"\']+\.(?:webp|png|jpg))["\']', html)
            print(f"=== {model} ({len(imgs)} imgs) ===")
            downloaded = 0
            for img in set(imgs):
                if not img.startswith('http'):
                    img = 'https://www.yamaha-motor-india.com' + (img if img.startswith('/') else '/' + img)
                lower = img.lower()
                # filter for bike hero/color shots
                if any(x in lower for x in ['/color/', 'pc.webp', 'banner', '360', 'gallery', 'ver-s', 'versions', 'side', 'front', 'angle']):
                    fname = os.path.basename(img.split('?')[0])
                    out_path = f"public/assets/bikes/clean/{model}_{fname}"
                    try:
                        ireq = urllib.request.Request(img, headers=headers)
                        with urllib.request.urlopen(ireq, timeout=5) as iresp:
                            idata = iresp.read()
                            if len(idata) > 10000: # only keep real images, not tiny icons
                                with open(out_path, 'wb') as f:
                                    f.write(idata)
                                print(f"  Saved {out_path} ({len(idata)} bytes) from {img}")
                                downloaded += 1
                                if downloaded >= 4:
                                    break
                    except Exception as e:
                        pass
    except Exception as e:
        print(f"Error {model}: {e}")

print("Completed official asset retrieval.")
