/**
 * The main application, this is the first thing to run when running the appilcation
 *
 * @packageDocumentation
 */
import { ConfigHandler } from "./configHandler";
import { formHandler } from "./formHandler";
import { generalBaseSetup} from "./main_helper";

/* eslint @typescript-eslint/no-magic-numbers: off */
const viewer = generalBaseSetup();
new ConfigHandler(viewer);
new formHandler(viewer.scene);
// If using a websocket, put in the right address in the line below.
// Note that an address which does not serve any data can be put and nothing will be recieved
// (The program will not error in this case (only if malformed data is sent it will emit a warning))

