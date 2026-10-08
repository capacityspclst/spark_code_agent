// Type declarations for the platform files: Metro picks device.native.ts on iOS/Android and device.web.ts on
// the web. This file is what TypeScript and Jest see; Jest tests use the in-memory store instead.
export { createDeviceKeyProvider, createDeviceRawStore } from './device.native';
