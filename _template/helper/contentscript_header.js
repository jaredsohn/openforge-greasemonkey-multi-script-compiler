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
            if ((__debug_level === 0) || (__debug_level === "0"))
                console.log(msg);
            else
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
    }


    var startTime = new Date();

    var ___contentscript_id = "$SCRIPT_ID";

    if ((__enabledScripts !== null) && (((typeof(__enabledScripts["$SCRIPT_ID"]) === 'undefined')) || (__enabledScripts["$SCRIPT_ID"] !== "true")))
        return;

    $INCEXC

    try {
