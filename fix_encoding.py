import os

path = r"D:\Antigravity\抽抽樂大轉盤\src\index.css"

try:
    # Try reading as UTF-8 first
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print("Read as UTF-8 success.")
except UnicodeDecodeError:
    print("UTF-8 read failed, trying cp950 (Big5)...")
    # If failed, try local encoding (likely Big5/CP950 on TW Windows or maybe CP1252)
    try:
        with open(path, 'r', encoding='cp950') as f:
            content = f.read()
        print("Read as CP950 success.")
    except:
        print("CP950 failed, trying latin-1...")
        with open(path, 'r', encoding='latin-1') as f:
            content = f.read()
        print("Read as Latin-1 success.")

# Write back as nice clean UTF-8
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully re-wrote {path} as UTF-8.")
