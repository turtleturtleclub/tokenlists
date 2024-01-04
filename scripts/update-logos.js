const axios = require('axios').default;
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

async function bootstrap(){
    const defaultList = JSON.parse(readFileSync(join(__dirname, '../tokenlist.json')));

    for(let i = 0; i < defaultList.tokens.length; i++){
        const token = defaultList.tokens[i];
        if(!token.logoURI.includes("https://raw.githubusercontent.com/RealWagmi")){
            try{
                const chainFolderExist = existsSync(join(__dirname, `../logos/${token.chainId}`));
                if(!chainFolderExist){
                    mkdirSync(join(__dirname, `../logos/${token.chainId}`));
                }
                console.log(`download logo for token ${token.chainId} | ${token.address} | ${token.symbol}`);
                const logoFolderExist = existsSync(join(__dirname, `../logos/${token.chainId}/${token.address}/`));
                if(!logoFolderExist){
                    mkdirSync(join(__dirname, `../logos/${token.chainId}/${token.address}/`));
                }
                const response = await axios.get(token.logoURI, { responseType: "arraybuffer" });
                writeFileSync(join(__dirname, `../logos/${token.chainId}/${token.address}/logo.png`), response.data);

                defaultList.tokens[i].logoURI = `https://raw.githubusercontent.com/RealWagmi/tokenlists/main/logos/${token.chainId}/${token.address}/logo.png`;
            } catch(err) {
                console.log(err)
            }
        }
    }

    writeFileSync(join(__dirname, '../tokenlist.json'), JSON.stringify(defaultList, null, 4));
}

bootstrap();