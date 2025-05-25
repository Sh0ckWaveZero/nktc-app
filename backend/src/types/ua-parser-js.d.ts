declare module 'ua-parser-js' {
  export interface IResult {
    ua: string;
    browser: IBrowser;
    device: IDevice;
    engine: IEngine;
    os: IOS;
    cpu: ICPU;
  }

  export interface IBrowser {
    name?: string;
    version?: string;
    major?: string;
  }

  export interface IDevice {
    model?: string;
    type?: string;
    vendor?: string;
  }

  export interface IEngine {
    name?: string;
    version?: string;
  }

  export interface IOS {
    name?: string;
    version?: string;
  }

  export interface ICPU {
    architecture?: string;
  }

  export class UAParser {
    constructor(uastring?: string, extensions?: any, headers?: any);
    getResult(): IResult;
    getUA(): string;
    setUA(uastring: string): UAParser;
    getBrowser(): IBrowser;
    getCPU(): ICPU;
    getDevice(): IDevice;
    getEngine(): IEngine;
    getOS(): IOS;
  }

  export { UAParser as default };
}
