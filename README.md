# htmlbuild

## Overview

htmlbuild is a simple tool to create a front end. Like a framework, but without all the bells and whistles. It allows you to modularize your HTML/JS/CSS and then bundles it all together into a single file to serve. Also, it uses a folder system to create routing automatically for you.

## Routing

Routing in htmlbuild simply uses folder structure. Just create a directory name 'routes'. When htmlbuild runs, it will create routes based on the folder structure in that directory, much like many front-end frameworks. For example, if you have `routes/user/index.html`. Then a route will be created for `/user`. htmlbuild will only create routes for directories that contain an 'index.html' file. So you can create any directory structure you want (forexample, a 'components' directory) and only the directories that contain that 'index.html' file will have a route. 

Parameters are not currently supported, but are coming soon.

The application is automatically run on port 8000.

## Modular HTML

In htmlbuild you can modularize your HTML. To create a component within your HTML, Add a pseudo-tag that contains`Comp=` followed path the relative path to the component. You may include double quotes for the path or not, it is optional. Do not use a trailing slash for the tag. For example:

`<Comp="./components/MyFirstComponent.html">`

This will search for that file and replace that pseudo tag with the contents of the component.

## JS and CSS bundling

htmlbuild uses esbuild for bundling JavaScript and CSS. Use the pseudo-tags `<js>` and `<css>` for the locations to insert your relative JavaScript and CSS. htmlbuild will only create a single JS and a single CSS for each HTML file. However, you can still modularize your code with "require" or "import", esbuild will bundle the files into one file and it will be inserted inside an HTML script/style tag. It is recommended to put `<css>` in the head and `<js>` at the end of the body.

## Options

Currently, the only option is "minify" to minify the JS and CSS when bundling. Simple pass `{minify: true}` to `htmlbuild()`;

More is coming soon.

## Running htmlbuild

## Purpose

The purpose of htmlbuild is to create a super simple front-end system (I hesitate to call it a framework) to create a single, optimized file for each route. All of the HTML, CSS, and JS is bundled into a single file to send to the user for each route. This enables the developer to create many small routes, or a single SPA.

The responsibility of organizing code for each route falls on the developer. To create something like an SPA, the developer must organize their code in a logical manner and htmlbuild takes no opinion on how to do this. Everything is plain HTML/CSS/JS, so there are no complicated steps other than just creating a single file for the user for each route.


