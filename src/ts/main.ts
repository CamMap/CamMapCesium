/**
 * The main application, this is the first thing to run when running the appilcation
 *
 * @packageDocumentation
 */
import { LoadConfigFromOwnServer } from "./configHandler";
import { fovFormHandler } from "./fovFormHandler";
import { generalBaseSetup} from "./main_helper";

// Load in config file and pass through the config object to the general setup
const config = LoadConfigFromOwnServer();

/* eslint @typescript-eslint/no-magic-numbers: off */
const viewer = generalBaseSetup(config);
new fovFormHandler(viewer.scene);
// If using a websocket, put in the right address in the line below.
// Note that an address which does not serve any data can be put and nothing will be recieved
// (The program will not error in this case (only if malformed data is sent it will emit a warning))

