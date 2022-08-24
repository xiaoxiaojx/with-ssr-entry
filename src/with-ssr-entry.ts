import * as IWebpack from "webpack";
import { isObject, ignoreCssFiles, injectSsrEntry } from "./utils";

export interface WebpackEntrypoints {
  [bundle: string]: string | string[];
}

export default function (nextConfig: Record<string, any> = {}) {
  ignoreCssFiles();

  return Object.assign({}, nextConfig, {
    webpack(config: IWebpack.Configuration, options: Record<string, any>) {
      const { isServer } = options;

      if (isServer) {
        const originalEntry: any = config.entry;
        if (typeof originalEntry !== "undefined") {
          config.entry = async () => {
            let entry: WebpackEntrypoints =
              typeof originalEntry === "function"
                ? await originalEntry()
                : originalEntry;

            if (isObject(entry)) {
              Object.keys(entry).forEach((key) => {
                const value = entry[key];
                // @kaiduo webpack5
                // @ts-ignore
                if (typeof value === "object" && value.import) {
                  // @ts-ignore
                  value.import = injectSsrEntry(value.import);
                } else {
                  entry[key] = injectSsrEntry(value);
                }
              });
            }
            return entry;
          };
        }
      }

      // @ts-ignore
      config.module.rules[3].oneOf = config.module.rules[3].oneOf.filter(
        // @ts-ignore
        (item) => {
          // @ts-ignore
          if (item.use && item.use.loader === "error-loader") {
            return false;
          }

          if (
            item.issuer &&
            // @ts-ignore
            Array.isArray(item.issuer.not) &&
            // @ts-ignore
            item.issuer.not.find((i) => i.toString() === "/node_modules/")
          ) {
            // @ts-ignore
            item.issuer.not = item.issuer.not.filter(
              // @ts-ignore
              (i) => i.toString() !== "/node_modules/"
            );
          }
          if (
            item.issuer &&
            // @ts-ignore
            typeof item.issuer.not === "string" &&
            // @ts-ignore
            item.issuer.not.toString() === "/node_modules/"
          ) {
            // @ts-ignore
            item.issuer.not = [];
          }
          return true;
        }
      );

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
}
