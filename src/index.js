"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.konsoul = exports.defaultAnimationOptions = exports.colorCodes = void 0;
exports.colorCodes = {
    red: "31",
    green: "32",
    yellow: "33",
    blue: "34",
    magenta: "35",
    cyan: "36",
    white: "37",
    black: "0",
    gray: "90",
    lightgray: "37",
    lightred: "91",
    lightgreen: "92",
    lightyellow: "93",
    lightblue: "94",
    lightmagenta: "95",
    lightcyan: "96",
    lightwhite: "97",
};
exports.defaultAnimationOptions = {
    enabled: false,
    type: "none",
    duration: 2000,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    text: "Loading...",
    speed: 80,
};
class Konsoul {
    constructor() {
        this.presets = {
            api: {
                label: "api",
                style: "border-normal",
                color: "cyan",
                timestamp: true,
            },
            error: {
                label: "error",
                style: "border-dashed",
                color: "red",
                timestamp: true,
                padding: 2,
            },
            success: {
                label: "success",
                style: "border-normal",
                color: "green",
                timestamp: true,
            },
            debug: {
                label: "DEBUG",
                color: "gray",
                timestamp: true,
            },
            section: {
                style: "spacy",
                color: "yellow",
                padding: 2,
            },
        };
        this.spinnerInterval = null;
        this.progressInterval = null;
    }
    // Method to add custom presets
    addPreset(name, config) {
        this.presets[name] = config;
    }
    // Enhanced logging methods with presets
    preset(presetName, msg, additionalOptions = {}) {
        const presetConfig = this.presets[presetName] || {};
        return this.log(msg, Object.assign(Object.assign({}, presetConfig), additionalOptions));
    }
    // Method for logging arrays of data with auto-grouping
    logList(items, options = {}) {
        const { label = "List", color = "cyan" } = options;
        this.group(label, { color });
        items.forEach((item, index) => {
            this.log(item, {
                label: `${index + 1}`,
                color,
                padding: 0,
            });
        });
        this.groupEnd(label, { color });
    }
    // Method for logging steps in a process
    steps(steps) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalSteps = steps.length;
            for (let i = 0; i < steps.length; i++) {
                const { name, action } = steps[i];
                const stepNumber = i + 1;
                yield this.log(`Step ${stepNumber}/${totalSteps}: ${name}`, {
                    animation: "spinner",
                    color: "cyan",
                    label: "STEP",
                });
                try {
                    yield action();
                    this.success(`✓ ${name} completed`, { padding: 0 });
                }
                catch (error) {
                    this.error(`✗ ${name} failed: ${error.message}`, {
                        padding: 0,
                    });
                    throw error;
                }
            }
        });
    }
    // Method for timing operations
    time(label_1, fn_1) {
        return __awaiter(this, arguments, void 0, function* (label, fn, options = {}) {
            const start = performance.now();
            try {
                const result = yield fn();
                const duration = (performance.now() - start).toFixed(2);
                this.success(`${label} completed in ${duration}ms`, options);
                return result;
            }
            catch (error) {
                const duration = (performance.now() - start).toFixed(2);
                this.error(`${label} failed after ${duration}ms: ${error.message}`, options);
                throw error;
            }
        });
    }
    // Method for logging HTTP requests
    logRequest(req) {
        this.preset("api", {
            method: req.method,
            url: req.url,
            body: req.body,
            timestamp: new Date().toLocaleTimeString(),
        });
    }
    // Method for logging HTTP responses
    logResponse(res) {
        const color = res.status >= 400 ? "red" : "green";
        this.preset("api", {
            status: res.status,
            data: res.data,
            duration: `${res.duration}ms`,
            timestamp: new Date().toLocaleTimeString(),
        }, { color });
    }
    // Method for creating sections in logs
    section(title, fn) {
        this.preset("section", `--- ${title} ---`);
        fn();
        this.preset("section", "-".repeat(title.length + 8));
    }
    // Method for logging objects with specific key highlighting
    logObject(obj, highlightKeys = []) {
        const formatted = Object.entries(obj).map(([key, value]) => {
            if (highlightKeys.includes(key)) {
                return `${key}: \x1b[1m\x1b[33m${value}\x1b[0m`;
            }
            return `${key}: ${value}`;
        });
        this.log(formatted.join("\n"), {
            style: "border-normal",
            padding: 1,
        });
    }
    // Method for logging environment information
    logEnvironment() {
        this.section("Environment Info", () => {
            this.logObject({
                "Node Version": process.version,
                Platform: process.platform,
                Environment: process.env.NODE_ENV || "development",
                "Memory Usage": `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                "CPU Architecture": process.arch,
                "Process ID": process.pid,
                "Working Directory": process.cwd(),
            }, ["Environment"]);
        });
    }
    // Core logging methods
    shouldLog(options) {
        return options.condition !== undefined ? options.condition : true;
    }
    getTimestamp() {
        return new Date().toLocaleTimeString();
    }
    formatMessage(msg, options) {
        const { style = "", padding = 1, label = "", color, bold, italic, underline, strikethrough, timestamp, } = options;
        const paddingTopBottom = "\n".repeat(padding);
        const colorCode = color ? `\x1b[${exports.colorCodes[color]}m` : "";
        const boldCode = bold ? "\x1b[1m" : "";
        const italicCode = italic ? "\x1b[3m" : "";
        const underlineCode = underline ? "\x1b[4m" : "";
        const strikethroughCode = strikethrough ? "\x1b[9m" : "";
        const resetCode = "\x1b[0m";
        const labelText = label ? `[ ${label} ] ` : "";
        const timestampText = timestamp ? `[ ${this.getTimestamp()} ] ` : "";
        let messageContent = typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg);
        const styledMessage = `${labelText}${messageContent}`;
        const coloredMessage = `${colorCode}${boldCode}${italicCode}${underlineCode}${strikethroughCode}${styledMessage}${resetCode}`;
        switch (style) {
            case "spacy":
                return `\n\n${timestampText}${coloredMessage}\n\n`;
            case "extra-spacy":
                return `\n\n\n\n\n${timestampText}${coloredMessage}\n\n\n\n\n`;
            case "border-dashed":
                return `\n${timestampText} --- ${coloredMessage} ---\n`;
            case "border-normal":
                return `\n${timestampText}=== ${coloredMessage} ===\n`;
            case "double":
                return `\n${timestampText}=== ${coloredMessage} ===\n`;
            default:
                return `\n${timestampText}${coloredMessage}\n`;
        }
    }
    // Animation methods
    processAnimationOptions(options) {
        if (!options.animation) {
            return exports.defaultAnimationOptions;
        }
        if (typeof options.animation === "string") {
            return Object.assign(Object.assign({}, exports.defaultAnimationOptions), { enabled: true, type: options.animation });
        }
        return Object.assign(Object.assign(Object.assign({}, exports.defaultAnimationOptions), options.animation), { enabled: true });
    }
    startSpinner() {
        return __awaiter(this, arguments, void 0, function* (message = "Loading...", color = "cyan") {
            let frameIndex = 0;
            const frames = exports.defaultAnimationOptions.frames || [];
            this.spinnerInterval = setInterval(() => {
                process.stdout.write(`\r\x1b[${exports.colorCodes[color]}m${message} ${frames[frameIndex]}\x1b[0m`);
                frameIndex = (frameIndex + 1) % frames.length;
            }, exports.defaultAnimationOptions.speed);
        });
    }
    stopSpinner() {
        if (this.spinnerInterval) {
            clearInterval(this.spinnerInterval);
            this.spinnerInterval = null;
            process.stdout.write("\r\x1b[K");
        }
    }
    startProgressBar() {
        return __awaiter(this, arguments, void 0, function* (total = 100, color = "green") {
            let current = 0;
            this.progressInterval = setInterval(() => {
                const progress = Math.floor((current / total) * 50);
                const bar = `${"█".repeat(progress)}${".".repeat(50 - progress)}`;
                process.stdout.write(`\r\x1b[${exports.colorCodes[color]}m[${bar}] ${current}/${total}\x1b[0m`);
                current += 1;
                if (current > total)
                    this.stopProgressBar();
            }, 50);
        });
    }
    stopProgressBar() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            process.stdout.write("\r\x1b[K");
        }
    }
    typeMessage(message_1) {
        return __awaiter(this, arguments, void 0, function* (message, speed = 50, color = "white") {
            for (const char of message) {
                process.stdout.write(`\x1b[${exports.colorCodes[color]}m${char}\x1b[0m`);
                yield new Promise((resolve) => setTimeout(resolve, speed));
            }
            process.stdout.write("\n");
        });
    }
    // Table handling methods
    printTableWithStyle(data, options) {
        const { style = "", padding = 1, label = "", color, bold, italic, underline, strikethrough, timestamp, } = options;
        const paddingTopBottom = "\n".repeat(padding);
        const colorCode = color ? `\x1b[${exports.colorCodes[color]}m` : "";
        const boldCode = bold ? "\x1b[1m" : "";
        const italicCode = italic ? "\x1b[3m" : "";
        const underlineCode = underline ? "\x1b[4m" : "";
        const strikethroughCode = strikethrough ? "\x1b[9m" : "";
        const resetCode = "\x1b[0m";
        const labelText = label
            ? `${colorCode}${boldCode}[ ${label} ]${resetCode}`
            : "";
        const timestampText = timestamp ? `[ ${this.getTimestamp()} ] ` : "";
        const border = (() => {
            switch (style) {
                case "border-dashed":
                    return `${"-".repeat(60)}\n`;
                case "double":
                    return `${"=".repeat(60)}\n`;
                case "border-normal":
                    return `${"_".repeat(60)}\n`;
                default:
                    return "";
            }
        })();
        const styledBorder = `${colorCode}${border}${resetCode}`;
        console.log(paddingTopBottom);
        console.log(`${timestampText}${labelText}`);
        console.log(styledBorder);
        console.log(`Total Entries: ${data.length}`);
        console.log(`Total Fields: ${Object.keys(data[0] || {}).length}`);
        console.log(`Fields: ${Object.keys(data[0] || {}).join(", ")}`);
        console.log(styledBorder);
        console.table(data);
        console.log(styledBorder + paddingTopBottom);
    }
    // Private helper methods
    formatData(data, options) {
        if (Array.isArray(data) && data.every((item) => typeof item === "object")) {
            return options.tableView === false
                ? JSON.stringify(data, null, 2)
                : "TABLE_VIEW:" + JSON.stringify(data);
        }
        if (typeof data === "object" && data !== null) {
            return JSON.stringify(data, null, 2);
        }
        return String(data);
    }
    handleAnimation(msg, animationOptions, options) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (animationOptions.type) {
                case "spinner":
                    yield this.animateSpinner(msg, animationOptions, options);
                    break;
                case "typing":
                    yield this.typeMessage(String(msg), animationOptions.speed || 50, options.color);
                    break;
                case "progressBar":
                    yield this.animateProgressBar(msg, animationOptions, options);
                    break;
            }
        });
    }
    animateSpinner(msg, animationOptions, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.startSpinner(animationOptions.text || String(msg), options.color || "cyan");
                setTimeout(() => {
                    this.stopSpinner();
                    this.printMessage(msg, options);
                    resolve();
                }, animationOptions.duration || 2000);
            });
        });
    }
    animateProgressBar(msg, animationOptions, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.startProgressBar(100, options.color || "green");
                setTimeout(() => {
                    this.stopProgressBar();
                    this.printMessage(msg, options);
                    resolve();
                }, animationOptions.duration || 2000);
            });
        });
    }
    // Public methods
    log(msg_1) {
        return __awaiter(this, arguments, void 0, function* (msg, options = {}) {
            const animationOptions = this.processAnimationOptions(options);
            if (animationOptions.enabled) {
                yield this.handleAnimation(msg, animationOptions, options);
            }
            else {
                this.printMessage(msg, options);
            }
        });
    }
    printMessage(msg, options) {
        if (!this.shouldLog(options))
            return;
        const formattedData = this.formatData(msg, options);
        if (formattedData.startsWith("TABLE_VIEW:")) {
            const data = JSON.parse(formattedData.replace("TABLE_VIEW:", ""));
            this.printTableWithStyle(data, options);
            return;
        }
        const formattedMessage = this.formatMessage(formattedData, options);
        console.log(formattedMessage);
    }
    info(msg) {
        console.info(msg);
    }
    warn(msg) {
        console.warn(msg);
    }
    error(msg, options = {}) {
        console.error(msg);
    }
    success(msg, options = {}) {
        this.log(msg, Object.assign(Object.assign({}, options), { color: options.color || "green" }));
    }
    debug(msg, options = {}) {
        this.log(msg, Object.assign(Object.assign({}, options), { color: options.color || "gray" }));
    }
    clear() {
        console.clear();
    }
    delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
    group(groupName, options = {}) {
        const color = options.color || "white";
        const border = "-".repeat(10);
        const formattedGroupName = ` ${groupName} `;
        const groupHeader = `\n\n<${border}${formattedGroupName}${border}>`;
        console.log(`\x1b[${exports.colorCodes[color]}m\x1b[1m${groupHeader}\x1b[0m`);
    }
    groupEnd(groupName, options = {}) {
        const color = options.color || "white";
        const border = "-".repeat(10);
        const formattedGroupName = ` ${groupName} `;
        const groupHeader = `\n\n<${border}${formattedGroupName}${border}>`;
        console.log(`\x1b[${exports.colorCodes[color]}m\x1b[1m${groupHeader}\x1b[0m \n\n`);
    }
}
// Export singleton instance
exports.konsoul = new Konsoul();
