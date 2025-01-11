# Node resume
This project helps to generate a PDF resume based on a JSON file. 

# [Check out my CV as an example](cv.pdf)

## Usage
Just edit the json file in the `data/cv.json`, in a code editor. I used VS Code.
### Step 1
Install dependencies with `npm install`.
### Step 2
Type `npm start` in command line. This will create the pdf version of the cv in the root of the project.

DONE :)

## Making changes to the template

For local development, I've added a dev server that can be launched with the `npm start dev` command. 

### Important
If you make changes to the template, the dev server needs to be re-launhed.

## Used technologies
 * Twig template engine
 * html-pdf
 * Phantom JS
