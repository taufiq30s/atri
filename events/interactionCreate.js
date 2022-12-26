import { InteractionType } from 'discord.js';
import vn_search from '../services/vn_search.js';
import logger from '../services/logger_service.js';

export default {
	name: 'interactionCreate',
	async execute(interaction, client) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		logger.info(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		try {
			// Execute Slash Command
			if (interaction.isChatInputCommand()) {
				const command = client.commands.get(interaction.commandName);
				if (!command) return;
				await command.execute(interaction, client);
			}
			else if (interaction.type === InteractionType.ModalSubmit) {
				if (interaction.customId.includes('vn-report-link-modal')) {
					const linkName = interaction.fields.getTextInputValue('report-link-title');
					const reason = interaction.fields.getTextInputValue('report-reason');
					const id = parseInt(interaction.customId.split('-')[4]);
					const title = interaction.customId.split('-')[5];
					await vn_search.report(id, title, linkName, reason, client);
					await interaction.update({ content: 'Your report has been sent.', embeds: [], components: [] });
				}
			}
		}
		catch (err) {
			console.error(err);
			logger.error(err);
			await interaction.reply({
				content: `An Error has occured. ${err}`,
				ephemeral: true,
			});
		}
	},
};