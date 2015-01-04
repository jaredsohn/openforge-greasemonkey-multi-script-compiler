
    } catch (ex) {
        consolelog(1, 'Exception:' + ex);
    }

    consolelog(1, 'load time = ' + (new Date()-start_time) + 'ms');

}(); // scoping
