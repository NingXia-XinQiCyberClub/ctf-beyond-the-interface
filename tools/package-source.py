from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

workspace = Path(__file__).resolve().parent.parent
source = workspace
destination = workspace / 'outputs' / '表面之下-第二版-完整源工程.zip'
excluded = {'node_modules', 'dist', 'build', 'qa', '.git', '.cache', '.remotion', 'outputs', 'release-assets', 'references'}
files = []
for path in source.rglob('*'):
    relative = path.relative_to(source)
    if not path.is_file() or any(part in excluded for part in relative.parts):
        continue
    if path.name.startswith('.env') or path.suffix == '.log' or path.name == 'PROJECT_STATUS.md':
        continue
    files.append(path)
with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(files):
        archive.write(path, Path('ctf-beyond-the-interface') / path.relative_to(source))
print(f'{len(files)} files; {destination.stat().st_size:,} bytes')
print(destination)
