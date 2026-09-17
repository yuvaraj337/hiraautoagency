import os
import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    ('aerox', 'https://www.yamaha-motor-india.com/yamaha-aerox-155-version-s.html'),
    ('bikes', 'https://www.yamaha-motor-india.com/yamaha-bikes.html'),
    ('scooters', 'https://www.yamaha-motor-india.com/yamaha-scooters.html'),
    ('r15', 'https://www.yamaha-motor-india.com/yamaha-r15v4.html'),
    ('mt15', 'https://www.yamaha-motor-india.com/yamaha-mt-15-v2.html'),
    ('xsr', 'https://www.yamaha-motor-india.com/yamaha-fz-x.html')
]

found = {}
for name, u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:webp|png|jpg)', html)
            # filter for motorcycle / color / product images
            bike_imgs = [img for img in imgs if any(k in img.lower() for k in ['color', 'banner', 'product', 'aerox', 'mt', 'r15', 'fzs', 'fz-x', 'ray', 'fascino'])]
            found[name] = bike_imgs
            print(f"Found {len(bike_imgs)} images for {name}")
            for img in bike_imgs[:5]:
                print(f"  {img}")
    except Exception as e:
        print(f"Error {name}: {e}")

print("Done scanning.")
