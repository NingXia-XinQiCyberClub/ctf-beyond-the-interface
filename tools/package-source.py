from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os

workspace = Path(__file__).resolve().parent.parent
source = workspace
destination = workspace / 'outputs' / '表面之下-音效增强版-完整源工程.zip'
excluded = {'node_modules', 'dist', 'build', 'qa', '.git', '.cache', '.remotion', 'outputs', 'release-assets', 'references', '__pycache__'}
files = []
for directory, directories, names in os.walk(source):
    directories[:] = [name for name in directories if name not in excluded]
    for name in names:
        path = Path(directory) / name
        relative = path.relative_to(source)
        if path.name.startswith('.env') or path.suffix in {'.log', '.pyc'} or path.name == 'PROJECT_STATUS.md':
            continue
        if relative.as_posix() in {'public/soundtrack.wav', 'public/soundtrack.mp3'}:
            continue
        files.append(path)
with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(files):
        archive.write(path, Path('ctf-beyond-the-interface') / path.relative_to(source))
print(f'{len(files)} files; {destination.stat().st_size:,} bytes')
print(destination)
