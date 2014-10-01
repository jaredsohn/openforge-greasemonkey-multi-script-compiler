$SCRIPT_ID_code = function() {

	function consolelog(msg)
	{
	    consolelog(0, msg);
	}
	function consolelog(level, msg)
	{
	    // Levels:
	    // -- 0 = no messages
	    // -- 1 = just high level messages (produced by compiler)
	    // -- 2 = less important messages (produced by compiler)
	    // -- 3 = all messages (produced by userscripts)

	    if (level <= __debug_level)
	    {
	    	if (typeof(msg) === "string")
		        console.log("$SCRIPT_ID: " + msg);
		    else
		    {
		    	console.log("$SCRIPT_ID:");
			    console.log(msg);
		    }
	    }
	}


	var start_time = new Date();

	var ___contentscript_id = "$SCRIPT_ID";

	if ( (enabled_scripts !== null) && (((typeof(enabled_scripts["$SCRIPT_ID"]) === 'undefined')) || (enabled_scripts["$SCRIPT_ID"] !== "true")) 	)
		return;

	$INCEXC

	try {
