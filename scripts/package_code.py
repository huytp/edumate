import os
import zipfile

def package_code():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(root_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    zip_path_public = os.path.join(public_dir, 'edumate-source-code.zip')
    zip_path_root = os.path.join(root_dir, 'edumate-source-code.zip')

    included_dirs = ['src']
    included_files = [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'index.html',
        'metadata.json',
        '.env.example',
        'README.md',
    ]

    for target_zip in [zip_path_public, zip_path_root]:
        print(f"Creating zip at {target_zip}...")
        with zipfile.ZipFile(target_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add top-level files
            for file_name in included_files:
                full_path = os.path.join(root_dir, file_name)
                if os.path.isfile(full_path):
                    zf.write(full_path, arcname=f"edumate-app/{file_name}")
                    print(f"  Added {file_name}")

            # Add src directory recursively
            for dir_name in included_dirs:
                dir_path = os.path.join(root_dir, dir_name)
                if os.path.isdir(dir_path):
                    for root, dirs, files in os.walk(dir_path):
                        for file in files:
                            if file.endswith('.DS_Store') or '__pycache__' in root:
                                continue
                            abs_file = os.path.join(root, file)
                            rel_file = os.path.relpath(abs_file, root_dir)
                            zf.write(abs_file, arcname=f"edumate-app/{rel_file}")
                            print(f"  Added {rel_file}")

    print("Packaging completed successfully!")

if __name__ == '__main__':
    package_code()
