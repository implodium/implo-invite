export const VoteConfig = {
	minimumVoteCount: 5,
	maximumVoteCount: 5,
	message: () => VoteConfig.minimumVoteCount === VoteConfig.maximumVoteCount
		? `Vote Exactly ${VoteConfig.minimumVoteCount} restaurants`
		: `You need to vote between ${VoteConfig.minimumVoteCount} and ${VoteConfig.maximumVoteCount} restaurants`
}
