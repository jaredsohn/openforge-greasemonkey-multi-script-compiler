
    } catch (ex) {
	    console.log("_stacktrace2_");
	    console.trace("sp2");
	    console.log((new Error).stack);
		stackTrace();
		consolelog(ex);
    }

    consolelog(1, 'load time = ' + (new Date()-startTime) + 'ms');

}(); // scoping
