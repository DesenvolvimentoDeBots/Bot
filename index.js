const telegraf = require('telegraf')
const debug = require('debug')
const orgmanager = require('@orgmanager/node-orgmanager-api')

const tg_token = process.env.telegram_token
const group_link = process.env.telegram_link
const bot_username = process.env.bot_username
const channel_id = process.env.tg_channel
const group_id = process.env.group_id
const bot = new telegraf(tg_token)

const orgm_token = process.env.orgmanager_token
const orgm_id = process.env.orgmanager_id
const client = new orgmanager(orgm_token)

function about (ctx) {
	const about_text = `
Bem vindo(a) ao grupo *Desenvolvimento de Bots*.

• [Visualização no Site](https://desenvolvimentodebots.github.io/)

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
		bot.telegram.sendMessage(group_id, about_text, {
			parse_mode: 'Markdown',
			disable_web_page_preview: true
		})
		bot.telegram.sendMessage(channel_id, about_text, {
			parse_mode: 'Markdown',
			disable_web_page_preview: true
		}).then(() => {
			bot.telegram.sendMessage(channel_id, `*GRUPO* [‌](${group_link})`, {
				parse_mode: 'Markdown',
				reply_markup: {
					inline_keyboard:[[
						{
							text: 'Entrar no Grupo',
							url: group_link
						}
					]]
				}
			})
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
- /ajuda - Lista de comandos.
- /sobre - Sobre do grupo.
- /regras - Regras do grupo.
- /link - Link do groupo.
- /github [SeuUserNome] - Comando para entrar na organização do Github.
- /source - Url do repositório do Bot
	`)
}

bot.command(['help', 'ajuda'], (ctx) => {
	help_show(ctx)
})

bot.command('source', (ctx) => {
	ctx.reply('Código Fonte: https://github.com/DesenvolvimentoDeBots/Bot/')
})

bot.command('link', (ctx) => {
	ctx.replyWithMarkdown(`• *Grupo* [Desenvolvimento De Bots](${group_link})`)
})

bot.command(['rules', 'regras', 'regra'], (ctx) => {
	ctx.replyWithMarkdown(`[Seguimos o seguinte código de conduta (github.com/brazil-it-groups/code-of-conduct)](https://github.com/brazil-it-groups/code-of-conduct)
E também, discussão sobre ManyBot, Chatfuel entre outros criadores de bot autônomos não é permito.
	`)
})

bot.start((ctx) => {
	help_show(ctx)
})

bot.startPolling()
