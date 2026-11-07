"""Verify the encoded V3, extract review frames, and copy the deliverable."""
from pathlib import Path
import hashlib, json, os, re, shutil, subprocess
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
video=root/'dist/beyond-the-interface-v3.1-1080p.mp4'
bin_dir=root/'node_modules/@remotion/compositor-win32-x64-msvc'
ff=bin_dir/'ffmpeg.exe'; probe=bin_dir/'ffprobe.exe'
qa=root/'qa'; qa.mkdir(exist_ok=True); outputs=root/'outputs'; outputs.mkdir(exist_ok=True)
meta=json.loads(subprocess.check_output([str(probe),'-v','error','-show_streams','-show_format','-of','json',str(video)],encoding='utf8'))
v=next(s for s in meta['streams'] if s['codec_type']=='video'); a=next(s for s in meta['streams'] if s['codec_type']=='audio')
assert v['codec_name']=='h264' and (v['width'],v['height'])==(1920,1080)
assert v['r_frame_rate']=='30/1' and int(v['nb_frames'])==4500 and abs(float(v['duration'])-150)<.01
assert v['pix_fmt'] in ['yuv420p','yuvj420p']
assert a['codec_name']=='aac' and int(a['sample_rate'])==48000 and a['channels']==2 and abs(float(a['duration'])-150)<.1
subprocess.run([str(ff),'-hide_banner','-loglevel','error','-xerror','-i',str(video),'-c:v','rawvideo','-c:a','pcm_s16le','-f','null','NUL'],check=True)
print('Complete video/audio decode passed.',flush=True)
times=[4,8,89.6,90.8,94,95.5,97.7,100,103.4,105,108.3,110,112.3,114,115.4,117.3,120,122.3,125,127.3,129,132.5,137,149]
sheet=Image.new('RGB',(1920,8*390),'#030711'); draw=ImageDraw.Draw(sheet); font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',21)
for i,t in enumerate(times):
    frame=qa/f'encoded-v3.1-{t}.png'
    subprocess.run([str(ff),'-hide_banner','-loglevel','error','-ss',str(t),'-i',str(video),'-frames:v','1','-y',str(frame)],check=True)
    thumb=Image.open(frame).convert('RGB'); thumb.thumbnail((640,360)); x=(i%3)*640; y=(i//3)*390
    sheet.paste(thumb,(x,y+30)); draw.text((x+12,y+4),f'{t:05.1f}s',font=font,fill='#c0ddf5')
sheet.save(outputs/'表面之下-第三版修订版-关键帧总览.jpg',quality=94)
subprocess.run(['node',str(root/'tools/check-qr.cjs'),str(qa/'encoded-v3.1-149.png')],check=True)
print('Encoded QR and contact sheet ready.',flush=True)
audio_scan=subprocess.run([str(ff),'-hide_banner','-loglevel','info','-i',str(video),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-c:a','pcm_s16le','-f','null','NUL'],capture_output=True,text=True,encoding='utf8',errors='replace',check=True)
block=re.findall(r'\{\s*"input_i".*?\}',audio_scan.stderr,re.S)[-1]; loud=json.loads(block)
(outputs/'v3.1-encoded-audio-analysis.txt').write_text(audio_scan.stderr,encoding='utf8')
assert float(loud['input_tp'])<0
deliverable=outputs/'表面之下-CTF宣传片-第三版修订版.mp4'; shutil.copy2(video,deliverable)
shutil.copy2(root/'public/cover.jpg',outputs/'表面之下-第三版修订版-封面.jpg')
report=dict(version='3.1.0',video=deliverable.name,sha256=hashlib.sha256(video.read_bytes()).hexdigest(),bytes=video.stat().st_size,width=1920,height=1080,fps=30,frames=4500,videoDurationSeconds=float(v['duration']),audioDurationSeconds=float(a['duration']),codec='H.264 / AAC',pixelFormat=v['pix_fmt'],completeDecodePassed=True,qrDecodedFromEncodedMp4='https://ningxia-xinqicyberclub.github.io/',slogan='见微知隙，破阵无声。',logo='public/logo.svg',logoApprovedByUser=True,scriptApprovedByUser=True,musicSelectedByUser='C / 红蓝交锋',musicEngine='ACE-Step 1.5 turbo, local',submitSeconds=87.3,correctSeconds=88.3,firstBloodSeconds=88.8,invitationSeconds=90,rangeSeconds=[98,140],rangeEvidence='src/data/range-evidence.json',integratedLUFS=float(loud['input_i']),truePeakDbTP=float(loud['input_tp']))
(outputs/'v3.1-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
