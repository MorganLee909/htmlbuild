const express = require("express");
const esbuild = require("esbuild");
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

const htmlbuild = async (options)=>{
    const app = express();
    const routes = await findRoutes(`${__dirname}/routes`);

    for(let i = 0; i < routes.length; i++){
        app.get(routes[i].replace(`${__dirname}/routes`, ""), (req, res)=>{res.send(routes[i])});
    }

    app.listen(8000);
}

htmlbuild();
