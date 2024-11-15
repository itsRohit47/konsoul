export type LogStyle =
  | "spacy"
  | "extra-spacy"
  | "border-dashed"
  | "border-normal"
  | "double";

export type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "log"
  | "debug"
  | "group"
  | "groupEnd"
  | "table";

export type ColorName =
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "black"
  | "gray"
  | "lightgray"
  | "lightred"
  | "lightgreen"
  | "lightyellow"
  | "lightblue"
  | "lightmagenta"
  | "lightcyan"
  | "lightwhite";

export type AnimationType = "spinner" | "progressBar" | "typing" | "none";

export interface AnimationOptions {
  enabled: boolean;
  type: AnimationType;
  duration?: number;
  frames?: string[];
  text?: string;
  speed?: number;
}

export interface LogOptions {
  style?: LogStyle;
  padding?: number;
  label?: string;
  timestamp?: boolean;
  color?: ColorName;
  animation?: AnimationOptions | AnimationType;
  tableView?: boolean;
  condition?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  underlineColor?: ColorName;
  strikethroughColor?: ColorName;
}

export interface PresetConfig {
  label?: string;
  style?: LogStyle;
  color?: ColorName;
  timestamp?: boolean;
  padding?: number;
}

export const colorCodes: Record<ColorName, string> = {
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

export const defaultAnimationOptions: AnimationOptions = {
  enabled: false,
  type: "none",
  duration: 2000,
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  text: "Loading...",
  speed: 80,
};

class Konsoul {
  private presets: Record<string, PresetConfig> = {
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

  // Method to add custom presets
  addPreset(name: string, config: PresetConfig) {
    this.presets[name] = config;
  }

  // Enhanced logging methods with presets
  preset(presetName: string, msg: any, additionalOptions: LogOptions = {}) {
    const presetConfig = this.presets[presetName] || {};
    return this.log(msg, { ...presetConfig, ...additionalOptions });
  }

  // Method for logging arrays of data with auto-grouping
  logList(items: any[], options: LogOptions = {}) {
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
  async steps(steps: { name: string; action: () => Promise<any> }[]) {
    const totalSteps = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const { name, action } = steps[i];
      const stepNumber = i + 1;

      await this.log(`Step ${stepNumber}/${totalSteps}: ${name}`, {
        animation: "spinner",
        color: "cyan",
        label: "STEP",
      });

      try {
        await action();
        this.success(`✓ ${name} completed`, { padding: 0 });
      } catch (error) {
        this.error(`✗ ${name} failed: ${(error as Error).message}`, {
          padding: 0,
        });
        throw error;
      }
    }
  }

  // Method for timing operations
  async time<T>(
    label: string,
    fn: () => Promise<T> | T,
    options: LogOptions = {}
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = (performance.now() - start).toFixed(2);

      this.success(`${label} completed in ${duration}ms`, options);
      return result;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      this.error(
        `${label} failed after ${duration}ms: ${(error as Error).message}`,
        options
      );
      throw error;
    }
  }

  // Method for logging HTTP requests
  logRequest(req: { method: string; url: string; body?: any }) {
    this.preset("api", {
      method: req.method,
      url: req.url,
      body: req.body,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // Method for logging HTTP responses
  logResponse(res: { status: number; data?: any; duration?: number }) {
    const color = res.status >= 400 ? "red" : "green";
    this.preset(
      "api",
      {
        status: res.status,
        data: res.data,
        duration: `${res.duration}ms`,
        timestamp: new Date().toLocaleTimeString(),
      },
      { color }
    );
  }

  // Method for creating sections in logs
  section(title: string, fn: () => void) {
    this.preset("section", `--- ${title} ---`);
    fn();
    this.preset("section", "-".repeat(title.length + 8));
  }

  // Method for logging objects with specific key highlighting
  logObject(obj: object, highlightKeys: string[] = []) {
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
      this.logObject(
        {
          "Node Version": process.version,
          Platform: process.platform,
          Environment: process.env.NODE_ENV || "development",
          "Memory Usage": `${Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
          )}MB`,
          "CPU Architecture": process.arch,
          "Process ID": process.pid,
          "Working Directory": process.cwd(),
        },
        ["Environment"]
      );
    });
  }

  private spinnerInterval: NodeJS.Timeout | null = null;
  private progressInterval: NodeJS.Timeout | null = null;

  // Core logging methods
  private shouldLog(options: LogOptions): boolean {
    return options.condition !== undefined ? options.condition : true;
  }

  private getTimestamp(): string {
    return new Date().toLocaleTimeString();
  }

  private formatMessage(msg: any, options: LogOptions): string {
    const {
      style = "",
      padding = 1,
      label = "",
      color,
      bold,
      italic,
      underline,
      strikethrough,
      timestamp,
    } = options;

    const paddingTopBottom = "\n".repeat(padding);
    const colorCode = color ? `\x1b[${colorCodes[color]}m` : "";
    const boldCode = bold ? "\x1b[1m" : "";
    const italicCode = italic ? "\x1b[3m" : "";
    const underlineCode = underline ? "\x1b[4m" : "";
    const strikethroughCode = strikethrough ? "\x1b[9m" : "";
    const resetCode = "\x1b[0m";
    const labelText = label ? `[ ${label} ] ` : "";
    const timestampText = timestamp ? `[ ${this.getTimestamp()} ] ` : "";

    let messageContent =
      typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg);

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
  private processAnimationOptions(options: LogOptions): AnimationOptions {
    if (!options.animation) {
      return defaultAnimationOptions;
    }

    if (typeof options.animation === "string") {
      return {
        ...defaultAnimationOptions,
        enabled: true,
        type: options.animation,
      };
    }

    return {
      ...defaultAnimationOptions,
      ...options.animation,
      enabled: true,
    };
  }

  // Table handling methods
  private printTableWithStyle(data: object[], options: LogOptions) {
    const {
      style = "",
      padding = 1,
      label = "",
      color,
      bold,
      italic,
      underline,
      strikethrough,
      timestamp,
    } = options;

    const paddingTopBottom = "\n".repeat(padding);
    const colorCode = color ? `\x1b[${colorCodes[color]}m` : "";
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
  private formatData(data: any, options: LogOptions): string {
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

  private printMessage(msg: any, options: LogOptions) {
    if (!this.shouldLog(options)) return;

    const formattedData = this.formatData(msg, options);

    if (formattedData.startsWith("TABLE_VIEW:")) {
      const data = JSON.parse(formattedData.replace("TABLE_VIEW:", ""));
      this.printTableWithStyle(data, options);
      return;
    }

    const formattedMessage = this.formatMessage(formattedData, options);
    console.log(formattedMessage);
  }

  log(msg: any, options: LogOptions = {}) {
    this.printMessage(msg, options);
  }

  info(msg: any) {
    console.info(msg);
  }

  warn(msg: any) {
    console.warn(msg);
  }

  error(msg: any, options: LogOptions = {}) {
    console.error(msg);
  }

  success(msg: any, options: LogOptions = {}) {
    this.log(msg, { ...options, color: options.color || "green" });
  }

  debug(msg: any, options: LogOptions = {}) {
    this.log(msg, { ...options, color: options.color || "gray" });
  }

  clear() {
    console.clear();
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  group(groupName: string, options: LogOptions = {}) {
    const color = options.color || "white";
    const border = "-".repeat(10);
    const formattedGroupName = ` ${groupName} `;
    const groupHeader = `\n\n<${border}${formattedGroupName}${border}>`;
    console.log(`\x1b[${colorCodes[color]}m\x1b[1m${groupHeader}\x1b[0m`);
  }

  groupEnd(groupName: string, options: LogOptions = {}) {
    const color = options.color || "white";
    const border = "-".repeat(10);
    const formattedGroupName = ` ${groupName} `;
    const groupHeader = `\n\n<${border}${formattedGroupName}${border}>`;
    console.log(`\x1b[${colorCodes[color]}m\x1b[1m${groupHeader}\x1b[0m \n\n`);
  }
}

export const konsoul = new Konsoul();
