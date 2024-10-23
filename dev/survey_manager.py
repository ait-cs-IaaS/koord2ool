#!/usr/bin/env python3

import requests
import json
import click
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()

API_URL = os.getenv(
    "LIMESURVEY_RPC_API", "https://your-limesurvey-domain/index.php/admin/remotecontrol"
)
USERNAME = os.getenv("LIME_ADMIN_USER", "admin")
PASSWORD = os.getenv("LIME_ADMIN_PASSWORD", "yourpassword")


def get_session_key():
    payload = {"method": "get_session_key", "params": [USERNAME, PASSWORD], "id": 1}
    response = requests.post(API_URL, json=payload)
    result = response.json()
    if "result" in result:
        return result["result"]
    print("Failed to get session key:", result)
    return None


def send_command(session_key, method_name, params):
    payload = {"method": method_name, "params": [session_key] + params, "id": 1}
    response = requests.post(API_URL, json=payload)
    try:
        return response.json()
    except Exception as e:
        print("Failed to send command:", e)
        print(response.text)


def upload_survey(session_key, survey_id, lsa_file_path):
    with open(lsa_file_path, "rb") as lsa_file:
        files = {"upload": lsa_file}
        payload = {
            "method": "import_archive",
            "params": [session_key, survey_id, "lsa"],
            "id": 1,
        }
        response = requests.post(API_URL, files=files, json=payload)
        return response.json()


def login_to_limesurvey(admin_url, username, password):
    """Log in to LimeSurvey and obtain a session cookie."""
    login_url = f"{admin_url}/index.php/admin/authentication/sa/login"
    payload = {"user": username, "password": password}
    session = requests.Session()
    response = session.post(login_url, data=payload)

    if "PHPSESSID" in session.cookies:
        print("Login successful, session cookie obtained.")
        return session
    else:
        print("Login failed, check credentials.")
        return None


def enable_json_rpc(session, admin_url):
    """Enable JSON-RPC API if it is not enabled, handles CSRF token."""
    globalsettings_url = f"{admin_url}/index.php/admin/globalsettings"

    response = session.get(globalsettings_url)

    if response.status_code != 200:
        print(
            f"Failed to load global settings page. Status code: {response.status_code}"
        )
        return

    soup = BeautifulSoup(response.text, "html.parser")
    csrf_token_input = soup.find("input", {"name": "YII_CSRF_TOKEN"})

    if not csrf_token_input:
        print("Could not find CSRF token in the page.")
        return

    csrf_token = csrf_token_input["value"]  # type: ignore

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "action": "globalsettingssave",
        "RPCInterface": "json",
        "rpc_publish_api": "1",  # Enable API
        "add_access_control_header": "1",  # Optionally add access control header
        "YII_CSRF_TOKEN": csrf_token,  # Include CSRF token in the data
    }

    response = session.post(globalsettings_url, headers=headers, data=data)

    if response.status_code == 200:
        print("Successfully enabled JSON-RPC API.")
    else:
        print(
            f"Failed to enable JSON-RPC API. Status code: {response.status_code}, Message: {response.text}"
        )


@click.group()
def cli():
    """LimeSurvey JSON-RPC Command Line Interface."""
    pass


@cli.command()
@click.option("--method", "-m", required=True, help="JSON-RPC method name")
@click.option(
    "--params", "-p", required=True, help="Parameters for the method, in JSON format"
)
def call(method, params):
    """Send a generic command to LimeSurvey JSON-RPC."""
    session_key = get_session_key()
    if not session_key:
        return

    params = json.loads(params)
    result = send_command(session_key, method, params)
    print(json.dumps(result, indent=2))


@cli.command()
@click.option(
    "--survey-id", "-sid", required=True, help="Survey ID to upload the LSA file to"
)
@click.option(
    "--lsa-file",
    "-f",
    required=True,
    type=click.Path(exists=True),
    help="Path to the LSA file",
)
def upload(survey_id, lsa_file):
    """Upload an LSA file to a survey."""
    session_key = get_session_key()
    if not session_key:
        return

    result = upload_survey(session_key, survey_id, lsa_file)
    print(json.dumps(result, indent=2))


@cli.command()
@click.option("--survey-id", "-sid", required=True, help="Survey ID")
@click.option(
    "--participants", "-p", required=True, help="Participants data in JSON format"
)
def add_participants(survey_id, participants):
    """Add participants to a survey."""
    session_key = get_session_key()
    if not session_key:
        return

    participants_data = json.loads(participants)
    result = send_command(
        session_key, "add_participants", [survey_id, participants_data]
    )
    print(json.dumps(result, indent=2))


@cli.command()
def enable_rpc():
    """Enable the JSON-RPC API in LimeSurvey."""
    admin_url = API_URL.replace("/index.php/admin/remotecontrol", "")
    if session := login_to_limesurvey(admin_url, USERNAME, PASSWORD):
        enable_json_rpc(session, admin_url)


if __name__ == "__main__":
    cli()
