#!/usr/bin/python

import json
obj = json.load(open("development/chrome/manifest.json"))

del obj["browser_action"]

obj["icons"] = dict()
obj["icons"]["64"] = "src/favicon_64.png"
obj["page_action"] = dict()
obj["page_action"]["default_popup"] = "src/popup.html"
obj["page_action"]["default_icon"] = dict()
obj["page_action"]["default_icon"]["19"] = "src/favicon_19.png"
obj["page_action"]["default_icon"]["38"] = "src/favicon_19.png"
obj["page_action"]["default_title"] = obj["name"]

obj["web_accessible_resources"] = ["src/css/*", "src/img/*"]

obj["options_page"] = "src/options.html"

open("development/chrome/manifest.json", "w").write(json.dumps(obj, indent=4,  separators=(",", ": ")))
