"""Package the checked-in, free fan release with standard-library tooling."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
public = root / 'public'
module = public / 'campaigns/message-in-a-bottle-module'
out = public / 'downloads/message-in-a-bottle-free-module.zip'
files = sorted(module.rglob('*')) + [public / 'downloads' / name for name in (
    'message-in-a-bottle-module.pdf', 'message-in-a-bottle-player-handouts.pdf')]
readme = '''MESSAGE IN A BOTTLE - FREE FAN EDITION 0.1

Start with downloads/message-in-a-bottle-module.pdf. It contains the full
GM campaign and spoilers. Distribute handout pages only when directed.
Requires Savage Worlds Adventure Edition core rules. Unplaytested.

The complete module is also readable offline in
campaigns/message-in-a-bottle-module/module.html.

The interactive GM runner needs a web server rather than opening its file
directly. Use the hosted runner at:
https://work.thearcades.me/campaigns/message-in-a-bottle-module/
It saves notes and progress on the current browser and device.

The Markdown and session JSON are included for personal table preparation.
Fan notice and AI disclosure are in the module's credits.
'''
with ZipFile(out, 'w', ZIP_DEFLATED, compresslevel=9) as z:
    for file in files:
        if file.is_file():
            z.writestr(str(file.relative_to(public)), file.read_bytes())
    z.writestr('START-HERE.txt', readme)
print(f'Packaged {out.name}: {out.stat().st_size:,} bytes')
