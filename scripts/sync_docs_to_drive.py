#!/usr/bin/env python3
"""Upload selected repo files to a Google Drive folder. GitHub is source of truth."""
import json
import os
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_ID = os.environ["GOOGLE_DRIVE_FOLDER_ID"]
INCLUDE = {".md", ".csv", ".html", ".txt"}
SKIP_DIRS = {".git", ".github", "scripts", "node_modules"}


def service():
    info = json.loads(os.environ["GDRIVE_SERVICE_ACCOUNT_JSON"])
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def list_repo_files():
    root = Path(".")
    files = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() not in INCLUDE:
            continue
        files.append(path)
    return files


def find_existing(drive, name):
    q = (
        f"name = '{name.replace(chr(39), chr(92)+chr(39))}' "
        f"and '{FOLDER_ID}' in parents and trashed = false"
    )
    res = drive.files().list(q=q, fields="files(id,name)", pageSize=10, supportsAllDrives=True).execute()
    files = res.get("files", [])
    return files[0]["id"] if files else None


def main():
    drive = service()
    uploaded = []
    for path in list_repo_files():
        name = path.name
        file_id = find_existing(drive, name)
        media = MediaFileUpload(str(path), resumable=False)
        body = {"name": name, "parents": [FOLDER_ID]}
        if file_id:
            drive.files().update(fileId=file_id, media_body=media, supportsAllDrives=True).execute()
            uploaded.append(f"update {name}")
        else:
            drive.files().create(body=body, media_body=media, fields="id", supportsAllDrives=True).execute()
            uploaded.append(f"create {name}")
    print("\n".join(uploaded) if uploaded else "no files")


if __name__ == "__main__":
    main()
