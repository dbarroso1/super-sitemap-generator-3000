const fs = require('fs');
const chalk = require('chalk');
const logIt = (mssg) => console.log(`${chalk.blue('[SSG]:')} ${mssg}`);

module.exports = {
    export_to_xml: (title, table) => {
        var site_title = title.toLocaleLowerCase().replace(/[^\w\s]/gi, '').trim().replace(/ /g, "_");
        var serializer = new(require('xmldom')).XMLSerializer;
        var implementation = new(require('xmldom')).DOMImplementation;

        var document = implementation.createDocument('', '', null);
        document.appendChild(document.createElement('?xml version="1.0" encoding="UTF-8"?'));

        var url_set = document.createElement('urlset');
        url_set.setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        document.appendChild(url_set);

        table.forEach((link, index) => {

            var url_elm = document.createElement('url')
            url_set.appendChild(url_elm)

            var url_loc = document.createElement('loc')
            url_elm.appendChild(url_loc)

            var text_node = document.createTextNode(link)
            url_loc.appendChild(text_node)

            if (index == table.length - 1) {
                const path = './dist/' + site_title + '_sitemap.xml';
                const data = serializer.serializeToString(document);
                fs.access(path, fs.F_OK, (err) => {
                    logIt(chalk.cyan(`[XML] `) + "GENERATING XML FILE...");

                    fs.writeFile(path, data, (error) => {
                        if (error) { logIt(error); } else {
                            logIt(chalk.cyan(`[XML] `) + `${err ? "GENERATING NEW XML SITEMAPS . . ." : "EXISTING XML FILE FOUND: " + chalk.yellow("OVERIDING")}`);
                        }
                    });
                });
            };
        });
    },
    export_to_txt: (title, table) => {
        var site_title = title.toLocaleLowerCase().replace(/[^\w\s]/gi, '').trim().replace(/ /g, "_");
        const path = './dist/' + site_title + '_sitemap.txt';
        logIt("EXPORTING AS " + chalk.cyan(`[TXT]`));
        fs.access(path, fs.F_OK, (err) => {
            logIt(chalk.cyan(`[TXT] `) + "GENERATING TXT FILE... ");

            fs.writeFile(path, table, (error) => {
                if (error) { logIt(error); } else {
                    logIt(chalk.cyan(`[TXT] `) + `${err ? "GENERATING NEW TXT SITEMAPS . . ." : "EXISTING TXT FILE FOUND: " + chalk.yellow("OVERIDING")}`);
                };
            })
        })
    }
}