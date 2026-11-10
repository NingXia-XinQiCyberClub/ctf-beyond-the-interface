"""Three timed warning pulses; preserve the existing soundtrack underneath."""
import json,wave
import numpy as np

def apply(root,target,sr):
    data=json.loads((root/'src/data/range-warnings.json').read_text(encoding='utf8'))
    with wave.open(str(target),'rb') as w:
        base=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).copy()
    mix=base.astype(np.int32); audit=[]
    for event in data['events']:
        for offset in data['beeps']:
            frame=round((event['time']+offset)*30); at=frame*(sr//30)
            t=np.arange(round(.09*sr))/sr
            env=np.minimum(1,t/.005)*np.minimum(1,(.09-t)/.014)
            sound=(np.sin(2*np.pi*880*t)+.22*np.sin(2*np.pi*1760*t))*env*.09
            delta=np.column_stack([sound,sound])*32768
            region=mix[at:at+len(t)]; nonzero=np.abs(delta)>.001
            room=np.where(delta>0,29000-region,29000+region)
            gain=max(0,min(1,float(np.min(room[nonzero]/np.abs(delta[nonzero])))))
            region+=np.round(delta*gain).astype(np.int32)
            audit.append(dict(frame=frame,time=frame/30,label=event['title'],gain=gain))
    assert np.array_equal(base[:98*sr],mix[:98*sr]) and np.array_equal(base[133*sr:],mix[133*sr:])
    with wave.open(str(target),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(mix.astype('<i2').tobytes())
    return audit
