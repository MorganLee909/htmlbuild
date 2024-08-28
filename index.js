const express = require("express");
const esbuild = require("esbuild");
const compression = require("compression");
const fs = require("node:fs/promises");

const findRoutes = async (dir)=>{
    let routes = [];
    const files = await fs.readdir(dir);
    for(let i = 0; i < files.length; i++){
        if(files[i] === "index.html") routes.push(dir);
        if(!files[i].includes(".")) routes = routes.concat(await findRoutes(`${dir}/${files[i]}`));
    }

    return routes;
}

const buildBundle = async (html)=>{
    const file = await fs.readFile(`${html}/index.html`, "utf8");
    let newFile = "";

    for(let i = 0; i < file.length; i++){
        if(file[i] === "<" && file[i+1].charCodeAt(0) >= 65 && file[i+1].charCodeAt(0) <= 90){
            let j = 1;
            while(file[i+j] !== ">"){
                j++;
            }
            let tag = file.substring(file[i], file[i+j]);
            tag = tag.replaceAll("<", "");
            tag = tag.replaceAll(">", "");
            tag = tag.replaceAll("/", "");
            tag = tag.replaceAll("-", "");
            newFile += await fs.readFile(`${html}/${tag}.html`);
            
            i += j;
        }else{
            newFile += file[i];
        }
    }

    //Working here
    //Need to create direction if it doesn't already exist
    console.log(html.replace(`${__dirname}/routes`, ""));
    let createdFile = `${__dirname}/build/${html.replace(`${__dirname}/routes`, "")}index.html`;
    console.log(createdFile);
    await fs.writeFile(createdFile, newFile);
    return createdFile;
}

const htmlbuild = async (options)=>{
    const app = express();
    app.use(compression());

    const routes = await findRoutes(`${__dirname}/routes`);
    for(let i = 0; i < routes.length; i++){
        const routeFile = await buildBundle(routes[i]);
        app.get(routes[i].replace(`${__dirname}/routes`, ""), (req, res)=>{res.sendFile(routeFile)});
    }

    app.listen(8000);
}

htmlbuild();

module.exports = htmlbuild();
