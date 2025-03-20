/**
 * JSON format for Buttplug Device Config Files.
 */
export interface ButtplugDeviceConfigSchema {
    /**
     * Version of the device configuration file.
     */
    version: {
      major?: number
      minor?: number
      [k: string]: unknown
    }
    protocols?: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^.*$".
       */
      [k: string]: {
        communication?: {
          btle?: {
            names: [string, ...string[]]
            "manufacturer-data"?: {
              company: number
              "expected-length"?: number
              data?: number[]
              [k: string]: unknown
            }[]
            "advertised-services"?: string[]
            services: {
              /**
               * This interface was referenced by `undefined`'s JSON-Schema definition
               * via the `patternProperty` "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$".
               */
              [k: string]: {
                /**
                 * This interface was referenced by `undefined`'s JSON-Schema definition
                 * via the `patternProperty` "^(command|firmware|rx|rxaccel|rxblebattery|rxblemodel|rxpressure|rxtouch|tx|txmode|txshock|txvibrate|txvendorcontrol|whitelist|generic[1-2]?[0-9]|generic3[0-1])$".
                 */
                [k: string]: string
              }
            }
          }
          serial?: {
            port: string
            "baud-rate": number
            "data-bits": number
            parity: string
            "stop-bits": number
          }
          websocket?: {
            name: string
          }
          usb?: {
            pairs: [
              {
                "vendor-id": number
                "product-id": number
              },
              ...{
                "vendor-id": number
                "product-id": number
              }[]
            ]
            [k: string]: unknown
          }
          hid?: {
            pairs: [
              {
                "vendor-id": number
                "product-id": number
              },
              ...{
                "vendor-id": number
                "product-id": number
              }[]
            ]
            [k: string]: unknown
          }
          xinput?: {
            exists?: boolean
            [k: string]: unknown
          }
          "lovense-connect-service"?: {
            exists?: boolean
            [k: string]: unknown
          }
          [k: string]: unknown
        }[]
        devices?: {
          defaults?: {
            name: string
            /**
             * Attributes for device messages.
             */
            features: {
              description?: string
              "feature-type": string
              actuator?: {
                /**
                 * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
                 */
                "step-range": [number, number]
                messages: string[]
                [k: string]: unknown
              }
              sensor?: {
                "value-range": [[number, number], ...[number, number][]]
                messages: string[]
                [k: string]: unknown
              }
            }[]
            [k: string]: unknown
          }
          configurations?: [
            {
              identifier: [string, ...string[]]
              name: string
              /**
               * Attributes for device messages.
               */
              features?: {
                description?: string
                "feature-type": string
                actuator?: {
                  /**
                   * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
                   */
                  "step-range": [number, number]
                  messages: string[]
                  [k: string]: unknown
                }
                sensor?: {
                  "value-range": [[number, number], ...[number, number][]]
                  messages: string[]
                  [k: string]: unknown
                }
              }[]
            },
            ...{
              identifier: [string, ...string[]]
              name: string
              /**
               * Attributes for device messages.
               */
              features?: {
                description?: string
                "feature-type": string
                actuator?: {
                  /**
                   * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
                   */
                  "step-range": [number, number]
                  messages: string[]
                  [k: string]: unknown
                }
                sensor?: {
                  "value-range": [[number, number], ...[number, number][]]
                  messages: string[]
                  [k: string]: unknown
                }
              }[]
            }[]
          ]
          [k: string]: unknown
        }
        [k: string]: unknown
      }
    }
    "user-configs"?: {
      protocols?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "^.*$".
         */
        [k: string]: {
          communication?: {
            btle?: {
              names: [string, ...string[]]
              "manufacturer-data"?: {
                company: number
                "expected-length"?: number
                data?: number[]
                [k: string]: unknown
              }[]
              "advertised-services"?: string[]
              services: {
                /**
                 * This interface was referenced by `undefined`'s JSON-Schema definition
                 * via the `patternProperty` "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$".
                 */
                [k: string]: {
                  /**
                   * This interface was referenced by `undefined`'s JSON-Schema definition
                   * via the `patternProperty` "^(command|firmware|rx|rxaccel|rxblebattery|rxblemodel|rxpressure|rxtouch|tx|txmode|txshock|txvibrate|txvendorcontrol|whitelist|generic[1-2]?[0-9]|generic3[0-1])$".
                   */
                  [k: string]: string
                }
              }
            }
            serial?: {
              port: string
              "baud-rate": number
              "data-bits": number
              parity: string
              "stop-bits": number
            }
            websocket?: {
              name: string
            }
            usb?: {
              pairs: [
                {
                  "vendor-id": number
                  "product-id": number
                },
                ...{
                  "vendor-id": number
                  "product-id": number
                }[]
              ]
              [k: string]: unknown
            }
            hid?: {
              pairs: [
                {
                  "vendor-id": number
                  "product-id": number
                },
                ...{
                  "vendor-id": number
                  "product-id": number
                }[]
              ]
              [k: string]: unknown
            }
            [k: string]: unknown
          }[]
          devices?: {
            configurations?: [
              {
                identifier: [string, ...string[]]
                name: string
                /**
                 * Attributes for device messages.
                 */
                features?: {
                  description?: string
                  "feature-type": string
                  actuator?: {
                    /**
                     * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
                     */
                    "step-range": [number, number]
                    messages: string[]
                    [k: string]: unknown
                  }
                  sensor?: {
                    "value-range": [[number, number], ...[number, number][]]
                    messages: string[]
                    [k: string]: unknown
                  }
                }[]
              },
              ...{
                identifier: [string, ...string[]]
                name: string
                /**
                 * Attributes for device messages.
                 */
                features?: {
                  description?: string
                  "feature-type": string
                  actuator?: {
                    /**
                     * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
                     */
                    "step-range": [number, number]
                    messages: string[]
                    [k: string]: unknown
                  }
                  sensor?: {
                    "value-range": [[number, number], ...[number, number][]]
                    messages: string[]
                    [k: string]: unknown
                  }
                }[]
              }[]
            ]
            [k: string]: unknown
          }
          [k: string]: unknown
        }
      }
      devices?: {
        identifier: {
          address: string
          protocol: string
          identifier?: string
        }
        config: {
          name?: string
          /**
           * Attributes for device messages, with additional customization for user configs.
           */
          features?: {
            description?: string
            "feature-type": string
            actuator?: {
              /**
               * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
               */
              "step-range": [number, number]
              /**
               * Specifies the range of steps to use for a device. Devices will use the low end value as a stop.
               */
              "step-limit": [number, number]
              messages: string[]
              [k: string]: unknown
            }
            sensor?: {
              "value-range": [[number, number], ...[number, number][]]
              messages: string[]
              [k: string]: unknown
            }
          }[]
          "user-config"?: {
            allow: boolean
            deny: boolean
            "display-name"?: string
            index: number
          }
        }
      }[]
    }
    additionalProperties?: false
  }
  