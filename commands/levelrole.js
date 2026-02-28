const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Database = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelrole')
        .setDescription('🎭 Manage role untuk level tertentu')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah role untuk level tertentu')
            .addRoleOption(opt => opt.setName('role').setDescription('Role yang akan diberikan').setRequired(true))
            .addIntegerOption(opt => opt.setName('level').setDescription('Level requirement').setRequired(true).setMinValue(1).setMaxValue(100)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus role untuk level tertentu')
            .addIntegerOption(opt => opt.setName('level').setDescription('Level yang ingin dihapus').setRequired(true).setMinValue(1).setMaxValue(100)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat semua level role')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        
        switch (subcommand) {
            case 'add':
                const role = interaction.options.getRole('role');
                const level = interaction.options.getInteger('level');
                
                // Cek posisi role
                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return await this.sendEmbed(interaction, '❌ Error', 'Role bot harus lebih tinggi dari role yang ingin diberikan!', config.COLORS.ERROR);
                }
                
                Database.addLevelRole(guildId, level, role.id);
                await this.sendEmbed(interaction, '✅ Level Role Ditambahkan', `Level **${level}** → Role **${role.name}**`, config.COLORS.SUCCESS);
                break;
                
            case 'remove':
                const lvl = interaction.options.getInteger('level');
                Database.removeLevelRole(guildId, lvl);
                await this.sendEmbed(interaction, '✅ Level Role Dihapus', `Role untuk level **${lvl}** telah dihapus`, config.COLORS.SUCCESS);
                break;
                
            case 'list':
                const roles = Database.getLevelRoles(guildId);
                const roleEntries = Object.entries(roles);
                
                if (roleEntries.length === 0) {
                    return await this.sendEmbed(interaction, '📋 Level Roles', 'Belum ada level role yang diatur', config.COLORS.INFO);
                }
                
                const description = roleEntries
                    .sort((a, b) => a[0] - b[0])
                    .map(([lvl, roleId]) => {
                        const role = interaction.guild.roles.cache.get(roleId);
                        return `**Level ${lvl}** → ${role ? role.name : 'Role tidak ditemukan'}`;
                    })
                    .join('\n');
                
                await this.sendEmbed(interaction, '📋 Daftar Level Roles', description, config.COLORS.INFO);
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
