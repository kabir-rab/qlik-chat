//Property Panel
define( ["qlik"], (qlik) => {
    'use strict';
	
	return {
		type: "items",
		component: "accordion",
		items: {
			CustomAccordion: {
				type: "string",
				label: "API Host Address",
				ref: "apihost",
				defaultValue: "https://apihostaddress:port"
            }
        }
    }
});
