const axios = require('axios').default;
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { isAddress, getAddress } = require('viem');
const { join } = require('path');
const { ChainId } = require('@real-wagmi/sdk');

const lists = [
    "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    "https://tokens.coingecko.com/uniswap/all.json",
    "https://tokens.coingecko.com/binance-smart-chain/all.json",
    "https://tokens.coingecko.com/fantom/all.json",
    "https://assets.spooky.fi/spookyswap.json",
    "https://tokens.coingecko.com/polygon-pos/all.json",
    "https://static.optimism.io/optimism.tokenlist.json",
    "https://bridge.arbitrum.io/token-list-42161.json",
    "https://raw.githubusercontent.com/plasmadlt/plasma-finance-token-list/master/bnb.json",
    "https://www.coingecko.com/tokens_list/avalanche/all/latest.json",
    "https://tokens.coingecko.com/metis-andromeda/all.json"
]

const downloadImage = true;

async function bootstrap(){
    const defaultList = JSON.parse(readFileSync(join(__dirname, '../tokenlist.json')));
    const supportedChains = Object.values(ChainId).filter((chain) => !isNaN(Number(chain))).map((chain) => Number(chain));
    let count = 0;

    for(const url of lists){
        try{
            const { data } = await axios.get(url);
            if(data && Array.isArray(data.tokens)){
                for(const token of data.tokens){
                    if(isAddress(token.address) && !isNaN(token.chainId) && token.logoURI){
                        if(!supportedChains.includes(token.chainId)) continue;

                        const incomingTokenAddress = getAddress(token.address);
                        const isExist = defaultList.tokens.find(({ chainId, address }) => chainId === token.chainId && address.toLowerCase() === incomingTokenAddress.toLowerCase());
                        if(!isExist){
                            try{
                                const chainFolderExist = existsSync(join(__dirname, `../logos/${token.chainId}`));
                                if(!chainFolderExist){
                                    mkdirSync(join(__dirname, `../logos/${token.chainId}`));
                                }
                                console.log(`new token incoming ${token.chainId} | ${incomingTokenAddress} | ${token.symbol}`);
                                if(downloadImage){
                                    const logoFolderExist = existsSync(join(__dirname, `../logos/${token.chainId}/${incomingTokenAddress}/`));
                                    if(!logoFolderExist){
                                        mkdirSync(join(__dirname, `../logos/${token.chainId}/${incomingTokenAddress}/`));
                                    }
                                    const response = await axios.get(token.logoURI, { responseType: "arraybuffer" });
                                    writeFileSync(join(__dirname, `../logos/${token.chainId}/${incomingTokenAddress}/logo.png`), response.data);
                                }

                                defaultList.tokens.push({
                                    chainId: token.chainId,
                                    address: incomingTokenAddress,
                                    decimals: token.decimals,
                                    name: token.name,
                                    symbol: token.symbol,
                                    tags: [],
                                    logoURI: downloadImage ? `https://raw.githubusercontent.com/RealWagmi/tokenlists/main/logos/${token.chainId}/${incomingTokenAddress}/logo.png`: token.logoURI
                                });
                                count += 1;
                            } catch(err){
                                console.log(`can\'t added token list ${token.chainId} | ${incomingTokenAddress} | ${token.symbol} | ${token.logoURI}`);

                                defaultList.tokens.push({
                                    chainId: token.chainId,
                                    address: incomingTokenAddress,
                                    decimals: token.decimals,
                                    name: token.name,
                                    symbol: token.symbol,
                                    tags: [],
                                    logoURI: token.logoURI
                                });
                                count += 1;
                            }
                        }
                    }
                }
            }
        } catch(err){
            console.log(`can\'t load list ${url}`);
        }
    }

    defaultList.tokens = defaultList.tokens.sort((a, b) => a.chainId > b.chainId ? 1 : -1)

    console.log(`done! | new tokens ${count}`);
    writeFileSync(join(__dirname, '../tokenlist.json'), JSON.stringify(defaultList, null, 4));
}

bootstrap();