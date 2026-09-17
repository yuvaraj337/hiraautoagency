import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
urls = [
    'https://www.yamaha-motor-india.com/motorcycle-aerox.html',
    'https://www.yamaha-motor-india.com/yamaha-ray-zr-street-rally.html',
    'https://www.yamaha-motor-india.com/yamaha-fascino-125-fi-hybrid.html',
    'https://www.yamaha-motor-india.com/yamaha-fzs-fi-ver-4.html',
    'https://www.yamaha-motor-india.com/yamaha-fzx.html'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:webp|png|jpg)', html)
            print(f"=== {u} ({len(imgs)} imgs) ===")
            for img in imgs:
                if any(x in img.lower() for x in ['color', 'banner', 'pc.webp', 'aerox', 'ray', 'fascino', 'fzs', 'fzx']):
                    print("  ", img)
    except Exception as e:
        print(f"Error {u}: {e}")
