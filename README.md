# MMM-Sonarr

Module for MagicMirror 2 that shows recent activity and upcoming shows from Sonarr. This module uses the Sonarr API, HTTPS is not supported at the moment.

# Installation
1. Clone repo into the `/modules/` folder of your MagicMirror folder.
2. Run `npm install` inside the `MMM-Sonarr` folder.
3. Add the module to MagicMirror config
```
	{
		module: "MMM-Sonarr",
		position: "top-left",
		config: {
			apiBase: "http://localhost:8080/api/",
			apiKey: "<Sonarr API Key>",
		}
	}
```		
