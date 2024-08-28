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

const bundleJSCSS = async (dir, type)=>{
    esbuildOptions.entryPoints = [`${dir}/index.${type}`];
    esbuildOptions.outfile = `${dir}/temp.${type}`;
    await esbuild.build(esbuildOptions);
    let code = await fs.readFile(`${dir}/temp.${type}`, "utf8");
    if(type === "js") code = `<script>${code}</script>`;
    if(type === "css") code = `<style>${code}</style>`;
    fs.unlink(`${dir}/temp.${type}`, (err)=>{if(err)console.error(err)});
    return code;
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
                newFile += await bundleJSCSS(path.parse(filepath).dir, "js");
                i += 3;
            }else if(file.substring(i+1, i+4) === "css"){
                newFile += await bundleJSCSS(path.parse(filepath).dir, "css");
                i += 4;
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

    if(options.minify === true) esbuildOptions.minify = true;

    const routes = await findRoutes(`${__dirname}/routes`);
    for(let i = 0; i < routes.length; i++){
        const routeFile = await build(routes[i]);
        app.get(routes[i].replace(`${__dirname}/routes`, ""), (req, res)=>{res.sendFile(routeFile)});
    }

    app.listen(8000);
}

module.exports = htmlbuild;
