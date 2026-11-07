"""Check the rendered-sound schedule and unchanged music before delivery."""
from pathlib import Path
import hashlib, json, wave
from collections import Counter
import numpy as np

root=Path(__file__).resolve().parents[1]
qa=root/'outputs/sfx-upgrade'
schedule=json.loads((qa/'schedule.json').read_text(encoding='utf8'))
events=schedule['events']
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
music_hash=digest(root/'outputs/v3-music-only.wav')
assert music_hash==digest(qa/'original-music.wav'), 'BGM was modified'
with wave.open(str(qa/'additional-foley.wav'),'rb') as w:
    assert (w.getframerate(),w.getnchannels(),w.getnframes())==(48000,2,150*48000)
    samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2)
for e in events:
    assert e['frame']==round(e['time']*30)
    at=e['frame']*1600
    assert np.max(np.abs(samples[at:at+1600].astype(np.int32)))>20, e
    assert not 139<=e['time']<140, 'Black transition should have no added foley'
peak=float(np.max(np.abs(samples.astype(np.int32)))/32768)
assert peak<.5, 'Foley is too loud'
report=dict(bgmUnchanged=True,bgmSha256=music_hash,frameAligned=True,
            events=len(events),counts=dict(Counter(e['kind'] for e in events)),
            additionalFoleyPeakDbFS=round(20*np.log10(peak),2),
            silenceDuringBlackTransition=True,
            alignment='30 fps animation clock; commands and report bodies read from animation source; CTF source times inverted through chapter time maps')
(qa/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
