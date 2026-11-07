"""Check the encoded deliverable rather than relying only on the source render."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

root = Path(__file__).resolve().parent.parent
video = root / 'dist' / 'beyond-the-interface-v2-1080p.mp4'
bin_dir = root / 'node_modules' / '@remotion' / 'compositor-win32-x64-msvc'
probe = json.loads(subprocess.check_output([
    str(bin_dir / 'ffprobe.exe'), '-v', 'error', '-show_streams', '-show_format',
    '-of', 'json', str(video)
], encoding='utf-8'))
picture = next(s for s in probe['streams'] if s['codec_type'] == 'video')
audio = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert picture['codec_name'] == 'h264'
assert (picture['width'], picture['height']) == (1920, 1080)
assert picture['r_frame_rate'] == '30/1'
assert int(picture['nb_frames']) == 4500
assert abs(float(picture['duration']) - 150) < 0.01
# Remotion's JPEG capture path may signal full-range 4:2:0 (also used by V1).
assert picture['pix_fmt'] in ('yuv420p', 'yuvj420p')
assert audio['codec_name'] == 'aac' and int(audio['sample_rate']) == 48000
assert audio['channels'] == 2
assert abs(float(audio['duration']) - 150) < 0.1

encoded_qr_frame = root / 'qa' / 'encoded-v2-outro.png'
subprocess.run([
    str(bin_dir / 'ffmpeg.exe'), '-hide_banner', '-loglevel', 'error',
    '-ss', '149', '-i', str(video), '-frames:v', '1', '-y', str(encoded_qr_frame)
], check=True)
subprocess.run(['node', str(root / 'tools' / 'check-qr.cjs'), str(encoded_qr_frame)], check=True)

deliverable = root / 'outputs' / '表面之下-CTF宣传片-第二版.mp4'
shutil.copy2(video, deliverable)
shutil.copy2(root / 'public' / 'cover.jpg', root / 'outputs' / '表面之下-第二版-封面.jpg')
sha = hashlib.sha256(video.read_bytes()).hexdigest()
report = {
    'version': '2.0.0', 'video': deliverable.name,
    'sha256': sha, 'bytes': video.stat().st_size,
    'width': picture['width'], 'height': picture['height'],
    'fps': 30, 'frames': 4500, 'videoDurationSeconds': float(picture['duration']),
    'audioDurationSeconds': float(audio['duration']),
    'codec': 'H.264 / AAC', 'pixelFormat': picture['pix_fmt'],
    'qrDecodedFromEncodedMp4': 'https://ningxia-xinqicyberclub.github.io/',
    'slogan': '见微知隙，破阵无声。', 'logo': 'public/logo.svg',
    'logoApprovedByUser': True,
    'submitSeconds': 137.3, 'correctSeconds': 138.3, 'firstBloodSeconds': 138.8,
}
(root / 'outputs' / 'v2-verification.json').write_bytes((json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
print(json.dumps(report, ensure_ascii=False, indent=2))
