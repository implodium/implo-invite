import { Show } from "solid-js";
import type { PointEntry } from "../../../utils/party/2026/util"

export type VoteResultProps = {
	entries: Map<string, PointEntry[]>
	showIndiviualVotes: boolean
}

function totalCount(entries: PointEntry[]) {
	return entries.reduce((acc, entry) => acc + entry.points, 0);
}

function entryComperator([_1, entries]: [string, PointEntry[]], [_2, otherEntries]: [string, PointEntry[]]) {
	return totalCount(otherEntries) - totalCount(entries)
}

export function VoteResult(props: VoteResultProps) {
	return <div class="vote" style={{ width: '100%' }}>
		<hr/>
		<h2>Vote Results</h2>
		<ul style={{ "list-style": "decimal", "list-style-position": "inside", "line-height": "1.5"}}>
			{
				Array.from(props.entries.entries()).toSorted(entryComperator).map(([restaurant, entries]) => (
					<li>
						{restaurant} [{totalCount(entries)} Points]
					</li>
				))
			}
		</ul>
	</div>

}

