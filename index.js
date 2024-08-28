const express = require("express");
const esbuild = require("esbuild");
const compression = require("compression");
const fs = require("node:fs/promises");
const path = require("path");
const esbuildOptions = {
    bundle: true,
    minify: false
};

const findRoutes = async (dir)=>{
    let routes = [];
    const files = await fs.readdir(dir);
    for(let i = 0; i < files.length; i++){
        if(files[i] === "index.html") routes.push(dir);
        if(!files[i].includes(".")) routes = routes.concat(await findRoutes(`${dir}/${files[i]}`));
    }

    return routes;
}

const bundleJS = async (dir)=>{
    esbuildOptions.entryPoints = [`${dir}/index.js`];
    esbuildOptions.outfile = `${dir}/temp.js`;
    await esbuild.build(esbuildOptions);
    let js = await fs.readFile(`${dir}/temp.js`, "utf8");
    js = `<script>${js}</script>`;
    fs.unlink(`${dir}/temp.js`, (err)=>{if(err)console.error(err)});
    return js;
}

const bundle = async (filepath)=>{
    const file = await fs.readFile(filepath, "utf8");
    let newFile = "";
    for(let i = 0; i < file.length; i++){
        if(file[i] === "<"){
            if(file.substring(i+1, i+5) === "Comp"){
                let j = 6;
                while(file[i+j] !== ">"){
                    j++;
                }

                let component = file.substring(i+1, i+j);
                component = component.replace("Comp=", "");
                component = component.replaceAll('"', "");
                newFile += await bundle(`${path.parse(filepath).dir}/${component}`);

                i += j;
            }else if(file.substring(i+1, i+3) === "js"){
                newFile += await bundleJS(path.parse(filepath).dir);
                i += 3;
            }else{
                newFile += file[i];
            }
        }else{
            newFile += file[i];
        }
    }

    return newFile;
}

const build = async (route)=>{
    const newFile = await bundle(`${route}/index.html`);

    await fs.mkdir(`${route.replace("routes", "build")}`, {recursive: true});
    let createdFile = `${route.replace("routes", "build")}/index.html`;
    await fs.writeFile(createdFile, newFile);
    return createdFile;
}

const htmlbuild = async (options)=>{
    const app = express();
    app.use(compression());

    const routes = await findRoutes(`${__dirname}/routes`);
    for(let i = 0; i < routes.length; i++){
        const routeFile = await build(routes[i]);
        app.get(routes[i].replace(`${__dirname}/routes`, ""), (req, res)=>{res.sendFile(routeFile)});
    }

    app.listen(8080);
}

console.time("htmlbuild");
htmlbuild();
console.timeEnd("htmlbuild");

module.exports = htmlbuild;
