const telegraf = require('telegraf')
const debug = require('debug')
const express = require('express')
const orgmanager = require('@orgmanager/node-orgmanager-api')

const tg_token = process.env.telegram_token
const group_link = process.env.telegram_link
const bot_username = process.env.bot_username
const channel_id = process.env.tg_channel
const bot = new telegraf(tg_token)

const app = express();
const webhook_url = process.env.webhook_url
const webhook_port = process.env.webhook_port
const secret_path = process.env.webhook_path
bot.telegram.setWebhook(webhook_url, null);
app.use(bot.webhookCallback(secret_path));
app.get('/', (req, res) => {
	res.send('Hello World!')
})
app.listen(webhook_port, (port) => {
	console.log(`Express server is listening on ${port}`);
})
//bot.startPolling()

const orgm_token = process.env.orgmanager_token
const orgm_id = process.env.orgmanager_id
const client = new orgmanager(orgm_token)

function about (ctx) {
	const about_text = `
Bem vindo(a) ao grupo *Desenvolvimento de Bots*.

• [Regras](https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#regras).
• [Ferramentas](https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#ferramentas) (Frameworks / SDK / Wrapper para Telegram / APIs / Hospedagem).
• [Tutoriais](https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#tutoriais).

👥 [Projetos criado pela comunidade](https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#desenvolvimento-de-bots).
📝 [Quero colocar meu projeto ou um novo link](https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots/edit/master/README.md).
	`

	if (ctx) {
		ctx.reply(`
${about_text}
🐱 Para entrar na Organização no Github use o comando \`/github SeuUserNome\` em um chat privado com o bot do grupo (${bot_username}).
		`, {parse_mode: 'Markdown'})
	} else {
		bot.telegram.sendMessage(channel_id, about_text, {
			parse_mode: 'Markdown'
		})

		bot.telegram.sendMessage(channel_id, `*GRUPO* [‌](${group_link})`, {
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard:[[
					{
						text: 'Entrar no Grupo',
						url: `t.me/${bot_username}?start=join`
					}
				]]
			}
		})
	}
}

bot.on('callback_query', (ctx) => {
	var call_data = ctx.update.callback_query.data
	if (call_data) {
		if (call_data == 'join:falid') {
			ctx.editMessageText(`
Deveria ter lido as regras! Esse sistema foi criado para pessoas como você...
O grupo é para programadores ou iniciantes, mas não para tirar duvidas de criadores de bot autônomos como ManyBot, Chatfuel entre outros. Sinto muito :(
			`)
		} else if (call_data == 'join:nda') {
			ctx.editMessageText(`
Seja bem vindo(a)!
Link do grupo: <a href="${group_link}">${group_link}</a>

Pedimos que leia as <a href="https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#regras">regras aqui [X]</a>
Você também pode obter <a href="https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#ferramentas">tutoriais</a> e <a href="https://github.com/DesenvolvimentoDeBots/DesenvolvimentoDeBots#tutoriais">ferramentas</a> nessa mesma lista.

Use esse outro link para manda para seus amigos:
https://t.me/DesenvolvimentoDeBots
			`, {parse_mode: 'HTML'})
		} else if (call_data == 'join:programig') {
			ctx.editMessageText(`
Seja bem vindo(a)!
Link do grupo: <a href="${group_link}">${group_link}</a>

Use esse outro link para manda para seus amigos:
https://t.me/DesenvolvimentoDeBots
			`, {parse_mode: 'HTML'})
		}
	}
})

bot.command('ping', (ctx) => {
	ctx.replyWithMarkdown('*Pong*!')
})

bot.hears(/^\/[start]*\s*join/i, (ctx) => {
	ctx.reply('Seu bot é feito em?', {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard:
			[
				[{
					text: 'Manybot/Chatfuel/Outros do tipo.',
					callback_data: 'join:falid'
				}],
				[{
					text: 'Uma liguagem de programação.',
					callback_data: 'join:programig'
				}],
				[{
					text: 'Ainda não tenho um bot.',
					callback_data: 'join:nda'
				}]
			]
		}
	})
})

bot.hears(/^\/github (.*)/i, (ctx) => {
	client.joinOrg(orgm_id, ctx.match[1])
	ctx.reply('Feito! Veja seu email!')
})

bot.command('sobre', (ctx) => {
	about(ctx)
})

bot.command('about', (ctx) => {
	about(ctx)
})

bot.command('pin', (ctx) => {
	if (ctx.update.message.chat.id.toString() == '89198119') { //Tiago Danin user
		about(false)
	}
})

function help_show(ctx) {
	ctx.reply(`
Lista de commandos.
- /sobre - Sobre do grupo.
- /help - Lista de comandos.
- /join - Comando para entrar no grupo.
- /github - Comando para entrar na organização do Github.
	`)
}

bot.command('ajuda', (ctx) => {
	help_show(ctx)
})

bot.help((ctx) => {
	help_show(ctx)
})

bot.start((ctx) => {
	help_show(ctx)
})
