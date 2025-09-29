declare module "@solana/web3.js" {
  export class Connection {
    constructor(endpoint: string);
    getSlot(): Promise<number>;
    getVersion(): Promise<{ "solana-core": string }>;
  }
}
