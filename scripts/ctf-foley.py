"""Layer CTF-only effects onto the existing mastered score, without remastering."""
import json, wave
import numpy as np

def apply(root, target, sr):
    cues=json.loads((root/'src/data/ctf-action.json').read_text(encoding='utf8'))['events']
    with wave.open(str(target),'rb') as w:
        assert (w.getframerate(),w.getnchannels(),w.getsampwidth())==(sr,2,2)
        base=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).copy()
    mix=base.astype(np.int32)
    rng=np.random.default_rng(67431); audit=[]
    for e in cues:
        kind=e['kind']; duration=.28 if kind=='deny' else .36
        t=np.arange(round(duration*sr))/sr
        noise=rng.standard_normal(len(t))
        if kind=='deny':
            s=(np.sin(2*np.pi*155*t)+.25*np.sin(2*np.pi*310*t))*np.exp(-t*23)*.065
            s+=noise*np.exp(-t*100)*.018
        elif kind=='fracture':
            s=noise*np.exp(-t*36)*.075+np.sin(2*np.pi*(65*t+2*(1-np.exp(-t*24))))*np.exp(-t*18)*.055
        else:
            s=np.sin(2*np.pi*(980*t+650*t*t))*np.exp(-t*26)*.055
        s*=np.minimum(1,t/.002)*np.minimum(1,(duration-t)/.012)*e['gain']
        frame=round(e['time']*30); at=frame*(sr//30)
        delta=np.column_stack([s,s])*32768
        region=mix[at:at+len(s)]
        # Only lower the added effect if needed; never lower or pump the BGM.
        cap=round(.89*32768); nonzero=np.abs(delta)>.001
        room=np.where(delta>0,cap-region,cap+region)
        scale=min(1.,float(np.min(room[nonzero]/np.abs(delta[nonzero]))))
        scale=max(0.,scale)
        region+=np.round(delta*scale).astype(np.int32)
        audit.append(dict(**e,frame=frame,appliedScale=scale))
    assert np.array_equal(mix[86*sr:],base[86*sr:]), 'Protected ending changed'
    assert np.max(np.abs(mix))<32768
    with wave.open(str(target),'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(mix.astype('<i2').tobytes())
    folder=root/'outputs/ctf-action';folder.mkdir(exist_ok=True)
    (folder/'audio-events.json').write_text(json.dumps(audit,indent=2)+'\n',encoding='utf8')
    return audit
