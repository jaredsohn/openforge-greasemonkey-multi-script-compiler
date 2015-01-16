
    } catch (ex) {
    	consolelog("exception");
		consolelog(ex);
		consolelog(ex.stack);
    }

    consolelog(1, 'load time = ' + (new Date()-startTime) + 'ms');

}(); // scoping
