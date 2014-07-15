Invigilator - Chrome Extension
=============================

Invigilator is a [Google Chrome](https://www.google.com/chrome) extension for managing your extensions and apps with additional security checks.

### Features
- Manage extensions from a convenient popup window
- Remember extensions you have uninstalled
- Full extension history showing when extensions were installed, enabled/disabled, updated and more
- Alert you whenever an extension has been updated
- Alert you if the owner of an extension has changed
- Alert you if reviews containing adware/spyware keywords are detected

### [Install the addon here from the Chrome Web Store](https://chrome.google.com/webstore/detail/invigilator/gmhgjkobbgamddnpceaieojogffcmckh)

Please use the [issue tracker](https://github.com/wrakky/invigilator/issues) to report any bugs or make suggestions

## Contribute

All contributions are welcome. The project uses [Grunt](http://gruntjs.com/) for automated builds and [Less](http://lesscss.org/) for CSS.

### Quickstart

Install [node.js](http://nodejs.org/). Once installed run the following commands to install grunt, less and generate a build.

```bash
npm install -g grunt-cli
npm install -g less
cd /path/to/invigilator
npm install
grunt
```

Source code is located in the `src` directory. Grunt will monitor any changes to the files in this folder and automatically compile
and generate a new builds in the `build` directory. Set `/path/to/invigilator/build` as the location of your unpacked extension and
you can now makes changes and see the results in your browser.

### Translating

Locales will be coming in a future release

### Credit
If you would like to be credited for your contribution please also include a name and link (personal site, twitter etc)
with your submission