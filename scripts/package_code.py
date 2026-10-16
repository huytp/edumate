"""Packages the full EduMate source (frontend + Rails backend + Docker setup) into a zip.

Used by Dockerfile.prod so the "Tải mã nguồn" download always matches the deployed code.
Run locally with: npm run package:zip   (writes public/edumate-source-code.zip)
"""
import argparse
import fnmatch
import os
import zipfile

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVE_ROOT = 'edumate-app'

# Never ship secrets, dependencies, build output or runtime files.
EXCLUDED_DIRS = {
    '.git', 'node_modules', 'dist', 'coverage', '__pycache__', '.bundle',
    'backend/log', 'backend/tmp', 'backend/storage', 'backend/vendor/bundle',
}
EXCLUDED_FILES = [
    '.env', '.env.*', '*.zip', '*.log', '.DS_Store', 'master.key', '*.key', 'bun.lock',
]
ALLOWED_ENV_FILES = {'.env.example', '.env.production.example'}


def is_excluded(rel_path):
    parts = rel_path.split(os.sep)
    for i in range(1, len(parts) + 1):
        if '/'.join(parts[:i]) in EXCLUDED_DIRS or parts[i - 1] in EXCLUDED_DIRS:
            return True
    name = parts[-1]
    if name in ALLOWED_ENV_FILES:
        return False
    return any(fnmatch.fnmatch(name, pattern) for pattern in EXCLUDED_FILES)


def package_code(output):
    os.makedirs(os.path.dirname(output), exist_ok=True)
    count = 0
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(ROOT_DIR):
            rel_root = os.path.relpath(root, ROOT_DIR)
            dirs[:] = sorted(d for d in dirs if not is_excluded(os.path.normpath(os.path.join(rel_root, d))))
            for file in sorted(files):
                rel_file = os.path.normpath(os.path.join(rel_root, file))
                if is_excluded(rel_file):
                    continue
                zf.write(os.path.join(root, file), arcname=f'{ARCHIVE_ROOT}/{rel_file}')
                count += 1
    print(f'Packaged {count} files into {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default=os.path.join(ROOT_DIR, 'public', 'edumate-source-code.zip'))
    package_code(parser.parse_args().output)
