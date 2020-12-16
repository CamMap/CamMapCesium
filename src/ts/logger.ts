/**
 * This file holds all the logging the program uses (that is the format of the logging).
 * This is a custom implementation because none seemed suitable (and actively maintained) on npm.
 *
 * @packageDocumentation
 */

/**
 * The log level to log messages, debug is the highest, error is the lowest
 */
enum LogLevel{
    Debug = 4,
    Info = 3,
    Warning = 2,
    Error = 1,
    Fatal = 0,
}

/**
 * A custom logger to standardise logging,
 * there doesn't seem to be a suitable maintained alternative on npm
 */
class CustomLogger{
    prefix: string;
    level: LogLevel;

    constructor(opts?: {prefix?: string, level?: LogLevel}){
        this.prefix = "";
        this.level = LogLevel.Debug;
        if(opts != undefined){
            if(opts.prefix != undefined){
                this.prefix = opts.prefix;
            }
            if(opts.level != undefined){
                this.level = opts.level;
            }
        }
    }

    /**
     * Set a prefix for the logger.
     * Do not use this, this is here just in case
     * but will be removed in the future.
     *
     * @param prefix - The prefix to use
     */
    set setPrefix(prefix: string){
        this.prefix = prefix;
    }

    /**
     * Log an info message
     *
     * @param message -  The message to log
     */
    public info(message: string){
        if(LogLevel.Info <= this.level){
            console.info("[INFO]" + this.prefix + " " + message);
        }
    }

    /**
     * Log an error message
     *
     * @param message -  The message to log
     */
    public error(message: string){
        if(LogLevel.Error <= this.level){
            console.error("[ERROR]" + this.prefix + " " + message);
        }
    }

    /**
     * Log a fatal error message
     *
     * @param message -  The message to log
     */
    public fatal(message: string){
        if(LogLevel.Fatal <= this.level){
            console.error("[FATAL]" + this.prefix + " " + message);
        }
    }

    /**
     * Log a warn message
     *
     * @param message -  The message to log
     */
    public warn(message: string){
        if(LogLevel.Warning <= this.level){
            console.warn("[WARNING]" + this.prefix + " " + message);
        }
    }

    /**
     * Log a debug message
     *
     * @param message -  The message to log
     */
    public debug(message: string){
        if(LogLevel.Debug <= this.level){
            console.debug("[DEBUG]" + this.prefix + " " + message);
        }
    }

    /**
     * Log a message with a custom prefix
     *
     * @param prefix - The logging prefix (e.g info, debug...)
     * @param message -  The message to log
     */
    public custom(prefix: string, message: string){
        console.debug(prefix + this.prefix + " " + message);
    }
}

/// A general logger for general things
export const GeneralLogger = new CustomLogger({prefix: "[General]"});

/// Logger for video related things
export const VideoLogger = new CustomLogger({prefix: "[Video]"});

/// Logger for image related things
export const ImageLogger = new CustomLogger({prefix: "[Image]"});

/// Logger for FOV related things
export const FOVLogger = new CustomLogger({prefix: "[FOV]"});

/// Logger for VGIP related things
export const VGIPLogger = new CustomLogger({prefix: "[VGIP]"});

