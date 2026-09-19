import zipfile
import os

zip_path = 'reference/Yamaha_Bikes_PNGs.zip'
mapping = {
    'R-15 V4 (M) Carbon.png': [
        'public/bikes/r15-v4-m-carbon.png',
        'public/bikes/R-15 V4 (M) Carbon.png',
        'public/assets/bikes/r15-v4-m-carbon.png',
        'public/assets/bikes/r15_black.png'
    ],
    'R-15 (M) Silver.png': [
        'public/bikes/r15-m-silver.png',
        'public/bikes/R-15 (M) Silver.png',
        'public/assets/bikes/r15-m-silver.png'
    ],
    'R-15 V4 (Quick Shifter).png': [
        'public/bikes/r15-v4-quick-shifter.png',
        'public/bikes/R-15 V4 (Quick Shifter).png',
        'public/assets/bikes/r15-v4-quick-shifter.png',
        'public/assets/bikes/r15_blue.png'
    ],
    'R-15 V4.png': [
        'public/bikes/r15-v4.png',
        'public/bikes/R-15 V4.png',
        'public/assets/bikes/r15-v4.png',
        'public/assets/bikes/r15_red.png'
    ],
    'R-15 V4 (Monster).png': [
        'public/bikes/r15-v4-monster.png',
        'public/bikes/R-15 V4 (Monster).png',
        'public/assets/bikes/r15-v4-monster.png',
        'public/assets/bikes/r15_cyan.png'
    ],
    'R-15 V3 (S).png': [
        'public/bikes/r15-v3-s.png',
        'public/bikes/R-15 V3 (S).png',
        'public/assets/bikes/r15-v3-s.png'
    ]
}

with zipfile.ZipFile(zip_path, 'r') as z:
    for src_name, dest_paths in mapping.items():
        data = z.read(src_name)
        for dest in dest_paths:
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'wb') as f:
                f.write(data)
            print(f'Wrote {len(data)} bytes to {dest}')
print('ALL_R15_DONE')
