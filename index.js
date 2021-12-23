const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange
} = require('@adiwajshing/baileys')
const fs = require('fs')
const axios = require('axios')
const translate = require('translate')
prefix = '/'
blocked = []

async function starts() {
  const client = new WAConnection()
  client.logger.level = 'warn'
  client.on('qr', () => {
  	
  })

  fs.existsSync('./AuthInfo.json') && client.loadAuthInfo('./AuthInfo.json')
  client.on('connecting', () => {
    console.log("[ ! ] Connecting...")
  })
  client.on('open', async () => {
    const id = client.user.jid
    console.log('[ √ ] Connected')
    await client.updatePresence(id, Presence.available) 
  })
  await client.connect({ timeoutMs: 30 * 1000 })
  fs.writeFileSync('./AuthInfo.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
  
  client.on('close', () => {
    console.log("[ X ] Closed")
  })
  
  client.on('group-participants-update', async (anu) => {
  	const getBuffer = async (url, options) => {
		try {
			options ? options : {}
			const res = await axios({
				method: "get",
				url,
				headers: {
					'DNT': 1,
					'Upgrade-Insecure-Request': 1
				},
				...options,
				responseType: 'arraybuffer'
			})
			return res.data
		} catch (e) {
			console.log(`Error : ${e}`)
		}
	}
    try {
      const mdata = await client.groupMetadata(anu.jid)
      console.log(anu)
      if (anu.action == 'add') {
        num = anu.participants[0]
        try {
          ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
        } catch {
          ppimg = 'https://i.ibb.co/Gp4H47k/7dba54f7e250.jpg'
        }
        teks = `Hello @${num.split('@')[0]}\nWelcome to the Group *${mdata.subject}*`
        let buff = await getBuffer(ppimg)
        client.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { "mentionedJid": [num] } })
      } else if (anu.action == 'remove') {
        num = anu.participants[0]
        try {
          ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`)
        } catch {
          ppimg = 'https://i.ibb.co/Gp4H47k/7dba54f7e250.jpg'
        }
        teks = `Good Bye @${num.split('@')[0]}👋`
        let buff = await getBuffer(ppimg)
        client.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { "mentionedJid": [num] } })
      }
    } catch (e) {
      console.log('Error : '+e)
    }
  })

  client.on('CB:Blocklist', json => {
    if (blocked.length > 2) return
    for (let i of json[1].blocklist) {
      blocked.push(i.replace('c.us', 's.whatsapp.net'))
    }
  })

  client.on('chat-update', async (mek) => {
    try {
      if (!mek.hasNewMessage) return
      mek = JSON.parse(JSON.stringify(mek)).messages[0]
      if (!mek.message) return
      if (mek.key && mek.key.remoteJid == 'status@broadcast') return
      if (mek.key.fromMe) return
      global.prefix
      global.blocked
      const content = JSON.stringify(mek.message)
      const from = mek.key.remoteJid
      const type = Object.keys(mek.message)[0]
      const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
      body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
      budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const isCmd = body.startsWith(prefix)

      mess = {
        wait: ' In Process ',
        success: '✔️ Success ✔️',
        error: {
          stick: '❌ Failed, an error occurred while converting the image to a sticker ❌',
          Iv: '❌ Invalid Link ❌',
          tr: '❌Please put your country language code❌'
        },
        only: {
          group: '❌ This command can only be used within groups ❌',
          ownerG: '❌ This command can only be used by the group owner ❌',
          ownerB: '❌ This command can only be used by the bot owner ❌',
          admin: '❌ This command can only be used by group admins ❌',
          Badmin: '❌ You have to make me admin ❌',
          aboutbot: `*[ INFO BOT ] :*
          *Name* : *Kitsunee Bot*
          *System* : *NodeJs*
          *Kernel* : *ARM7*
          *VM* : *Linux*
          
*[ INFO OWNER ] :*
          *Name* : *ZenxDev*
          *DevTeam* : *UStudio*
          `
        }
      }
      
      const getGroupAdmins = (participants) => {
	    admins = []
	    for (let i of participants) {
		  i.isAdmin ? admins.push(i.jid) : ''
	    }
	    return admins
      }
      
      const botNumber = client.user.jid
      const ownerNumber = ["60189762675@s.whatsapp.net"] // replace this with your number
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? mek.participant : mek.key.remoteJid
      const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupId = isGroup ? groupMetadata.jid : ''
      const groupMembers = isGroup ? groupMetadata.participants : ''
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
      const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
      const isGroupAdmins = groupAdmins.includes(sender) || false
      const isOwner = ownerNumber.includes(sender)
      const isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
      }
      const reply = (teks) => {
        client.sendMessage(from, teks, text, { quoted: mek })
      }
      const sendMess = (hehe, teks) => {
        client.sendMessage(hehe, teks, text)
      }
      const mentions = (teks, memberr, id) => {
        (id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, { contextInfo: { "mentionedJid": memberr } }) : client.sendMessage(from, teks.trim(), extendedText, { quoted: mek, contextInfo: { "mentionedJid": memberr } })
      }

      colors = ['red', 'white', 'black', 'blue', 'yellow', 'green']
      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', 'Message from', sender.split('@')[0], 'args :', args.length)
      if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', 'Message from', sender.split('@')[0], 'args :', args.length)
      if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', 'Message from', sender.split('@')[0], 'in', groupName, 'args :', args.length)
      if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', 'Message from', sender.split('@')[0], 'in', groupName, 'args :', args.length)
      switch (command) {
        case 'menu':
          client.updatePresence(from, Presence.composing)
          const rows = [
 			{title: '/menu', rowId:"rowid1"},
			 {title: '/info', rowId:"rowid2"},
			 {title: '/clearall', rowId:"rowid3"}
		  ]

		  const sections = [{title: "Section Menu", rows: rows}]

		  const button = {
		  buttonText: 'Menu',
		  description: "[ ! ] Kitsunee Bot Menu [ ! ]",
		  sections: sections,
		  listType: 1
		  }

		  client.sendMessage(from, button, MessageType.listMessage)
          break
         
         case 'tr':
           if (!isGroup) return
           if (args === null) return reply(mess.error.tr)
           if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
           async function translator(str, trTo){
           	translate.engine = "libre"
               const data = await translate(str, trTo)
               reply(data)
           }
           mentionedText = mek.message.extendedTextMessage.contextInfo.mentionJid
           translator(mentionedText, args)
           break
         
        case 'closegc':
          client.updatePresence(from, Presence.composing)
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          var nomor = mek.participant
          const close = {
            text: `Group closed admin @${nomor.split("@s.whatsapp.net")[0]}\now *only admin* can send messages`,
            contextInfo: { mentionedJid: [nomor] }
          }
          client.groupSettingChange(from, GroupSettingChange.messageSend, true);
          reply(close)
          break
        case 'opengc':
          client.updatePresence(from, Presence.composing)
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          open = {
            text: `Group opened By admin @${sender.split("@")[0]}\now *all participants* can send messages`,
            contextInfo: { mentionedJid: [sender] }
          }
          client.groupSettingChange(from, GroupSettingChange.messageSend, false)
          client.sendMessage(from, open, text, { quoted: mek })
          break
        case 'setprefix':
          if (args.length < 1) return
          if (!isOwner) return reply(mess.only.ownerB)
          prefix = args[0]
          reply(`The prefix has been successfully changed to : ${prefix}`)
          break
        case 'tagall':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `*#* @${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          mentions(teks, members_id, true)
          break
        case 'tagall2':
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `╠➥ @${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          reply(teks)
          break
        case 'tagall3':
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `╠➥ https://wa.me/${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          client.sendMessage(from, teks, text, { detectLinks: false, quoted: mek })
          break
        case 'clearall':
          if (!isOwner) return reply('Who are you?')
          anu = await client.chats.all()
          client.setMaxListeners(25)
          for (let _ of anu) {
            client.deleteChat(_.jid)
          }
          reply('Successfully deleted all chat :)')
          break
        case 'bc':
          if (!isOwner) return reply('Hello Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'gm':
          if (!isOwner) return reply('Good Morning Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'gn':
          if (!isOwner) return reply('Good Night Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'promote':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Successfully promoted\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(from, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Successfully promoted @${mentioned[0].split('@')[0]} as a group admin!`, mentioned, true)
            client.groupMakeAdmin(from, mentioned)
          }
          break
        case 'demote':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Successfully demoted\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(teks, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Successfully demoted @${mentioned[0].split('@')[0]} as a Member of the Group!`, mentioned, true)
            client.groupDemoteAdmin(from, mentioned)
          }
          break
        case 'add':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (args.length < 1) return reply('Do you want to add a number?')
          if (args[0].startsWith('08')) return reply('Use the country code')
          try {
            num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
            client.groupAdd(from, [num])
          } catch (e) {
            console.log('Error :', e)
            reply('Failed to add target, maybe because it\'s private')
          }
          break
        case 'kick':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('The target tag you want to kick!')
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Orders received, issued :\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(teks, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Orders received, issued : @${mentioned[0].split('@')[0]}`, mentioned, true)
            client.groupRemove(from, mentioned)
          }
          break
        case 'listadmins':
          if (!isGroup) return reply(mess.only.group)
          teks = `List admin of group *${groupMetadata.subject}*\nTotal : ${groupAdmins.length}\n\n`
          no = 0
          for (let admon of groupAdmins) {
            no += 1
            teks += `[${no.toString()}] @${admon.split('@')[0]}\n`
          }
          mentions(teks, groupAdmins, true)
          break
        case 'linkgroup':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          linkgc = await client.groupInviteCode(from)
          reply('https://chat.whatsapp.com/' + linkgc)
          break
        case 'info':
          reply(mess.only.aboutbot)
          break
        case 'clone':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (args.length < 1) return reply('Tag the target you want to clone profile pic of ? ')
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag cvk')
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]
          let { jid, id, notify } = groupMembers.find(x => x.jid === mentioned)
          try {
            pp = await client.getProfilePicture(id)
            buffer = await getBuffer(pp)
            client.updateProfilePicture(botNumber, buffer)
            mentions(`Profile photo successfully updated using @${id.split('@')[0]}(Our Victim's) Profile pic...`, [jid], true)
          } catch (e) {
            reply('Failed')
          }
          break
      }
    } catch (e) {
      console.log('Error : '+e)
    }
  })
}
starts()