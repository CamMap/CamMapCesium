//TODO: someone migrate this to ES6 later on
require("../css/main.css");
require("cesium_source/Widgets/widgets.css");
require("./image");
require("./video");

import {GeneralLogger} from "./logger";
GeneralLogger.info("Everything imported correctly");

require("./examples/exWS");
