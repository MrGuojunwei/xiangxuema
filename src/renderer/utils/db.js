const electron = require('electron');
const fs = require('fs-extra')
const path = require('path');
const basePath = path.join(electron.remote.app.getPath('userData'), "/xxm");
var firstTime = false;
if (!fs.existsSync(basePath)) {
    firstTime = true;
    fs.mkdirSync(basePath);
}
const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(basePath, "db")
    },
    log: {
        info(message) {
            console.err(message);
        }
    }
});

const initializer = {
    initTable() {
        return knex.schema.createTable('articles', table => {
            table.increments('id');
            table.string('title');
            table.string('from_url');
            table.datetime('created_at').defaultTo(knex.fn.now());
            table.datetime('updated_at').defaultTo(knex.fn.now());
            table.datetime('visited_at').defaultTo(knex.fn.now());
            table.string('editor_type').defaultTo("html");
        }).createTable('tags', table => {
            table.increments('id');
            table.string('title');
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('article_tag', table => {
            table.increments('id');
            table.integer('tag_id');
            table.integer('article_id');
        }).createTable('settings', (table) => {
            table.increments('id');
            table.integer('autosave_interval');
            table.integer('img_w');
            table.integer('img_h');
            table.string("editor_type").defaultTo("html");
            table.boolean('jna_sync').defaultTo(true);
            table.string('jna_token');
            table.boolean('jna_login_show').defaultTo(false);
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('article_site', (table) => {
            table.increments('id');
            table.integer('article_id');
            table.integer('site_id');
            table.integer('edit_url');
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('flowers', (table) => {
            table.increments('id');
            table.integer('content');
            table.integer('from_url');
            table.datetime('updated_at').defaultTo(knex.fn.now());
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('flower_tag', table => {
            table.increments('id');
            table.integer('tag_id');
            table.integer('flower_id');
        }).createTable('minds', table => {
            table.increments('id');
            table.string('title');
            table.datetime('created_at').defaultTo(knex.fn.now());
            table.datetime('updated_at').defaultTo(knex.fn.now());
            table.datetime('visited_at').defaultTo(knex.fn.now());
        }).createTable('mind_tag', table => {
            table.increments('id');
            table.integer('tag_id');
            table.integer('mind_id');
        })
    },
    initDefaultData() {
        let defaultSetting = {
            autosave_interval: 8,
            img_w: 1300,
            img_h: 800,
            editor_type: 'html',
            jna_sync: true,
        };
        return knex.insert(defaultSetting).into("settings").then();
    },
    extarColumns() {
        knex.schema.hasColumn("articles", "visited_at").then(flag => {
            if (flag) return;
            knex.schema.alterTable('articles', table => {
                table.datetime('visited_at');
            }).then();
        })
        knex.schema.hasColumn("articles", "from_url").then(flag => {
            if (flag) return;
            knex.schema.alterTable('articles', table => {
                table.string('from_url');
            }).then();
        });
        knex.schema.hasTable('flowers').then(flag => {
            if (flag) return
            knex.schema.createTable('flowers', function (table) {
                table.increments('id');
                table.integer('content');
                table.string('from_url');
                table.datetime('updated_at').defaultTo(knex.fn.now());
                table.datetime('created_at').defaultTo(knex.fn.now());
            }).createTable('flower_tag', table => {
                table.increments('id');
                table.integer('tag_id');
                table.integer('flower_id');
            }).then();
        });
        knex.schema.hasTable('minds').then(flag => {
            if (flag) return
            knex.schema.createTable('minds', table => {
                table.increments('id');
                table.string('title');
                table.datetime('created_at').defaultTo(knex.fn.now());
                table.datetime('updated_at').defaultTo(knex.fn.now());
                table.datetime('visited_at').defaultTo(knex.fn.now());
            }).createTable('mind_tag', table => {
                table.increments('id');
                table.integer('tag_id');
                table.integer('mind_id');
            }).then();
        });
    },
    init(cb) {
        if (!firstTime) {
            cb(knex);
            this.extarColumns();
            return;
        }
        this.initTable().then(() => {
            this.initDefaultData().then(() => {
                cb(knex)
            })
        });
    }
}

export default initializer;