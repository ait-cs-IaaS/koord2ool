# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2022-07-27
### Added

- Application errors are now relayed to the user as an alert.
- Data is now loaded on-demand as opposed to eagerly upon successful authentication.

### Removed

- The legacy way to use `TIME` in surveys to mark the time of submission is now removed.
  Instead, the `submitdate` property exposed by LimeSurvey will be used.
  Unless the survey was marked as anonymized, this field holds the exact time of the submission.

### Changed

- The UI no longer shows the number of responses for a given survey.
  This is due to the lazy loading added to the application in this version.
- Line charts will now render with steps.
- The favicon was updated to replace the default Vue icon.

## [0.1.0] - 2022-04-01

Initial rewrite for CERT.at emulating the basic functionality of the original KoordTool.

[Unreleased]: https://git-service.ait.ac.at/sim-ict/accsa/koord2ool/compare/main...develop
[0.2.0]: https://git-service.ait.ac.at/sim-ict/accsa/koord2ool/compare/0.1.0...0.2.0
[0.1.0]: https://git-service.ait.ac.at/sim-ict/accsa/koord2ool/-/tags/0.1.0
