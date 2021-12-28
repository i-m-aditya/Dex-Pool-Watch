import * as dotenv from "dotenv"; 
import Sniper from "./Sniper";

dotenv.config();
(async () => {
    // Factory address

    const factoryAddress: string | undefined = process.env.FACTORY_ADDRESS;
    // RPC endpoint
    const rpcEndpoint: string =
      process.env.RPC_ENDPOINT ?? "http://localhost:8545";
    // Wallet private key
    const privateKey: string | undefined = process.env.PRIVATE_KEY;
    
    console.log(factoryAddress);
    console.log(rpcEndpoint);
    console.log(privateKey);
    

    // Throw if missing necessary params
    if ( !privateKey || !factoryAddress) {
      throw new Error("Missing necessary parameters");
    }
  
    // Initialize sniper
    const sniper = new Sniper(
      factoryAddress,
      rpcEndpoint,
      privateKey
    );
    // Wait and snipe pool
    await sniper.snipe();
  })();