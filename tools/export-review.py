from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

workspace = Path(__file__).resolve().parent.parent
project = workspace
ffmpeg = project / 'node_modules' / '@remotion' / 'compositor-win32-x64-msvc' / 'ffmpeg.exe'
video = project / 'dist' / 'beyond-the-interface-1080p.mp4'
times = [8, 23, 39, 64, 87, 107, 129, 139.3, 149]
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 19)
sheet = Image.new('RGB', (1728, 1062), '#030711')
draw = ImageDraw.Draw(sheet)
for index, second in enumerate(times):
    frame = project / 'qa' / f'export-{second}.png'
    subprocess.run([str(ffmpeg), '-hide_banner', '-loglevel', 'error', '-ss', str(second), '-i', str(video), '-frames:v', '1', '-y', str(frame)], check=True)
    x, y = (index % 3) * 576, (index // 3) * 354
    sheet.paste(Image.open(frame).convert('RGB').resize((576, 324)), (x, y + 30))
    draw.text((x + 10, y + 5), f'{second:05.1f}s', fill='#b9dfff', font=font)
sheet.save(workspace / 'outputs' / '表面之下-关键帧总览.jpg', quality=94)
print('Nine representative frames extracted from final MP4.')
