const { ethereumTokens, polygonTokens, bscTokens, optimismTokens, fantomTokens, avalancheTokens, arbitrumTokens, ChainId } = require('@real-wagmi/sdk');
const { readFileSync, rmdirSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

function bootstrap(){
    const defaultList = JSON.parse(readFileSync(join(__dirname, '../tokenlist.json')));

    const newList = {...JSON.parse(JSON.stringify(defaultList)), tokens: []};

    let count = 0;

    const tokens = [ethereumTokens, polygonTokens, bscTokens, optimismTokens, fantomTokens, avalancheTokens, arbitrumTokens].flatMap((tokens) => Object.values(tokens));
    const chains = [ChainId.ETHEREUM, ChainId.POLYGON, ChainId.BSC, ChainId.OPTIMISM, ChainId.FANTOM, ChainId.AVALANCHE, ChainId.ARBITRUM];

    for(let i = 0; i < defaultList.tokens.length; i++){
        const token = defaultList.tokens[i];
        if(!chains.includes(token.chainId)){
            newList.tokens.push(token);
            continue;
        };

        const forDelete = !Boolean(tokens.find((t) => t.chainId === token.chainId && token.address.toLowerCase() === t.address.toLowerCase()));
        if(forDelete){
            const logoFolderExist = existsSync(join(__dirname, `../logos/${token.chainId}/${token.address}/`));
            if(logoFolderExist){
                rmdirSync(join(__dirname, `../logos/${token.chainId}/${token.address}/`), { recursive: true });
            }
            count += 1;
        } else {
            newList.tokens.push(token);
        }
    }

    writeFileSync(join(__dirname, '../tokenlist.json'), JSON.stringify(newList, null, 4));

    console.log(`was deleted: ${count}`);
}

bootstrap();