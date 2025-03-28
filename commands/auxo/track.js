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
                await interaction.editReply("You need to set up your initial weight and goal first! Use /setweight.");
                return;
            }

            const weight = interaction.options.getInteger('weight');
            const today = new Date().toLocaleString();

            let rank = user.rank || "Bronze"; // Store old rank
            let fp = user.fp || 0;  // Fitness Points (FP)
            let message = "";

            // Track previous weight (from the history)
            let prevWeight = user.history.length > 0 ? user.history[user.history.length - 1].weight : null;

            // **Reward or Penalty Logic based on weight change**
            if (prevWeight !== null) {
                const weightChange = prevWeight - weight;  // Calculate the weight change (positive means weight lost, negative means weight gained)

                if (weightChange !== 0) {
                    // Weight loss or gain (change in weight)
                    const fpChange = Math.abs(weightChange) * 5;  // 5 FP per pound change

                    if (weightChange > 0) {
                        // Weight loss (progress)
                        fp += fpChange;  // Gain FP for weight lost
                        message = `⭐ You've lost **${weightChange} lbs**! Gained **${fpChange} FP**! Keep it up!`;
                    } else if (weightChange < 0) {
                        // Weight gain (penalty)
                        fp -= fpChange;  // Lose FP for weight gained
                        message = `⚠️ You've gained **${Math.abs(weightChange)} lbs**! Lost **${fpChange} FP**! Stay on track!`;
                    }
                }
            }

            // Ensure FP doesn't go below 0
            fp = Math.max(fp, 0);

            // Rank Progression Logic
            if (fp >= 100) {
                // Rank up and reset FP to 0
                fp = 0;
                rank = getNextRank(rank);
                message = `🎉 **Congratulations! You have ranked up to ${rank}!** 🎉\n \n${message}`;
            }

            // **Demotion Logic** - Track backtracking specifically for weight gain
            if (fp <= 0 && rank !== "Bronze") {
                let backtrackCount = 0;

                // Check if the user has gained weight compared to their previous weight
                user.history.forEach(entry => {
                    if (entry.weight < prevWeight) {
                        // User had lost weight in the past, now they're gaining it back
                        backtrackCount++;
                    }
                });

                if (backtrackCount >= 2) {
                    rank = getPreviousRank(rank); // Demote rank if backtracked twice
                    fp = 0;
                    message = "⚠️ You've regressed twice and your rank has been demoted!";
                }
            }

            // **Check if the user has reached their goal**
            if (weight <= user.goal) {
                message = `🎯 **Congratulations! You've reached your goal of ${user.goal} lbs!** 🎉 It's time to set a new goal! Use /setgoal to update your target.`;
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
                        }
                    }
                },
                { new: true } // Return updated document
            );
                
            await interaction.editReply(
                `✅ Saved! Your current weight is **${weight} lbs**.\n \n${message}\n \n🏆 Current Rank: **${rank}** | 🎖️ FP: **${fp}**`
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

// Helper functions to handle rank progression and demotion
function getNextRank(currentRank) {
    const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    const currentRankIndex = ranks.indexOf(currentRank);
    return currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : currentRank;
}

function getPreviousRank(currentRank) {
    const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    const currentRankIndex = ranks.indexOf(currentRank);
    return currentRankIndex > 0 ? ranks[currentRankIndex - 1] : currentRank;
}
