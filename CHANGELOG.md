# Changelog

## [1.5.0](https://github.com/tehuel/track/compare/v1.4.0...v1.5.0) (2026-11-04)


### Features

* **charts:** add horizontal scroll on small screens and auto-scroll to latest ([9b9fd3f](https://github.com/tehuel/track/commit/9b9fd3f4680b04b18c91d721454f47f2dc0722fc))
* **db:** add chart visualization modes and series aggregation queries ([1cc83f0](https://github.com/tehuel/track/commit/1cc83f0c880e50d7e75369244b1489a45d3ef00c))
* **db:** make WAL journal mode opt-in via DB_WAL environment variable ([91b4b46](https://github.com/tehuel/track/commit/91b4b46d9e06237bb418f3647d46161a1af2199a))
* **ui:** integrate configurable charts into dashboard, detail page, and edit modal ([e68c458](https://github.com/tehuel/track/commit/e68c458c906a2c9518eeec8c735ad8aa247ba040))
* **views:** add universal SSR chart components for grid, bars, and line modes ([52628d1](https://github.com/tehuel/track/commit/52628d16261eda72a63b1dfd55549ba958d75021))


### Bug Fixes

* **charts:** omit zero dots on missing days in line mode and connect active points ([3a07609](https://github.com/tehuel/track/commit/3a076090ce1e73a29cd1af0e6c52111438415045))
* **charts:** use flex-fill on mini grid items so 7-day blocks render at full width ([928ec78](https://github.com/tehuel/track/commit/928ec78d96a5fbbb75ee673588f9850f5a789c05))


### Performance Improvements

* **db:** filter by timestamp directly in getEventTotals to utilize index ([5326d95](https://github.com/tehuel/track/commit/5326d9578fcbcfa65121da5f1c1d6a7a4682359e))

## [1.4.0](https://github.com/tehuel/track/compare/v1.3.0...v1.4.0) (2026-11-04)


### Features

* add option to export data in JSON ([adc0c47](https://github.com/tehuel/track/commit/adc0c479a63b34080ee636e0d1090abe36c92c38))
* **ui:** add app version to footer ([ee422d8](https://github.com/tehuel/track/commit/ee422d8dd65b34a6df4565cd1e62f5d78b93490f))


### Bug Fixes

* persist timestamps in UTC on server and format in local timezone on client ([e770bf4](https://github.com/tehuel/track/commit/e770bf44b576374d41ec45327a70871098762b04))
* Timezone handling ([a558ba6](https://github.com/tehuel/track/commit/a558ba65e49eb51927fa29ceb7991cb1f7a44ecd))

## [1.3.0](https://github.com/tehuel/track/compare/v1.2.0...v1.3.0) (2026-11-03)


### Features

* add version meta tag to layout and tests ([ccc2800](https://github.com/tehuel/track/commit/ccc2800e6ae6f440e94759a99d0c145ba707ee6f))


### Bug Fixes

* update grid layout to support more columns on larger screens ([7de8739](https://github.com/tehuel/track/commit/7de8739b3218cc73b8f5b442378fa746121d9871))

## [1.2.0](https://github.com/tehuel/track/compare/v1.1.1...v1.2.0) (2026-11-03)


### Features

* enhance loading feedback for HTMX requests and add progress bar for boosted navigation ([9ef8133](https://github.com/tehuel/track/commit/9ef81335d6b62ce7680f6dc431aece98fca20e00))
* show loading spinner on confirmation modal delete button ([cbf74b4](https://github.com/tehuel/track/commit/cbf74b451ec5c085051d3e12fccf0f9b63cea24c))

## [1.1.1](https://github.com/tehuel/track/compare/v1.1.0...v1.1.1) (2026-11-03)


### Bug Fixes

* add changelog for release testing ([33455c9](https://github.com/tehuel/track/commit/33455c92e785e5ed1c09d45a046759800e458394))


### Performance Improvements

* extract theme initialization asset ([b60c948](https://github.com/tehuel/track/commit/b60c9488fdfefec90d28a8cfe70afaa18d46289b))
* serve frontend assets locally ([b3b3b86](https://github.com/tehuel/track/commit/b3b3b8660e62b0d9faa8cb01e9ea1100adec31c9))

## [1.1.0] - 2026-11-03

- Mejoras de navegación y gestión de assets frontend.
