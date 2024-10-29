#!/usr/bin/env python3

import requests
import json
import click
import os
from dotenv import load_dotenv

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


@click.group()
def cli():
    """LimeSurvey JSON-RPC Command Line Interface."""
    pass


@cli.command()
@click.option("--method", "-m", required=True, help="JSON-RPC method name")
@click.option(
    "--params", "-p", default='[]', help="Parameters for the method, in JSON format"
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


if __name__ == "__main__":
    cli()
