# TO_DO: create a library for get_userscript_header?
# TODO: search script for presence of image files and css files (need to download them, place them in img and css, and add as resources)
# TODO: automate what fix_manifest_netflix does
# TODO: search for localStorage and warn that all values should get namespaced

import re
from collections import defaultdict

# input: contents of a userscript
# output: a dict containing the header information with a list for each keyword as well as derived useful info
def get_userscript_header(file_contents, show_warnings):
	lines = file_contents.split('\n')
	begun = False
	ever = False
	data = defaultdict(str)
	count = 0
	longest_line_length = 0

	# keywords contains all of the official greasemonkey keywords and a few discovered from looking through scripts (not sure what software (if any) supports them)
	keywords = ['conflict', 'description', 'downloadURL', 'enabledbydefault', 'exclude', 'grant','homepage', 'icon', 'include', 'license', 'match', 'name', 'namespace', 'require', 'resource', 'run-at', 'tab', 'unwrap', 'updateURL', 'version', 'versionorlastupdate']
	unsupported_keywords = ['GM_addStyle', 'GM_deleteValue', 'GM_getResourceText', 'GM_getResourceURL', 'GM_getValue', 'GM_info', 'GM_listValues', 'GM_log', 'GM_openInTab', 'GM_registerMenuCommand', 'GM_setClipboard', 'GM_setValue', 'UnsafeWindow', 'GM_xmlhttpRequest']
	security_keywords = ['eval', 'UnsafeWindow', 'document.write', 'innerHTML']
	not_crossplatform_keywords = ['foreach']
	list_keywords = ['match', 'include', 'exclude', 'require']
	num_keywords = ['unsupported_count', 'security_count', 'not_crossplatform_count']

	for field in list_keywords:
		data[field] = list()

	for field in num_keywords:
		data[field] = int()

	for line in lines:
		if len(line) > longest_line_length:
			longest_line_length = len(line)	
				
		stripped = line.strip()
		count += 1

		for unsupported_keyword in unsupported_keywords:
			if unsupported_keyword in stripped:
				if show_warnings:
					print "      Unsupported keyword found at line " + str(count) + ", " + unsupported_keyword + ", " + stripped
				data["unsupported_count"] += 1
				#data["unsupported"].append("line "+ str(count) + ", " + unsupported_keyword + ", " + stripped)

		for security_keyword in security_keywords:
			if security_keyword in stripped:
				if show_warnings:
					print "      Security risk keyword found at line " + str(count) + ", " + security_keyword + ", " + stripped
				data["security_count"] += 1
				#data["security"].append("line " + str(count) + ", " + security_keyword + ", " + stripped)

		for not_crossplatform_keyword in not_crossplatform_keywords:
			if not_crossplatform_keyword in stripped:
				if show_warnings:
					print "      Possibly not crossplatform keyword found at line " + str(count) + ", " + not_crossplatform_keyword + ", " + stripped
				data["not_crossplatform_count"] += 1
				#data["not_crossplatform"].append("line " + str(count) + ", " + not_crossplatform_keyword + ", " + stripped)

		if stripped == '// ==UserScript==':
			if ever == True:
				print "error: multiple headers"
				return defaultdict(str)
			ever = True
			begun = True
			continue
		elif stripped == '// ==/UserScript==':
			if begun == False:
				print("error: header ended before beginning")
				return defaultdict(str)
			begun = False
			continue

		if begun:
			found_key = False
			for key in keywords:
				if "@" + key + " " in stripped or "@" + key + "\t" in stripped:
					found_key = True
					idx = stripped.find("@" + key)
					val = (stripped[idx + 1 + len(key):]).strip()
					if (val != ""):
						if key in list_keywords:
							data[key].append(val)
						else:
							if data[key] != "":
								print("error: multiple values for " + key)
								return defaultdict(str)
							else:
								data[key] = val

#			if found_key == False:
#				data["comments"].append(stripped)
		else:
			stripped = line.strip()
#			if len(stripped) > 2:
#				if stripped[0:2] == '//':
#					#print data["comments"]
#					data["comments"].append(stripped)			# include non-header comment lines
	if ever == False:
		print("error: no userscript header information found")

	if len(data.keys()) > 0:
		if data["name"] == "":
			data["name"] = "unknown"

		data["linecount"] = count
		data["longest_line_length"] = longest_line_length
	return data

####################################################################################################

# main script

import shutil, errno

def get_unique_key(key, full_dict):
	if (key in full_dict) == False:
		return key

	count = 1
	new_key = key + '_' + str(count)
	while (new_key in full_dict) == True:
		count += 1
	return new_key

def write_file(filename, contents):
	f = open(filename ,'w')
	f.write(contents)
	f.close()

#http://stackoverflow.com/questions/1868714/how-do-i-copy-an-entire-directory-of-files-into-an-existing-directory-using-pyth
def copyanything(src, dst):
	import os
	if not os.path.exists(dst):
		os.makedirs(dst)
	for item in os.listdir(src):
		s = os.path.join(src, item)
		d = os.path.join(dst, item)
		if os.path.isdir(s):
			copytree(s, d, symlinks, ignore)
		else:
			if not os.path.exists(d) or os.stat(src).st_mtime - os.stat(dst).st_mtime > 1:
				shutil.copy2(s, d)

def load_prev_script_info(filename):
	import os
	import csv

	prev_script_info = defaultdict(str)

	if os.path.isfile(filename):
		script_info_reader = csv.DictReader(open(filename))
		for row in script_info_reader:
			prev_script_info[row['id']] = row
#			print("~~")
#			print row
			
		return prev_script_info
	else:
		return defaultdict(str)

def write_csv(filename, all_data):
	import csv
	from collections import OrderedDict

	csv_headers = OrderedDict()

	fields = ['id', 'name', 'name_override', 'name_parsed', 'category_required', 'enabled_override', 'description', 'description_override', 'description_parsed', 'match_include', 'match_include_override', 'match_include_parsed', 'exclude', 'exclude_override', 'exclude_parsed', 'require', 'require_override', 'require_parsed', 
		'run-at', 'enabled-by-default', 'linecount', 'longest_line_length', 'namespace', 'version', 'grant', 'updateURL', 'downloadURL', 'homepage', 'license', 'icon',
		 'unsupported_count', 'security_count', 'not_crossplatform_count', 'filename', 'screenshot_required', 'author', 'author_url', 'ignore_warnings', 'order_required', 'enabled_by_default_required', 'configure_required']

 	for field in fields:
		csv_headers[field] = None

	# Create list of all fields used anywhere
	for id, script_dict in all_data.iteritems():
		for field_name, val in all_data[id].iteritems():
			csv_headers[field_name] = None

	with open(filename, 'wb') as outputfile:
	    writer = csv.DictWriter(outputfile, csv_headers)
	    writer.writeheader()
	    for key, val in all_data.iteritems():
	    	writer.writerow(all_data[key])

def get_default_list_string(all_data):
	default_list = [];
	for key, file_dict in all_data.iteritems():
		if file_dict['enabled_by_default_required'].lower() == "true":
			default_list.append(file_dict['id'])
	return ",".join(default_list);


def create_data_for_ui(all_data, init_categories_order):
	import os
	from os.path import isfile, join

	ui_data = dict()
	ui_data["userscripts"] = dict()
	ui_data["categories"] = init_categories_order

	for key, file_dict in all_data.iteritems():
		ui_data["userscripts"][key] = dict()
		ui_data["userscripts"][key]['id'] = file_dict['id']
		ui_data["userscripts"][key]['name'] = file_dict['name']

		ui_data["userscripts"][key]['order'] = file_dict['order_required']
		ui_data["userscripts"][key]['screenshot'] = file_dict['screenshot_required']
		ui_data["userscripts"][key]['description'] = file_dict['description']
		ui_data["userscripts"][key]['author'] = file_dict['author']
		ui_data["userscripts"][key]['author_url'] = file_dict['author_url']
		ui_data["userscripts"][key]['configure'] = file_dict['configure_required']

		if 'category_required' in file_dict:
			category = file_dict['category_required']
		else:
			category = "Misc"
		ui_data["userscripts"][key]['category'] = category
		if not category in ui_data["categories"]:
			ui_data["categories"].append(category)

	return ui_data

def process_userscripts(project_name):
	import os
	from os import listdir
	from os.path import isfile, join
	import json
	import urllib2

	print "Processing project '" + project_name + "'"

	dir = os.path.dirname(os.path.realpath(__file__))
	template_folder = os.path.join(dir, '_template')
	input_folder = os.path.join(dir, '_input', project_name)
	output_folder = os.path.join(dir, '_output', project_name)

	if not os.path.exists(input_folder):
		print "path " + input_folder + " not found.  Invalid project name?"
		return

	if os.path.exists(output_folder):
		shutil.rmtree(output_folder)

	all_data = dict()
	prev_script_info = load_prev_script_info(join(input_folder, "script_info.csv"))

	# read template files into memory
	template_contentscript_header = open(join(template_folder, "helper/contentscript_header.js"),'r').read()
	template_contentscript_footer = open(join(template_folder, "helper/contentscript_footer.js"),'r').read()
	template_all_header 		  = open(join(template_folder, "helper/allheader.js"), 		    'r').read()
	template_all_footer 		  = open(join(template_folder, "helper/allfooter.js"), 		   	'r').read()

	template_options              = open(join(template_folder, "js/options.js"),				'r').read()
	template_popup_html           = open(join(template_folder, "popup.html"), 					'r').read()
	template_options_html         = open(join(template_folder, "options.html"), 				'r').read()


	template_popup_js             = open(join(template_folder, "js/popup.js"), 					'r').read()

	template_openforge_config     = open(join(template_folder, "config.json"),					'r').read() #openforge template file

	input_welcome_html            = open(join(input_folder,	   "welcome.html"), 				'r').read()
	compiler_config_file  		  = open(join(input_folder,    "compiler_config.json"),			'r')
	compiler_config = json.load(compiler_config_file)

	proceed = True

	print("Processing userscripts...")
	print join(input_folder, "userscripts")
	for (dirpath, dirnames, filenames) in os.walk(join(input_folder, "userscripts")):
		# Recreate subfolders in output if needed
		new_out_folder = join(output_folder, "js", os.path.relpath(dirpath, input_folder))
		if not os.path.exists(new_out_folder):
		    os.makedirs(new_out_folder)

		inputfile_contents = dict()

		for filename in filenames:
			if filename[-3:] == '.js':
				print(join(dirpath, filename))

				file_id = get_unique_key('id_' + filename[:len(filename) - 3], all_data)

				# TODO: instead of displaying warnings within get_userscript_header, should instead include in dict (and then we remove from dict here)
				if (file_id in prev_script_info) and ('ignore_warnings' in prev_script_info[file_id]):
					ignore_warnings = prev_script_info[file_id]['ignore_warnings']	
					if ignore_warnings.lower() != 'true':
						ignore_warnings = False
				else:
					ignore_warnings = False
				inputfile_contents[file_id] = open(join(input_folder, dirpath, filename), 'r').read()
				inputfile_contents[file_id] = inputfile_contents[file_id].replace("console.log(", "consolelog(3,")

				header = get_userscript_header(inputfile_contents[file_id], ignore_warnings == False)
				if len(header.keys()) == 0:
					proceed = False
					continue

				new_list_fields = ['exclude_parsed', 'match_include_parsed', 'require_parsed', 'description_parsed']
				for field in new_list_fields:
					header[field] = list()

				for key in header.keys():
					# We require that the user reviews some fields (so we move data to the _parsed key); also match and include are combined together into match_include
					if key in ["include", "match"]:
						header["match_include_parsed"] = header["match_include_parsed"] + header[key]
						del header[key]
					elif key in ["exclude"]:						
						header[key + "_parsed"] = header[key + "_parsed"] + header[key]
						del header[key]
					elif key in ["require"]:						# for now, require review on require.  Eventually at least handle jquery automatically and potentially download the file for inclusion.
						header[key + "_parsed"] = header[key + "_parsed"] + header[key]
						del header[key]

				header['id'] = file_id

				filename_relpath = os.path.join(os.path.relpath(dirpath, os.path.join(input_folder, "userscripts")), filename)
				if filename_relpath[0:2] == "./":
					filename_relpath = filename_relpath[2:]
				header['filename'] = filename_relpath


#				header['filename'].append(os.path.join(os.path.relpath(dirpath, os.path.join(input_folder, "userscripts"), filename)))

				header['category_required'] = ''
				header['screenshot_required'] = ''
				header['order_required'] = ''
				header['enabled_by_default_required'] = ''
				header['configure_required'] = ''

				header['ignore_warnings'] = ignore_warnings

				# apply overrides

				if prev_script_info.get(header['id']) != None:
					for custom_key, custom_val in prev_script_info[header['id']].iteritems():
						if custom_val.strip() != "":
							if '_override' in custom_key:
								header[custom_key] = custom_val
								new_key = custom_key.replace('_override', '')

#								print('!!!')
#								print(custom_key)
#								print(header[custom_key])
#								print(type(header[custom_key]))							
								if type(header[custom_key]) is list:
									header[new_key] = list()
									header[new_key].append(custom_val)
								else:
									header[new_key] = custom_val
							if '_required' in custom_key:
								if type(header[custom_key]) is list:
									header[custom_key].append(custom_val)
								else:
									header[custom_key] = custom_val									

				# download requires
				#for require in header["require"]:
				#	response = urllib2.urlopen(require)
				#	require_contents = response.read()
				#	#TODO: get filename, if it looks like jquery, use canonical version; check if exists (and give unique name if so)
				#	#TODO: write to output; append to header['filename']

				required_fields = ["match_include", "description", "order_required", "enabled_by_default_required", "configure_required"]
				for field in required_fields:
					if (field in header == False) or (header[field].strip() == ""):
						proceed = False
						print("   Error: Missing required field '" + field + "'.")

				# store away new data
				all_data[header['id']] = header


				# more checks
				if (header['unsupported_count'] > 0):
					#TO_DO: do polyfills where possible (i.e. GM_xmlhttpRequest -> XMLHttpRequest)
					print("   Error: " + str(header['unsupported_count']) + " unsupported keyword(s) found.")
					if ignore_warnings:
						print "      (Ignoring due to configuration in script_info.csv)"
					else:
						print "      Please fix or set ignore_warnings to True in script_info.csv"
						proceed = False

				if (header['security_count'] > 0):
					print("   Error: " +  str(header['security_count']) + " potential security issue keyword(s) found.")					
					if ignore_warnings:
						print "      (Ignoring due to configuration in script_info.csv)"
					else:
						print "      Please fix or set ignore_warnings to True in script_info.csv"
						proceed = False

				if (header['not_crossplatform_count'] > 0):
					print("   Error: " +  str(header['not_crossplatform_count']) + " possibly not crossplatform keyword(s) found.")					
					if ignore_warnings:
						print "      (Ignoring due to configuration in script_info.csv)"
					else:
						print "      Please fix or set ignore_warnings to True in script_info.csv"
						proceed = False

	# Write out updated scripts data (user may need to review it)
	write_csv(join(input_folder, "script_info.csv"), all_data)

	if proceed == False:
		print("Fail: Build aborted due to errors.  Please review _input/" + project_name + "/script_info.csv.")
		return
	print
	print "Everything okay; creating extension files..."

	##############################################################################################################

	# Copy over files from template and input folders
	copyanything(os.path.join(template_folder, "js"), os.path.join(output_folder, "js"))
	copyanything(os.path.join(template_folder, "css"), os.path.join(output_folder, "css"))
	copyanything(os.path.join(template_folder, "fonts"), os.path.join(template_folder, "fonts"))

	shutil.copyfile(join(template_folder, "index.html"), join(output_folder, "index.html"))
	shutil.copyfile(join(template_folder, ".forgeignore"), join(output_folder, ".forgeignore"))
	shutil.copyfile(join(template_folder, "LICENSE-crx-options-page.txt"), join(output_folder, "LICENSE-crx-options-page.txt"))	

	shutil.copyfile(join(input_folder, "identity.json"), join(output_folder, "identity.json"))	
	shutil.copyfile(join(input_folder, "prefs_keyboard_shortcuts.html"), join(output_folder, "prefs_keyboard_shortcuts.html"))
	shutil.copyfile(join(input_folder, "prefs_fade_rated.html"), join(output_folder, "prefs_fade_rated.html"))

	copyanything(os.path.join(input_folder, "icons"), output_folder)
	copyanything(os.path.join(input_folder, "css"), os.path.join(output_folder, "css")) 
	copyanything(os.path.join(input_folder, "img"), os.path.join(output_folder, "img"))
	copyanything(os.path.join(input_folder, "js"), os.path.join(output_folder, "js"))

	##############################################################################################################


	default_list_string = get_default_list_string(all_data)

	# Create a pattern for doing multiple token replacements
	rep = { "$NAME_SHORT": compiler_config["name_short"],
			"$NAME_HTML": compiler_config["name_html"],
			"$NAME_TEXT": compiler_config["name_text"],
			"$ACTIVATION_PATTERNS": compiler_config["activation_patterns"], 
			"$VERSION": compiler_config["version"], 
			"$DESCRIPTION": compiler_config["description"],
			"$WEBSTORE_URL": compiler_config["webstore_url"],
			"$FEEDBACK_URL": compiler_config["feedback_url"],
			"$MORE_INFO_URL": compiler_config["more_info_url"],
			"$MORE_INFO_TEXT": compiler_config["more_info_text"]
		  }
	rep = dict((re.escape(k), v) for k, v in rep.iteritems())
	pattern = re.compile("|".join(rep.keys()))

	##############################################################################################################

	# Create a content for document_start and for document_end that includes userscripts, a header, and a footer

	separator = "\n\n" + "/" * 80 + "\n\n"

	for runat in ['start', 'end']:
		script_for_runat = ""
		for k in all_data.keys():
			header = all_data[k]
			script_run_at = all_data[k]['run-at']
			if all_data[k]['run-at'] == '':
				script_run_at = "document-end"
			if script_run_at == "document-" + runat:
				new_cs_header = template_contentscript_header.replace("$SCRIPT_ID", header['id'])

				# quit if path not equal to any of the includes.  Also, if no includes, then automatically proceed.
				import ast
				includes = ast.literal_eval(header["match_include_override"])

				if len(includes) > 0:
					include_exclude_code = 'if ('
					for include in includes:
						include_exclude_code += '(location.pathname.indexOf("' + include + '") !== 0) && '
					include_exclude_code += '(2 > 1)) return;\n\n'
				else:
					include_exclude_code = ""

				new_cs_header = new_cs_header.replace("$INCEXC", include_exclude_code)

				# for each exclude, add the following to the end of the header
#				excludes = ast.literal_eval(header["exclude"])
#				for exclude in excludes:
#					include_exclude_code += 'if (location.pathname === ' + exclude + ") return;\n\n"

				# TO_DO: in future, add back exclude (w/out regex)

				new_cs_footer = template_contentscript_footer.replace("$SCRIPT_ID", header['id'])

				script_for_runat += new_cs_header + separator + inputfile_contents[header['id']] + separator + new_cs_footer
				#print script_for_runat

		new_all_header = template_all_header.replace("$START_OR_END", runat);
		new_all_header = new_all_header.replace("$EXTSHORTNAME", project_name);		
		new_all_header = new_all_header.replace("$DEFAULT_SCRIPTS", default_list_string);

		outputfile_contents = new_all_header + separator
		outputfile_contents += script_for_runat
		outputfile_contents += separator + template_all_footer
		write_file(join(new_out_folder, runat + ".js"), outputfile_contents)

	##############################################################################################################
	# Replace tokens in OpenForge config.json
	output_template_config = pattern.sub(lambda m: rep[re.escape(m.group(0))], template_openforge_config)
	write_file(join(output_folder, "config.json"), output_template_config)

	##############################################################################################################
	# Replace tokens in UI files (also read/write category order)

	init_categories_order = list()
	if os.path.isfile(join(input_folder, "categories_order.json")):
		categories_order_file = open(join(input_folder,    "categories_order.json"   ), 'r')
		categories_order = json.load(categories_order_file)
		print categories_order
		init_categories_order = categories_order['order']

	ui_data = create_data_for_ui(all_data, init_categories_order)
	template_options = template_options.replace("$SCRIPTS_JSON", json.dumps(ui_data, indent=4, separators=(',', ': ')))
	template_options = template_options.replace("$DEFAULT_SCRIPTS", default_list_string);

	write_file(join(os.path.join(output_folder, 'js'), "options.js"), template_options)

	# write out new order for load next time
	order_data = {}
	order_data["order"] = ui_data["categories"]
	categories_order_json = json.dumps(order_data, indent=4, separators=(',', ': '))
	write_file(join(input_folder, "categories_order.json"), categories_order_json)

	template_options_html = pattern.sub(lambda m: rep[re.escape(m.group(0))], template_options_html)
	write_file(join(output_folder, "options.html"), template_options_html)

	template_popup_js = pattern.sub(lambda m: rep[re.escape(m.group(0))], template_popup_js)
	write_file(join(output_folder, "js/popup.js"), template_popup_js)

	template_popup_html = pattern.sub(lambda m: rep[re.escape(m.group(0))], template_popup_html)
	write_file(join(output_folder, "popup.html"), template_popup_html)

	input_welcome_html = pattern.sub(lambda m: rep[re.escape(m.group(0))], input_welcome_html)
	write_file(join(output_folder, "welcome.html"), input_welcome_html)


	##############################################################################################################

	print
	print "All done!"

import sys

if len(sys.argv) == 2:
	if sys.argv[1] == 'all':
		import os
		path =  os.path.join(os.path.dirname(os.path.realpath(__file__)), '_input')
		for project in os.walk(path).next()[1]:
			process_userscripts(project)
	else:
		process_userscripts(sys.argv[1])
else:
	print "Usage: python compile.py [projectname] | [all]"
