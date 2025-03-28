const User = require('../../schemas/User');

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'This command can only be executed inside a server',
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply();

            let user = await User.findOne({
                userId: interaction.member.id,
            });

            if (!user) {
                await interaction.editReply("You need to set up your initial weight and goal first! Use `/setweight`.");
                return;
            }

            const weight = interaction.options.getInteger('weight');
            const goal = user.goal;
            const difference = goal - weight;
            const today = new Date().toLocaleString();

            let previousDiff = user.history.length > 0 ? user.history[user.history.length - 1].diff : null;
            let previousRank = user.rank || "Bronze"; // Store old rank
            let fp = user.fp || 0;  // Fitness Points (FP)

            let message = "";

            if (previousDiff !== null) {
                if (Math.abs(difference) < Math.abs(previousDiff)) {
                    fp += 2; // Reward FP for progress
                    message = "⭐ You are getting closer to your goal! Keep it up!";
                } else {
                    fp -= 1; // Penalize FP for regressing
                    message = "⚠️ You are losing rank points! Stay on track!";
                }
            } else {
                message = "🎯 First tracking entry recorded!";
            }

            // **Rank Progression Logic**
            let rank = previousRank;
            if (fp >= 10) rank = "Silver";
            if (fp >= 20) rank = "Gold";
            if (fp >= 40) rank = "Platinum";
            if (fp >= 60) rank = "Diamond";

            // **Check for Rank Up**
            let rankUpMessage = "";
            if (rank !== previousRank) {
                rankUpMessage = `🎉 **Congratulations! You have ranked up to ${rank}!** 🎉\n \n`;
            }

            await User.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $set: { 
                        weight: weight,
                        rank: rank,
                        fp: fp
                    },
                    $push: {
                        history: {
                            date: today,
                            weight: weight,
                            diff: difference
                        }
                    }
                },
                { new: true } // Return updated document
            );
                
            await interaction.editReply(
                `✅ Saved! Your current weight is **${weight} lbs** and your goal is **${goal} lbs**.\n \n${message}\n \n${rankUpMessage}🏆 Current Rank: **${rank}** | 🎖️ FP: **${fp}**`
            );
            
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'track',
        description: 'Update your current weight to receive FP (Fitness Points)',
        options: [
            {
                name: 'weight',
                description: 'Enter your current weight in lbs.',
                required: true,
                minValue: 1,
                type: 4,
            },
        ],
    },
};
