/**
 * The main application, this is the first thing to run when running the appilcation
 *
 * @packageDocumentation
 */

import { generalBaseSetup, setUpVGIPWebSocket } from "./main_helper";

const [, fov] = generalBaseSetup();

// If using a websocket, put in the right address in the line below.
// Note that an address which does not serve any data can be put and nothing will be recieved
// (The program will not error in this case (only if malformed data is sent it will emit a warning))
setUpVGIPWebSocket(fov, "ws://localhost:8081");

