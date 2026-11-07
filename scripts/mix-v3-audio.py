"""Arrange approved ACE-Step C music and independent, deterministic UI foley.

Inputs in public/music/ are actual ACE-Step outputs; this script does not
synthesize replacement background music. Python 3 + numpy are required.
"""
from pathlib import Path
import json, os, shutil, subprocess, wave
import numpy as np
from foley import add_foley

ROOT=Path(__file__).resolve().parents[1]
SR=48000; N=150*SR
OUT=ROOT/'public'; QA=ROOT/'outputs'; QA.mkdir(exist_ok=True)
native=ROOT/('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe' if os.name=='nt' else 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg')
ff=Path(shutil.which('ffmpeg') or str(native))
def read(path):
    with wave.open(str(path),'rb') as w:
        assert (w.getframerate(),w.getnchannels(),w.getsampwidth())==(SR,2,2)
        return np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).astype(np.float32)/32768
def write(path,data):
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(np.round(np.clip(data,-.9999,.9999)*32767).astype('<i2').tobytes())
def filter_audio(data, cutoff):
    freq=np.fft.rfftfreq(len(data),1/SR)
    return np.fft.irfft(np.fft.rfft(data,axis=0)/((1+(freq/cutoff)**8)**.5)[:,None],n=len(data),axis=0).astype(np.float32)
theme=read(OUT/'music/C-theme.wav'); extended=read(OUT/'music/C-extended.wav'); blue=read(OUT/'music/C-blue.wav')
music=np.zeros((N,2),np.float32); sfx=np.zeros_like(music); edits=[]
def section(source,start,duration,offset=0,gain=1,fade=.04,cutoff=None):
    length=round(duration*SR); data=source[round(offset*SR):round(offset*SR)+length].copy()
    assert len(data)==length,(start,duration,offset,len(data))
    if cutoff: data=filter_audio(data,cutoff)
    edge=min(round(fade*SR),len(data)//2)
    if edge:
        data[:edge]*=np.sin(np.linspace(0,np.pi/2,edge))[:,None]
        data[-edge:]*=np.cos(np.linspace(0,np.pi/2,edge))[:,None]
    at=round(start*SR); music[at:at+length]+=data*gain
    edits.append(dict(start=start,duration=duration,source='C-extended' if source is extended else 'C-blue' if source is blue else 'C-theme',sourceOffset=offset,gain=gain,lowpassHz=cutoff))

# Continuous C-derived development for the entire CTF chapter.
section(extended,0,86.1,0,.85,.12)
music[:6*SR]*=np.linspace(.22,.88,6*SR)[:,None]
# Keep the one-second submission wait audible as silence around the click.
section(theme,86,2.25,24,.09,.15,1200)
section(theme,88.3,2.25,8,.96,.025)
# Invitation: lower the drum content and preserve room for reading and UI cues.
section(blue,90,8.05,0,.23,.25,1200)
# Same melodic identity, red low-end vs blue clean answering phrases.
section(theme,98,10.15,0,.90,.05)
section(blue,108,4.15,10,.84,.08)
section(extended,112,5.15,48,.96,.08)
section(blue,117,5.05,16,.92,.06)
section(blue,122.22,4.93,21,.64,.08)
section(blue,127,5.15,5,.55,.10,3200)
section(theme,132,4.15,16,.72,.10)
section(blue,136,4.10,24,.48,.10,2400)
section(theme,140,10,22,1.02,.10)
music[round(148.6*SR):]*=np.linspace(1,0,N-round(148.6*SR))[:,None]

rng=np.random.default_rng(45307)
def tone(kind):
    duration={'click':.065,'lock':.20,'drop':.5,'breach':.36,'success':.45,'failure':.35,'final':.9,'coda':1.4,'email':.8,'alert':.6,'block':.25,'close':.45}[kind]
    t=np.arange(round(duration*SR))/SR; end=np.minimum(1,(duration-t)/.025); attack=np.minimum(1,t/.004)
    noise=rng.standard_normal(len(t)); sound=np.zeros(len(t))
    if kind=='click': sound=(np.sin(2*np.pi*1700*t)*.3+noise*.24)*np.exp(-t*85)
    elif kind in ['drop','breach','failure','block']:
        phase=2*np.pi*(44*t+70*.055*(1-np.exp(-t/.055)))
        sound=np.sin(phase)*np.exp(-t*11)*.7+noise*np.exp(-t*55)*.13
        if kind=='failure': sound+=np.sin(2*np.pi*106*t)*np.exp(-t*15)*.25
    elif kind in ['success','final','coda']:
        for i,freq in enumerate([587.33,698.46,880,1174.66]):
            age=np.maximum(0,t-i*.055); sound+=np.sin(2*np.pi*freq*age)*(t>=i*.055)*np.exp(-age*(4 if kind=='coda' else 8))*.10
    elif kind=='email':
        for at,freq in [(0,880),(.14,1174.66)]:
            age=np.maximum(0,t-at)
            sound+=(np.sin(2*np.pi*freq*age)+.18*np.sin(2*np.pi*freq*2*age))*(t>=at)*np.exp(-age*9)*.34
    elif kind=='alert':
        for at in [0,.18]:
            age=np.maximum(0,t-at); sound+=np.sin(2*np.pi*740*age)*(t>=at)*np.exp(-age*24)*.24
    elif kind=='close': sound=np.sin(2*np.pi*(540*t-160*t*t))*np.exp(-t*11)*.24
    else: sound=(np.sin(2*np.pi*980*t)+np.sin(2*np.pi*1470*t))*.12*np.exp(-t*20)
    sound*=attack*end
    return np.column_stack([sound,sound]).astype(np.float32)
cues=json.loads((ROOT/'src/data/attack-cues.json').read_text(encoding='utf8'))
for cue in cues['events']:
    sound=tone(cue['kind'])*cue['power']*.48
    at=round(cue['time']*SR); count=min(len(sound),N-at); sfx[at:at+count]+=sound[:count]
    # Only a brief, modest dip where informational sounds need clarity.
    if cue['time']>=90 and cue['kind'] in ['email','alert','block','success','close']:
        size=min(round(.28*SR),N-at); env=1-.28*np.sin(np.linspace(0,np.pi,size))
        music[at:at+size]*=env[:,None]

extra_foley,foley_schedule=add_foley(ROOT,SR,sfx)
write(QA/'sfx-upgrade/additional-foley.wav',extra_foley)
# The existing score edits and its existing gain envelope above stay identical.
baseline=QA/'sfx-upgrade/original-music.wav'
if baseline.exists():
    assert np.array_equal(np.round(np.clip(music,-.9999,.9999)*32767).astype('<i2'),
                          np.round(read(baseline)*32768).astype('<i2')), 'BGM changed'
premix=music+sfx
if np.max(np.abs(premix))>.94: premix*=.94/np.max(np.abs(premix))
temp=QA/'v3-audio-premix.wav'; write(temp,premix)
target=OUT/'soundtrack-v3.wav'
cmd=[str(ff),'-hide_banner','-loglevel','info','-i',str(temp),'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-ar',str(SR),'-ac','2','-c:a','pcm_s16le','-y',str(target)]
run=subprocess.run(cmd,capture_output=True,text=True,encoding='utf8',errors='replace',check=True)
(QA/'v3-audio-normalization.txt').write_text(run.stderr,encoding='utf8')
write(QA/'v3-music-only.wav',music); write(QA/'v3-sfx-only.wav',sfx)
manifest=dict(selectedSample='C / 红蓝交锋',model='ACE-Step 1.5 turbo',requestedBpm=150,requestedKey='D minor',duration=150,sampleRate=SR,edits=edits,events=cues['events'],music='ACE-Step generated; source-derived repaint and cover',sfx='Original deterministic procedural foley, separate from music',normalizationTarget=dict(integratedLUFS=-16,truePeakDb=-1.5))
manifest['additionalFoley']=foley_schedule
manifest['bgmArrangementUnchanged']=True
(OUT/'music/production-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print('C-derived score mixed:',target)
