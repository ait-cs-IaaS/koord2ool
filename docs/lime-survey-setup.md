# Enabling the Remote Control API

For Koord2ool to access survey data, you must enable the RemoteControl API:

1. Log in to LimeSurvey as an administrator.
2. Navigate to **Configuration > Global Settings**.
3. Select the **Interfaces** tab.
4. Enable the **JSON-RPC interface**.
5. Save your settings.

---

# Creating a Survey for Koord2ool

Create a survey in LimeSurvey as described in the [LimeSurvey documentation](https://manual.limesurvey.org).  
Note that the survey must be in **closed-access mode** so that individual answers can be associated with a source.


## Important Settings

To ensure proper data collection, you must:

- **Turn "Anonymized responses" OFF**.
- **Turn "Date stamp" ON**.  

## Supported Question Types

Currently, only the following question types are supported:

- `yesno`
- `list_dropdown`
- `bootstrap_dropdown`
- `listradio`
- `numerical`
- `multipleshorttext`
- `multiplechoice`
- `shortfreetext`
- `longfreetext`