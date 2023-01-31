# Koord2ool

Koord2ool is an extension of [LimeSurvey](https://github.com/LimeSurvey/LimeSurvey) that visualizes responses to surveys
over time.

The original tool was developed within the scope of [ACCSA](https://projekte.ffg.at/projekt/2742376) (Austrian Cyber Crisis
Support Activities), a research project funded by the [FFG](https://www.ffg.at/) (Forschungsförderungsgesellschaft).
The project has been improved in some regards within the scope of AWAKE.

## Quick Start

```bash
# Download compose.yml
curl -fsSL https://raw.githubusercontent.com/ait-cs-IaaS/koord2ool/main/compose-dev.yml -O compose.yml

# Start all services
docker-compose up -d
```

![image](https://user-images.githubusercontent.com/6696618/215826266-70e2a176-5367-42d7-8127-a82a7d85df9b.png)

## Deployment

There are multiple ways to deploy Koord2ool, the easiest one is via the [compose-dev.yml](compose-dev.yml) as described in [Quckstart](#quick-start).
For a production deployment a seperate LimeSurvey instance and the [compose.yml](compose.yml) should be considered.

There is a [Dockerfile](Dockerfile) that can be built and deployed, which is automatically packaged as a Container Image via a CI/CD pipeline, specifically a [GitHub Action](.github/workflows/cicd.yaml).
The resulting artifact is then published to the GitHub Container Registry: `docker pull ghcr.io/ait-cs-iaas/koord2ool:latest`

### Build From Source

Koord2ool can also be built from source, following steps are necesarry.

- Node 16 is required. Node v17+ works but may need `NODE_OPTIONS=--openssl-legacy-provider` set as an env var.
- Run `npm install`.Optionally set `VUE_APP_LIMESURVEY_API` and install dependencies with npm install.
- Run `npm run build`. Generated files are available in the dist folder and can be pushed to the web server.
- Server files from `dist` folder with any web server (e.g., nginx)
- Install and Configure LimeSurvey
- Login with LimeSurvey Credentials

## LimeSurvey

You will need to install [LimeSurvey](https://www.limesurvey.org/) which is an open-source questionnaire tool.
Please refer to its documentation regarding deployment.

Cross-Origin Resource Sharing headers *need* to be set, e.g.:

```

Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: POST
Access-Control-Allow-Origin:*

```

In hardened environments, it is advisable to restrict CORS headers further, in particular
[`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).

You must enable the remote procedure call interface in the administrative settings of LimeSurvey.
For Development there is a helper script for activating the endpoint under [dev/activate_rpc](dev/activate_rpc).
Take note of the URL where this endpoint is exposed, e.g. `https://limesurvey.example.com/admin/remotecontrol`.

## How to Use

### Creating a Survey

Create a survey in LimeSurvey as described in the [LimeSurvey documentation](https://manual.limesurvey.org/Surveys_-_introduction).
Note that you need to have the survey in closed-access mode so that individual answers
can be associated with a source.

If you want to be able to allow users to update their responses, set the following options
in "Participants settings":

- "Allow multiple responses or update responses with one access code" should be ON, and
- "Enable participant-based response persistence" should be ON as well.

**Important:** You must turn "Anonymized responses" *off*, and turn "Date stamp" *on*.
Otherwise, LimeSurvey will not store submission times and sets it to January 1, 1980.

### Changing a Survey

Note that if you change a survey, you *may* lose data.
LimeSurvey can only restore already submitted responses if they appear compatible to the then-changed survey.
This is a limitation of LimeSurvey and cannot be avoided.

If you are changing an already active survey, use the following approach:

  1. stop the survey: this will prompt LimeSurvey to move already submitted responses to an archive.
  2. apply changes to the survey as needed.
  3. re-activate the survey. You can now restore previous participant tokens and responses.
      - you can restore previous participants using the "Survey participants" menu item.
      - you may be able to restore previous responses by using the "Import responses from a deactivated survey table" menu item.

## Contributors

Have a look at our [Contribution guidelines](https://github.com/ait-cs-IaaS/.github/blob/master/CONTRIBUTING.md) tips on how to contribute.

- **Martin Galusinski**: [inert]
- **Manuel Warum**: [inert]
- **Benjamin Akhras**: [active]

### EU Funding

![Co-financed by the Connecting Europe Facility of the European Union](https://ec.europa.eu/inea/sites/default/files/ceflogos/en_horizontal_cef_logo_2.png)
