"""Quiet original UI foley. Independent RNG keeps existing cues unchanged."""
import json, subprocess
import numpy as np

def add_foley(root, sr, sfx):
    subprocess.run(['node',str(root/'scripts/foley-schedule.mjs')],cwd=root,check=True)
    schedule=json.loads((root/'outputs/sfx-upgrade/schedule.json').read_text(encoding='utf8'))
    rng=np.random.default_rng(76241)
    stem=np.zeros_like(sfx)
    for e in schedule['events']:
        kind=e['kind']; duration={'key':.038,'scan':.13,'scanDone':.24,'data':.055,'swipe':.6,'panel':.10,'shield':.22}[kind]
        t=np.arange(round(duration*sr))/sr
        noise=rng.standard_normal(len(t))
        if kind=='key':
            # High transient, resonant keycap body, then a softer release.
            freq=rng.uniform(850,1400)
            s=(noise*.36+np.sin(2*np.pi*freq*t)*.24)*np.exp(-t*260)
            s+=np.sin(2*np.pi*rng.uniform(170,290)*t)*np.exp(-t*125)*.4
            release=np.maximum(0,t-.016)
            s+=noise*.09*np.exp(-release*260)*(t>=.016)
            s*=rng.uniform(.075,.105)
        elif kind=='scan':
            s=np.sin(2*np.pi*(1350*t+1800*t*t))*np.exp(-t*30)*.085
        elif kind=='scanDone':
            s=np.zeros(len(t))
            for at,f in [(0,1250),(.075,1668)]:
                age=np.maximum(0,t-at)
                s+=np.sin(2*np.pi*f*age)*(t>=at)*np.exp(-age*26)*.075
        elif kind=='data': s=(np.sin(2*np.pi*2100*t)*.7+noise*.15)*np.exp(-t*95)*.055
        elif kind=='swipe':
            # Air texture with no pitched musical content.
            smooth=np.convolve(noise,np.ones(18)/18,mode='same')
            s=smooth*np.sin(np.pi*t/duration)**2*.14
        elif kind=='panel': s=(noise*.2+np.sin(2*np.pi*620*t))*np.exp(-t*65)*.045
        else: s=(np.sin(2*np.pi*(900*t-850*t*t))*.7+np.sin(2*np.pi*185*t)*.3)*np.exp(-t*20)*.09
        s*=np.minimum(1,t/.0015)*np.minimum(1,(duration-t)/.006)*e['gain']
        pan=e['pan']; stereo=np.column_stack([s*np.sqrt(1-pan),s*np.sqrt(1+pan)])
        at=round(e['frame']*sr/schedule['fps']); count=min(len(s),len(stem)-at)
        stem[at:at+count]+=stereo[:count]
    sfx+=stem
    return stem,schedule
