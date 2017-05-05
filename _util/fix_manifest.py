#!/usr/bin/python

import json
obj = json.load(open("development/chrome/manifest.json"))

obj["icons"] = dict()
obj["icons"]["64"] = "src/favicon_64.png"

obj["web_accessible_resources"] = ["src/css/*", "src/img/*"]

obj["options_page"] = "src/options.html"

open("development/chrome/manifest.json", "w").write(json.dumps(obj, indent=4,  separators=(",", ": ")))
