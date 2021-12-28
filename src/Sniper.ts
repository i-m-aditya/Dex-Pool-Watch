import { ABI_UniswapV2Factory } from "./utils/constants"; // ABIs
import { providers, Wallet, utils, BigNumber, Contract, ethers } from "ethers"; // Ethers
import { logger } from "./utils/logging";
import { pool } from "./utils/mysql";

export default class Sniper {
    rpc: providers.JsonRpcProvider;
    wallet: Wallet;
    factory: Contract;
    
    constructor(
        factoryAddress: string,
        rpcEndpoint: string,
        privateKey: string,
    ) {
        this.rpc = new providers.JsonRpcProvider(rpcEndpoint);
        this.wallet = new Wallet(privateKey, this.rpc);
        this.factory = new Contract(factoryAddress, ABI_UniswapV2Factory, this.rpc);
    }

    
     async snipe(): Promise<void> {
        logger.info("Beginning to monitor UniswapV2Factory");
        
        // Listen for pair creation
        this.factory.on("PairCreated", async (token0: string, token1: string, pair?: string) => {  
          // Log new created pairs
          logger.info("Pair created !");
          console.log(token0, token1, pair);
          
          logger.info(`New pair: ${token0}, ${token1}, ${pair}`);
          var query: string = `INSERT INTO PairCreated VALUES ("${token0}", "${token1}", "${pair}");`;
          
          pool.query( 
                query, 
                function (err, result) {
                if(err)
                    console.log(`Error executing the query - ${err}`)
                else {
                    pool.end();
                }            
          })
         
        });
      }

      async updateDatabaseWithPastEventsTillBlockN(block: number): Promise<void> {
        logger.info("Beginning to monitor UniswapV2Factory");

        const iface = new ethers.utils.Interface(ABI_UniswapV2Factory);
        const logs = await this.rpc.getLogs({
            fromBlock: 13884000,
            toBlock: block,
            address: process.env.FACTORY_ADDRESS,
            topics: ["0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9"]
        })
        
        const eventsData = logs.map(log => {
            const p = iface.parseLog(log)           
            return {
                token0: p.args.token0,
                token1: p.args.token1,
                pair: p.args.pair
            }
        });

        console.log("Events Data : ", eventsData);

        var query: string = `INSERT INTO PairCreated VALUES `;
        eventsData.forEach(element => {
            query += `( "${element.token0}", "${element.token1}", "${element.pair}"), `
        });
        query = query.slice(0,-2) + ';'
        pool.query( 
                query, 
                function (err, result) {
                if(err)
                    console.log(`Error executing the query - ${err}`)
                else {
                    pool.end();
                }
                        
        })
    }
}

  