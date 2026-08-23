## Purpose

Defines application packaging and delivery for the Wa-Tor app: file organization, CDN Phaser loading through ES2020 modules, code-configurable model constants, JSDoc documentation conventions, Vite build to static ES2020 output, and lightweight PWA support.

## ADDED Requirements

### Requirement: 1. Project file organization
The system SHALL include `index.html`, `src/main.ts`, `src/config.ts`, `src/simulation/WatorSimulation.ts`, `src/scenes/BootScene.ts`, `src/scenes/SimulationScene.ts`, `sw.js`, `manifest.webmanifest`, and an `assets/` directory for PWA assets. A `src/ui/` directory MAY hold on-screen element and UI helper classes.

#### Scenario: 1. Required files present
- **WHEN** the project is inspected
- **THEN** all required files and the assets directory exist at the specified paths

### Requirement: 2. CDN Phaser with ES2020 modules
When `index.html` loads the app, the system SHALL load Phaser version 4.x from a CDN script tag (acceptable source: `https://cdnjs.cloudflare.com/ajax/libs/phaser/4.2.1/phaser.min.js`) and SHALL load the app through ES2020 JavaScript modules.

#### Scenario: 1. Load path
- **WHEN** `index.html` is opened
- **THEN** Phaser 4.x comes from a CDN `<script>` tag and app code executes as ES modules

### Requirement: 3. Engine independence from presentation
The system SHALL keep all Wa-Tor rules independent from Phaser APIs and Phaser scene objects.

#### Scenario: 1. No framework coupling in engine
- **WHEN** simulation rule code is examined or executed outside a browser rendering context
- **THEN** it references no Phaser APIs or scene objects

### Requirement: 4. Code-configurable constants
The system SHALL make grid dimensions, densities, breed times, shark energy values, colors, and speed options easy for programmers to change as code constants.

#### Scenario: 1. Single configuration location
- **WHEN** a programmer changes a model parameter constant
- **THEN** the change takes effect without editing logic elsewhere in the app

### Requirement: 5. Vite build to static output
TypeScript source SHALL be compiled by Vite into static ES2020 JavaScript deployable as a static site, including from a repository subpath, with no backend and no Node.js dependency in the shipped runtime.

#### Scenario: 1. Static deployment artifact
- **WHEN** the build completes
- **THEN** its output runs as static files from any subpath without a server runtime

### Requirement: 6. PWA manifest and service worker
The system SHALL include a manifest and service worker that cache the app shell and same-origin assets. PWA icons SHALL show circles suggesting the shark and fish symbols. If the CDN Phaser script has not already been successfully loaded and cached, first-load or offline behavior MAY depend on network availability.

#### Scenario: 1. Installable app shell
- **WHEN** the app has been loaded once and the network is unavailable
- **THEN** cached same-origin assets still serve; only uncached CDN content depends on the network

#### Scenario: 2. Icon design
- **WHEN** PWA icons are rendered
- **THEN** they depict circles suggesting shark and fish symbols

### Requirement: 7. Documentation conventions
Every class SHALL have a JSDoc-style documentation comment. Every static method and every public method longer than 8 lines SHALL be documented with JSDoc-style comments.

#### Scenario: 1. Class coverage
- **WHEN** any class in the codebase is inspected
- **THEN** it carries a JSDoc-style documentation comment

#### Scenario: 2. Method coverage
- **WHEN** a static method or public method exceeding 8 lines is inspected
- **THEN** it carries a JSDoc-style documentation comment
