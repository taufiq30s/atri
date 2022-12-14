/* eslint-disable indent */
const vndb_service = require('./vndb_service');
const vn_database = require('./vn_database_service');
const embed_maker = require('../helpers/embed');
const logger = require('./logger_service');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js');
const sorryImg = 'https://media.discordapp.net/attachments/889918535139201064/929442009163391036/unknown.png';


const info = async (id, client) => {
    try {
        // Dev Mode
        return ({ embeds: [errorEmbed('Under Development', `Sorry, this feature is under development to make it better than before. We will resolve as soon as possible :pensive:.\n\n\nSincery, \nATRI Developer`, client, sorryImg)] });
        return await vndb_service.getInfo(client, id)
            .then(async (res) => {                
                if (res === null) {
                    return ({ embeds: [errorEmbed('Not Found', 'Sorry, we didn\'t find the vn you are looking for, please check the vn id again.', client)] });
                }
                // Add Download Link
                return await vn_database.download_link(id)
                    .then((vn_download_links) => {
                        if (vn_download_links.en.length > 0 || vn_download_links.jp.length > 0) {
                            res.fields.push({
                                name: '\u200B',
                                value: '**Download Link**',
                            });
                            let links = '';
                            let index;
                            let _provider = '';
                            if (vn_download_links.en.length > 0) {
                                for (const link_data of vn_download_links.en) {
                                    if (_provider != link_data.provider) {
                                        _provider = link_data.provider;
                                        index = 1;
                                    }
                                    links += `[${link_data.provider} ${index}](${link_data.link}) `;
                                    index++;
                                }
                                res.fields.push({
                                    name: 'EN',
                                    value: links,
                                });
                            }
                            if (vn_download_links.jp.length > 0) {
                                links = '';
                                index = 1;
                                _provider = '';
                                for (const link_data of vn_download_links.jp) {
                                    if (_provider != link_data.provider) {
                                        _provider = link_data.provider;
                                        index = 1;
                                    }
                                    links += `[${link_data.provider} ${index}](${link_data.link}) `;
                                    index++;
                                }
                                res.fields.push({
                                    name: 'JP',
                                    value: links,
                                });
                            }
                        }
                        // VN DL Tool
                        const requestDL = new ButtonBuilder()
                                            .setCustomId(`vn-dl-request-${id}`)
                                            .setLabel('Request VN')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(false);
                        const reportDL = new ButtonBuilder()
                                            .setCustomId(`vn-dl-report-${id}`)
                                            .setLabel('Report Link')
                                            .setStyle(ButtonStyle.Secondary)
                                            .setEmoji('????');
                        const VNDownloadTool = new ActionRowBuilder()
                                    .addComponents([requestDL, reportDL]);
                        return { embeds: [res], ephemeral: false, components: [VNDownloadTool] };
                    });
            });
    }
    catch (err) {
        console.error(err);
        logger.error(err);
    }
};

const search = async (title, client, page = 1) => {
    try {
        // Dev Mode
        return ({ embeds: [errorEmbed('Under Development', `Sorry, this feature is under development to make it better than before. We will resolve as soon as possible :pensive:.\n\n\nSincery, \nATRI Developer`, client, sorryImg)] });
        return await vndb_service.findByTitle(client, title, page)
            .then((res) => {
                if (res == null) {
                    return ({ embeds: [errorEmbed('Not Found', 'Sorry, we didn\'t find the vn you are looking for, please try with another keyword.', client)] });
                }
                // Pagination Button
                const nextPageBtn = new ButtonBuilder()
                                        .setCustomId(`${title}-next-page-${page + 1}`)
                                        .setLabel('Next')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(!res.next_page);
                const prevPageBtn = new ButtonBuilder()
                                        .setCustomId(`${title}-prev-page-${page - 1}`)
                                        .setLabel('Previous')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled((page == 1) ? true : false);
                const paginationBtns = new ActionRowBuilder()
                            .addComponents([prevPageBtn, nextPageBtn]);
                // Search Result Options Menu
                const options = new ActionRowBuilder()
                        .addComponents(
                            new SelectMenuBuilder()
                                .setCustomId('selected-result')
                                .setPlaceholder('Please Select a Visual Novel')
                                .addOptions(res.items),
                        );
                return { embeds: [res.results], ephemeral: false, components: [paginationBtns, options], fetchReply: true };
            });
    }
    catch (err) {
        console.error(err);
        logger.error(err);
    }
};

const request = async (id, title, client) => {
    try {
        return await client.channels.cache.get(process.env.VNL_REQUEST_CHANNEL_ID).send({ embeds: [embed_maker.embed(client.user.avatarURL(), 'Request Visual Novel', `**${title}**\nLink\n[https://vndb.org/v${id}](https://vndb.org/v${id})`, 0x325aab, `https://vndb.org/v${id}`)] });
    }
    catch (err) {
        console.error(err);
        logger.error(err);
    }
};

const report = async (id, title, link, reason, client) => {
    try {
        return await client.channels.cache.get(process.env.VNL_REPORT_CHANNEL_ID).send({ embeds: [embed_maker.embed(client.user.avatarURL(), 'Report Visual Novel', `**${title}**\nVNDB Link : [https://vndb.org/v${id}](https://vndb.org/v${id})\nLink Name : ${link}\nReason : ${reason}`, 0x325aab, `https://vndb.org/v${id}`)] });
    }
    catch (err) {
        console.error(err);
        logger.error(err);
    }
};

const errorEmbed = (title, message, client, image='') => {
    const body = {
        color: 0xe01212,
        title: title, message,
        author: {
            name: 'ATRI Visual Novel Search Engine',
            icon_url: client.user.avatarURL(),
        },
        description: message,
        timestamp: new Date(),
        footer: {
            text: `ATRI Version: ${process.env.VERSION}`,
        }
    };
    if(image != '') {
        body.image = {
            url: image
        };
    }
    return body;
};

module.exports = {
    info,
    search,
    request,
    report,
};