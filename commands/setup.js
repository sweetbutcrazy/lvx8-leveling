const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Database = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('⚙️ Konfigurasi sistem leveling server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('xp')
            .setDescription('Set XP per message')
            .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah XP').setRequired(true).setMinValue(1).setMaxValue(100)))
        .addSubcommand(sub => sub
            .setName('cooldown')
            .setDescription('Set cooldown antar pesan')
            .addIntegerOption(opt => opt.setName('seconds').setDescription('Detik cooldown').setRequired(true).setMinValue(1).setMaxValue(60)))
        .addSubcommand(sub => sub
            .setName('channel')
            .setDescription('Set channel untuk notifikasi level up')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan')))
        .addSubcommand(sub => sub
            .setName('message')
            .setDescription('Set custom message level up')
            .addStringOption(opt => opt.setName('text').setDescription('Pesan (gunakan {user} untuk mention)').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('toggle')
            .setDescription('Aktifkan/nonaktifkan fitur')
            .addBooleanOption(opt => opt.setName('levelupmessage').setDescription('Notifikasi level up'))
            .addBooleanOption(opt => opt.setName('giverole').setDescription('Auto give role'))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        
        switch (subcommand) {
            case 'xp':
                const xp = interaction.options.getInteger('amount');
                Database.setGuildSettings(guildId, 'xpPerMessage', xp);
                await this.sendEmbed(interaction, '✅ XP Berhasil Diatur', `XP per message: **${xp}**`, config.COLORS.SUCCESS);
                break;
                
            case 'cooldown':
                const cd = interaction.options.getInteger('seconds');
                Database.setGuildSettings(guildId, 'cooldown', cd * 1000);
                await this.sendEmbed(interaction, '✅ Cooldown Berhasil Diatur', `Cooldown: **${cd} detik**`, config.COLORS.SUCCESS);
                break;
                
            case 'channel':
                const channel = interaction.options.getChannel('channel');
                Database.setGuildSettings(guildId, 'levelChannel', channel ? channel.id : null);
                await this.sendEmbed(interaction, '✅ Channel Berhasil Diatur', channel ? `Notifikasi akan dikirim ke ${channel}` : 'Notifikasi akan dikirim di channel yang sama', config.COLORS.SUCCESS);
                break;
                
            case 'message':
                const msg = interaction.options.getString('text');
                Database.setGuildSettings(guildId, 'customLevelUpMessage', msg);
                await this.sendEmbed(interaction, '✅ Pesan Custom Berhasil Diatur', `Pesan: \`${msg}\``, config.COLORS.SUCCESS);
                break;
                
            case 'toggle':
                const lvlMsg = interaction.options.getBoolean('levelupmessage');
                const giveRole = interaction.options.getBoolean('giverole');
                
                if (lvlMsg !== null) Database.setGuildSettings(guildId, 'levelUpMessage', lvlMsg);
                if (giveRole !== null) Database.setGuildSettings(guildId, 'giveRole', giveRole);
                
                await this.sendEmbed(interaction, '✅ Fitur Berhasil Diatur', `Notifikasi: ${lvlMsg !== null ? (lvlMsg ? 'ON' : 'OFF') : 'Tidak berubah'}\nAuto Role: ${giveRole !== null ? (giveRole ? 'ON' : 'OFF') : 'Tidak berubah'}`, config.COLORS.SUCCESS);
                break;
        }
    },
    
    async sendEmbed(interaction, title, description, color) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: 'Leveling System Pro' });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
