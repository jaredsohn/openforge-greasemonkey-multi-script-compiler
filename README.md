openforge-greasemonkey-multi-script-compiler
=======

### About

This is a framework that builds a browser extension from a collection of userscripts.  It was used to build the Flix Plus Chrome extension for Lifehacker.  Because this framework has only been used a single time for a single browser so far, more work is necessary to make it more general purpose.

It is a spiritual successor to [greasemonkey-multi-script-compiler](https://github.com/ginatrapani/greasemonkey-multi-script-compiler)

### How it works

* You fill in some configuration files, provide icons, etc and place all userscripts into a folder.

* A compiler (written in Python) will use this information to create a Chrome extension that concatenates userscripts into two contentscripts (one is run as a page starts rendering and another is run afterward).  It allows turning on/off features and produces an options page to control it.  It also disables logging from userscripts (unless a higher loglevel is set) and warns the user about potentially dangerous keywords found in scripts.

* The developer can configure script metadata by editing a CSV (Open Office works well for this.)


### Setup

1. Since this project is dependent on [OpenForge](https://github.com/trigger-corp/browser-extensions.git), set that up first.  Name the folder based on the extension you are trying to build.

2. Then clone this project to a separate top-level folder (call it openforge-greasemonkey-multi-script).

3. Create some symlinks to link OpenForge with this framwork and make the build scripts executable by running these commands. (Change paths if needed)

```
   cd ~/flix_plus
   rm -rf src
   ln -s  ~/openforge-greasemonkey-multi-script-compiler/_output/flix_plus/ src
   ln -s  ~/openforge-greasemonkey-multi-script-compiler compiler
   cp compiler/_util/* .
   chmod +x z
   chmod +x compiler/y
```

### Building
   You can build an extension by running ./z from the flix_plus folder.  The Chrome extension is built in fix_plus/development/chrome.
   
### Development

More will be written on this soon.  But essentially you can run the greasemonkey-to-extension compiler by running ./y from the flix_plus/compiler folder.  It uses _inputs/flix_plus/script_info.csv which you can edit via Open Office by running compiler/x.

New userscripts should be placed in flix_plus/compiler/_inputs/flix_plus/userscripts.


### Licensing

This framework is licensed GPL. 

