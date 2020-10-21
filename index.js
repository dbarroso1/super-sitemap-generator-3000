const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const readline = require("readline");
const ora = require('ora');

const options = require('./lib/config.json')
const exporter = require('./lib/exporter')
const logIt = (mssg) => console.log(`${chalk.blue('[SSG]:')} ${mssg}`);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const export_list = ['XML', 'TXT']

/* THE DOMAIN TO CRAWL THROUGH */
const DOMAIN = options.DOMAIN;

var link_table = [];
var pass = 0;

console.log(chalk.blue(`/====================================================/`))
console.log("           THE SUPER SITEMAP GENERATOR 3000            ")
console.log(chalk.blue(`/====================================================/`))

export_question();

function export_question() {
    return new Promise(done => {
        rl.question(chalk.blue('[SSG]: ') + chalk.cyan("URL: "), function(url) {
            options.DOMAIN = url;
            logIt(chalk.green("URL HAS BEEN SET"))
            rl.question(chalk.blue('[SSG]: ') + chalk.cyan("EXPORT AS (XML, TXT): "), function(name) {
                var valid_export = export_list.find(x => x === name)
                if (valid_export) {
                    options.EXPORTS = [name];
                    initCrawler();
                } else {
                    logIt(chalk.yellow('WARNING: INVALID EXPORT TYPE'))
                    export_question()
                }
            })

        });
    })
};

function initCrawler() {
    logIt(chalk.green('SITE CRAWLER HAS STARTED . . .'));
    console.log(chalk.blue("==================================="));
    fetchData(DOMAIN).then((res) => parseData(res));
};

async function parseData(res) {
    const html = res.data;
    const $ = cheerio.load(html);
    const site_title = $('head').find('title').text();
    const anchor_table = $('body').find('a');
    anchor_table.each((index, el) => {
        var link = $(el).attr('href');
        if (link && link != '#') {
            var exists = link_table.find(l => l === DOMAIN + link.replace('/', ''));
            var url = '';
            if (link.indexOf("http://") == 0 || link.indexOf("https://") == 0) { url = link; } else { url = DOMAIN + link.replace('/', ''); }
            if (!exists) link_table.push(url);
        }
        if (index === anchor_table.length - 1) {
            link_table.sort(function(a, b) { return a.length - b.length; });
            logIt('TOTAL OF ' + chalk.green(link_table.length) + " LINKS FOUND")
            options.EXPORTS.forEach(exp => {
                switch (exp) {
                    case 'XML':
                        exporter.export_to_xml(site_title, link_table);
                        break;
                    case 'TXT':
                        exporter.export_to_txt(site_title, link_table);
                        break;
                }
            });
            setTimeout(() => {
                logIt("ONE MOMENT AS WE CLEAN THINGS UP....");
            }, 1000);
            setTimeout(() => {
                rl.close();
            }, 3000);

        }
    });
}
async function fetchData(url) {
    pass++
    var crawl = ora(`CRAWLING: ${chalk.yellow(url)}`).start();
    let response = await axios(url).catch((err) => console.log(err));
    if (response.status !== 200) { crawl.fail(`ERROR FETCHING WEBPAGE`); return; } else { crawl.succeed(`DONE CRAWLING`) }
    console.log(chalk.blue("==================================="));

    return response;
}

rl.on("close", function() {
    console.log(chalk.blue("/====================================================/"));
    console.log("               SSG FINISHED: " + chalk.green("SUCCESFULLY") + "           ");
    console.log(chalk.blue("/====================================================/"));
    process.exit(0);
});