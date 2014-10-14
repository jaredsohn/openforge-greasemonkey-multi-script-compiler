#!/usr/bin/python                                                               

import json
obj = json.load(open("development/chrome/manifest.json"))

obj["permissions"].append("storage")
obj["permissions"].append("http://www.omdbapi.com/*")


contentscript = {};
contentscript["matches"] = ["http://*.netflix.com/*", "https://*.netflix.com/*"];
contentscript["all_frames"] = False;
contentscript["js"] = [ "forge/app_config.js", "forge/all.js", "src/js/before_images.js"];
contentscript["css"] = [];
contentscript["run_at"] = "document_end";

obj["content_scripts"].append(contentscript);

obj["options_page"] = "src/options.html";


open("development/chrome/manifest.json", "w").write(json.dumps(obj, indent=4,  separators=(",", ": ")))
