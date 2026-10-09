#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tự động đẩy toàn bộ source code lên GitHub repository thông qua GitHub REST API.
Repository mục tiêu: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
Tác giả: Duyzoz
"""

import os
import sys
import base64
import json
import urllib.request
import urllib.error
import ssl

# Bỏ qua kiểm tra chứng chỉ SSL do Python trên Windows thiếu local CA certificates
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

REPO_OWNER = "duyzoz"
REPO_NAME = "BYPASS-ALL-IN-ONE"
API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"

# Danh sách file cần đẩy lên GitHub
FILES_TO_PUSH = [
    "README.md",
    "package.json",
    "bypass_hud.user.js",
    "Auto_LaymaV2.user.js",
    "bypass_tool.js",
    "bypass_tool.py",
    "push_to_github.py"
]

def get_file_sha(filepath, token):
    """Kiểm tra xem file đã tồn tại trên repo chưa để lấy SHA"""
    url = f"{API_BASE}/contents/{filepath}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Duyzoz-Push-Script"
    })
    try:
        with urllib.request.urlopen(req, context=ssl_ctx) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get("sha")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        print(f"Lỗi kiểm tra {filepath}: HTTP {e.code} - {e.reason}")
        return None
    except Exception as e:
        return None

def push_file(filepath, token):
    """Đẩy từng file lên repo bằng GitHub Contents API"""
    if not os.path.exists(filepath):
        print(f"⚠️ Bỏ qua: File không tồn tại tại local: {filepath}")
        return False

    with open(filepath, "rb") as f:
        content_bytes = f.read()
    
    content_b64 = base64.b64encode(content_bytes).decode('utf-8')
    sha = get_file_sha(filepath, token)

    payload = {
        "message": f"Update {filepath} - Duyzoz Bypass All in One v3.8.0 (Tampermonkey clean metadata fix & Auto-Bypass LayMa)",
        "content": content_b64,
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha

    url = f"{API_BASE}/contents/{filepath}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "Duyzoz-Push-Script"
        }
    )

    try:
        with urllib.request.urlopen(req, context=ssl_ctx) as resp:
            if resp.status in (200, 201):
                status_str = "Tạo mới" if resp.status == 201 else "Cập nhật"
                print(f"✅ {status_str} thành công: {filepath}")
                return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8', errors='ignore')
        print(f"❌ Lỗi đẩy {filepath}: HTTP {e.code} - {err_msg}")
        return False
    except Exception as e:
        print(f"❌ Lỗi ngoại lệ: {e}")
        return False

def main():
    print("=" * 60)
    print("    GITHUB REST API PUSH TOOL")
    print(f"    Target: https://github.com/{REPO_OWNER}/{REPO_NAME}")
    print("=" * 60)

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token and os.path.exists(".token"):
        with open(".token", "r", encoding="utf-8") as f:
            token = f.read().strip()

    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("\n🔑 Vui lòng nhập GitHub Personal Access Token (PAT) có quyền 'repo':")
        print("(Tạo token tại: https://github.com/settings/tokens/new với quyền 'repo')")
        token = input("Token: ").strip()

    if not token:
        print("❌ Không có token, hủy thao tác.")
        sys.exit(1)

    print("\n🚀 Bắt đầu quá trình đẩy file lên GitHub...")
    success_count = 0
    for filename in FILES_TO_PUSH:
        if push_file(filename, token):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"🎉 Hoàn tất! Đã đẩy thành công {success_count}/{len(FILES_TO_PUSH)} files lên:")
    print(f"👉 https://github.com/{REPO_OWNER}/{REPO_NAME}")
    print("=" * 60)

if __name__ == "__main__":
    main()
