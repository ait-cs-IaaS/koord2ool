# Koord2ool

Koord2ool is an extension of [LimeSurvey](https://github.com/LimeSurvey/LimeSurvey) that visualizes responses to surveys
over time.

The original tool was developed within the scope of [ACCSA](https://projekte.ffg.at/projekt/2742376) (Austrian Cyber Crisis
Support Activities), a research project funded by the FFG (Forschungsförderungsgesellschaft).
The project has been improved in some regards within the scope of AWAKE.

## Deployment

If you want to deploy this application on your own premise, you will need:

- any web server (e.g., nginx) to publish generated files (HTML, JavaScript, CSS),
- a build server with Node v16, and
- a LimeSurvey instance with an appropriate CORS policy.

### LimeSurvey

You will need to install [LimeSurvey](https://www.limesurvey.org/) which is an open-source questionnaire tool.
Please refer to its documentation regarding deployment.

Cross-Origin Resource Sharing headers *need* to be set, e.g.:

```
Access-Control-Allow-Headers: *
Access-Control-Allow-Methods: POST
Access-Control-Allow-Origin: *
```

In hardened environments, it is advisable to restrict CORS headers further, in particular
[`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).

The LimeSurvey installation should have the plugin
[addScriptToQuestion](https://gitlab.com/SondagesPro/QuestionSettingsType/addScriptToQuestion) installed.
It is, however, not strictly needed.

You must enable the remote procedure call interface in the administrative settings of LimeSurvey.
Take note of the URL where this endpoint is exposed, e.g. `https://limesurvey.example.com/admin/remotecontrol`.
Export this variable as an environment variable called `VUE_APP_LIMESURVEY_API` during build time.
**Warning:** setting the value *after* the build will not have any effect. This needs to be set during build time.

### Build Server

The build server should have Node 16 installed.
Node v17+ also works but may require `NODE_OPTIONS=--openssl-legacy-provider` to be set as an environment variable
due to breaking changes in OpenSSL since Node v17.

Once `VUE_APP_LIMESURVEY_API` is set (see previous subsection), install dependencies using `npm install`.

Once successful, run `npm run build`.
After a little while, generated artefacts will be available in the `dist` folder.
You can push those files directly to your web server.
As no server-side processing takes place, there should be no further requirements on the server itself.

### Web Server

Publish all files generated in the previous subsection.
These can be cached (e.g., using [`Cache-Control: immutable`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)).

Once deployed, navigate to the newly deployed tool.
You can log-in using the credentials of your LimeSurvey instance.

## Architecture

On a surface level, this software is a web application that tightly integrates into LimeSurvey.
LimeSurvey is an open-source questionnaire software that will be used to collect data from participants.

The LimeSurvey installation should have the plugin
[addScriptToQuestion](https://gitlab.com/SondagesPro/QuestionSettingsType/addScriptToQuestion) installed as this will
be used to pre-fill and hide the `TIME` question.

A docker-compose file is attached to illustrate the deployment of the software.
When using this type of deployment, the container will run and expose the tool using nginx.

## Deployment with Docker

The repository contains a docker-compose.yml file.
You can use this to generate containers for Docker, Kubernetes, and other infrastructure environments.
Note that this tool uses LimeSurvey for authentication.
User management and any IAM-related subjects should be done there.

## How to Use

### Creating a Survey

When creating a new survey, it is advised to start with a copy of "Template Survey".
It already includes a question with the identifier `TIME`.
The app is pre-filling the value of this question with the current time and hides it from the user.

If this template does not exist, simply add a question with the identifier `TIME` and set its type to "Short Text".
Finally, add the following script to this question:

```js
$("#question{QID}").css('visibility', 'hidden');
$("#answer{SGQ}").val(new Date().toUTCString());
```

This should be the first or last question in the question group.
While its rendering will be prohibited by the `visibility: hidden` CSS property,
the browser will still "reserve" its space.

### Changing a Survey

Note that if you change a survey, you *may* lose data.
LimeSurvey can only restore already submitted responses if they appear compatible to the then-changed survey.
This is a limitation of LimeSurvey and cannot be avoided.

If you are changing an already active survey, use the following approach:

  1. stop the survey: this will prompt LimeSurvey to move already submitted responses to an archive.
  2. apply changes to the survey as needed.
  3. re-activate the survey. You can now restore previous participant tokens and responses.
      * you can restore previous participants using the "Survey participants" menu item.
      * you may be able to restore previous responses by using the "Import responses from a deactivated survey table" menu item.

## Contributors
  * **Martin Galusinski**: initial development of the KoordTool.
  * **Benjamin Akhras**: post-release support.
  * **Manuel Warum**: post-release support.
