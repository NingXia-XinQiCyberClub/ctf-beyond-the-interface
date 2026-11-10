"""Check the narrative flags against the displayed RSA and LSB mechanisms."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'src/data/challenge-flags.json').read_text(encoding='utf8'))
flags=data['flags'];rsa=data['rsa']
assert len(set(flags.values()))==5 and all(f.startswith('flag{') and f.endswith('}') and f!='flag{test}' for f in flags.values())
assert rsa['p']*rsa['q']==rsa['n']
assert rsa['e']*rsa['d']%((rsa['p']-1)*(rsa['q']-1))==1
decoded=''.join(chr(pow(c,rsa['d'],rsa['n'])) for c in rsa['cipher'])
assert decoded==flags['crypto']
assert pow(rsa['cipher'][0],rsa['d'],rsa['n'])==102
bits=[int(bit) for c in flags['misc'] for bit in f'{ord(c):08b}']
assert len(bits)==data['miscBitLength']==200
# The 40x20 procedural image stores its payload in blue-channel parity.
blue=[]
for i in range(800):
    x=i%40;y=i//40
    import math
    land=y>11+math.sin(x*.21)*2+math.cos(x*.48)*1.5
    b=51+math.floor(x*.8) if land else 90+math.floor(y*3.2)
    blue.append(b-b%2+bits[i%len(bits)])
stream=[b&1 for b in blue][:data['miscBitLength']]
hidden=''.join(chr(int(''.join(map(str,stream[i:i+8])),2)) for i in range(0,len(stream),8))
assert hidden==flags['misc']
before=json.loads((root/'outputs/meaningful-flags/audio-before.json').read_text(encoding='utf-8-sig'))['Hash'].lower()
after=hashlib.sha256((root/'public/soundtrack-v3.wav').read_bytes()).hexdigest()
assert before==after,'Soundtrack changed'
report=dict(flags=flags,rsaDecrypted=decoded,miscExtracted=hidden,miscBitLength=len(bits),audioUnchanged=True,audioSha256=after)
(root/'outputs/meaningful-flags/verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,indent=2))
