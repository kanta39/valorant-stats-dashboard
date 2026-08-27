import requests
from backend.config import API_KEY

def fetch_account(name: str, tag: str):
    url = f"https://api.henrikdev.xyz/valorant/v1/account/{name}/{tag}"
    headers = {"Authorization": API_KEY}
    return requests.get(url, headers=headers)

def fetch_mmr(region: str, name: str, tag: str):
    mmr_url = f"https://api.henrikdev.xyz/valorant/v2/mmr/{region}/{name}/{tag}"
    headers = {"Authorization": API_KEY}
    return requests.get(mmr_url, headers=headers)

def fetch_matches(region: str, name: str, tag: str, size: int, mode: str):
    headers = {"Authorization": API_KEY}
    url = f"https://api.henrikdev.xyz/valorant/v3/matches/{region}/{name}/{tag}?size={size}"
    if mode != "All":
        mode_lower = mode.lower()
        url += f"&mode={mode_lower}&filter={mode_lower}"
    return requests.get(url, headers=headers)
